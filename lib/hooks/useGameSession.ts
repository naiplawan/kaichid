import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { User } from '@supabase/supabase-js';
import { GameSessionManager } from '../realtime-game-manager';
import { 
  GameSession, 
  PlayerSession, 
  SessionResponse, 
  Question,
  GameEventCallbacks 
} from '../types';

interface UseGameSessionProps {
  sessionId: string;
  onGameEvent?: (eventType: string, payload: unknown) => void;
}

interface GameSessionState {
  session: GameSession | null;
  players: PlayerSession[];
  currentQuestion: Question | null;
  responses: SessionResponse[];
  loading: boolean;
  error: string | null;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  presenceCount: number;
}

export function useGameSession({ sessionId, onGameEvent }: UseGameSessionProps) {
  const [user, setUser] = useState<User | null>(null);
  const gameManager = useRef<GameSessionManager | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  const [state, setState] = useState<GameSessionState>({
    session: null,
    players: [],
    currentQuestion: null,
    responses: [],
    loading: true,
    error: null,
    connectionStatus: 'connecting',
    presenceCount: 0
  });

  // Initialize game manager
  useEffect(() => {
    if (sessionId && !gameManager.current) {
      gameManager.current = new GameSessionManager(supabase, sessionId);
    }

    return () => {
      if (gameManager.current) {
        gameManager.current.unsubscribe();
        gameManager.current = null;
      }
    };
  }, [sessionId, supabase]);

  // Game event callbacks
  const gameEventCallbacks: GameEventCallbacks = {
    onSessionUpdate: useCallback((payload: unknown) => {
      console.log('Session updated:', payload);
      loadSessionData();
      onGameEvent?.('SESSION_UPDATE', payload);
    }, [onGameEvent]),

    onResponseUpdate: useCallback((payload: unknown) => {
      console.log('Response updated:', payload);
      loadResponses();
      onGameEvent?.('RESPONSE_UPDATE', payload);
    }, [onGameEvent]),

    onPresenceSync: useCallback(() => {
      if (gameManager.current) {
        const presenceCount = gameManager.current.getOnlinePlayersCount();
        setState(prev => ({ ...prev, presenceCount }));
      }
    }, []),

    onPlayerJoin: useCallback((payload: unknown) => {
      console.log('Player joined:', payload);
      loadPlayers();
      onGameEvent?.('PLAYER_JOIN', payload);
    }, [onGameEvent]),

    onPlayerLeave: useCallback((payload: unknown) => {
      console.log('Player left:', payload);
      loadPlayers();
      onGameEvent?.('PLAYER_LEAVE', payload);
    }, [onGameEvent])
  };

  // Load session data
  const loadSessionData = useCallback(async () => {
    if (!gameManager.current) return;

    try {
      const session = await gameManager.current.getGameSession();
      if (session) {
        setState(prev => ({ ...prev, session }));
        
        // Load current question if session is active
        if (session.current_question_id) {
          await loadCurrentQuestion(session.current_question_id);
        }
      }
    } catch (error) {
      console.error('Error loading session data:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load session' 
      }));
    }
  }, []);

  // Load current question
  const loadCurrentQuestion = useCallback(async (questionId: string) => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', questionId)
        .single();

      if (error) throw error;

      setState(prev => ({ ...prev, currentQuestion: data as Question }));
    } catch (error) {
      console.error('Error loading current question:', error);
    }
  }, [supabase]);

  // Load players
  const loadPlayers = useCallback(async () => {
    if (!gameManager.current) return;

    try {
      const players = await gameManager.current.getSessionPlayers();
      setState(prev => ({ ...prev, players }));
    } catch (error) {
      console.error('Error loading players:', error);
    }
  }, []);

  // Load responses for current question
  const loadResponses = useCallback(async () => {
    if (!gameManager.current || !state.currentQuestion) return;

    try {
      const responses = await gameManager.current.getQuestionResponses(state.currentQuestion.id);
      setState(prev => ({ ...prev, responses }));
    } catch (error) {
      console.error('Error loading responses:', error);
    }
  }, [state.currentQuestion]);

  // Initialize real-time subscription
  useEffect(() => {
    if (!gameManager.current || !user) return;

    const initializeSession = async () => {
      setState(prev => ({ ...prev, loading: true, connectionStatus: 'connecting' }));

      try {
        await gameManager.current!.subscribeToSession(gameEventCallbacks);
        await Promise.all([loadSessionData(), loadPlayers()]);
        
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          connectionStatus: 'connected',
          error: null 
        }));
      } catch (error) {
        console.error('Error initializing session:', error);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          connectionStatus: 'disconnected',
          error: error instanceof Error ? error.message : 'Connection failed' 
        }));
      }
    };

    initializeSession();
  }, [user, gameEventCallbacks, loadSessionData, loadPlayers]);

  // Game actions
  const startGame = useCallback(async (questionQueue: string[]): Promise<boolean> => {
    if (!gameManager.current) return false;

    try {
      const success = await gameManager.current.startGameSession(questionQueue);
      if (success) {
        await loadSessionData();
      }
      return success;
    } catch (error) {
      console.error('Error starting game:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to start game' 
      }));
      return false;
    }
  }, [loadSessionData]);

  const submitResponse = useCallback(async (responseText: string): Promise<boolean> => {
    if (!gameManager.current || !state.currentQuestion || !state.session) return false;

    try {
      const response = await gameManager.current.submitResponse(
        state.currentQuestion.id,
        responseText,
        state.session.current_round
      );

      if (response) {
        // Emit response submitted event
        await gameManager.current.emitGameEvent('RESPONSE_SUBMITTED', { response });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error submitting response:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to submit response' 
      }));
      return false;
    }
  }, [state.currentQuestion, state.session]);

  const advanceTurn = useCallback(async (): Promise<boolean> => {
    if (!gameManager.current) return false;

    try {
      const result = await gameManager.current.advanceTurn();
      if (result.success) {
        await loadSessionData();
        
        // Emit turn changed event
        if (result.data && typeof result.data === 'object' && 'next_player_index' in result.data) {
          const data = result.data as { next_player_index: number; question_id: string };
          await gameManager.current.emitGameEvent('TURN_CHANGED', {
            currentPlayerIndex: data.next_player_index,
            questionId: data.question_id
          });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error advancing turn:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to advance turn' 
      }));
      return false;
    }
  }, [loadSessionData]);

  const pauseGame = useCallback(async (): Promise<boolean> => {
    if (!gameManager.current) return false;

    try {
      const success = await gameManager.current.pauseSession();
      if (success) {
        await loadSessionData();
      }
      return success;
    } catch (error) {
      console.error('Error pausing game:', error);
      return false;
    }
  }, [loadSessionData]);

  const resumeGame = useCallback(async (): Promise<boolean> => {
    if (!gameManager.current) return false;

    try {
      const success = await gameManager.current.resumeSession();
      if (success) {
        await loadSessionData();
      }
      return success;
    } catch (error) {
      console.error('Error resuming game:', error);
      return false;
    }
  }, [loadSessionData]);

  const endGame = useCallback(async (): Promise<boolean> => {
    if (!gameManager.current) return false;

    try {
      const success = await gameManager.current.endSession();
      if (success) {
        await loadSessionData();
        
        // Emit game completed event
        await gameManager.current.emitGameEvent('GAME_COMPLETED', {
          sessionId,
          endedAt: new Date().toISOString()
        });
      }
      return success;
    } catch (error) {
      console.error('Error ending game:', error);
      return false;
    }
  }, [sessionId, loadSessionData]);

  const updatePlayerStatus = useCallback(async (status: 'active' | 'inactive' | 'disconnected'): Promise<boolean> => {
    if (!gameManager.current) return false;

    try {
      return await gameManager.current.updatePlayerStatus(status);
    } catch (error) {
      console.error('Error updating player status:', error);
      return false;
    }
  }, []);

  // Get current player info
  const getCurrentPlayer = useCallback((): PlayerSession | null => {
    if (!state.session || !user) return null;
    
    return state.players.find(player => 
      player.position === state.session!.current_player_index
    ) || null;
  }, [state.session, state.players, user]);

  // Check if current user is the active player
  const isMyTurn = useCallback((): boolean => {
    if (!state.session || !user) return false;
    
    const currentPlayer = getCurrentPlayer();
    return currentPlayer?.user_id === user.id;
  }, [state.session, user, getCurrentPlayer]);

  // Get player by user ID
  const getPlayerByUserId = useCallback((userId: string): PlayerSession | null => {
    return state.players.find(player => player.user_id === userId) || null;
  }, [state.players]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (gameManager.current) {
        gameManager.current.unsubscribe();
      }
    };
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    startGame,
    submitResponse,
    advanceTurn,
    pauseGame,
    resumeGame,
    endGame,
    updatePlayerStatus,
    
    // Helpers
    getCurrentPlayer,
    isMyTurn,
    getPlayerByUserId,
    
    // Manager instance (for advanced usage)
    gameManager: gameManager.current
  };
}

export default useGameSession;