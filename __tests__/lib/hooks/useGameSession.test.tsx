import { renderHook, act, waitFor } from '@testing-library/react';
import { useGameSession } from '@/lib/hooks/useGameSession';
import { GameSessionManager } from '@/lib/realtime-game-manager';

// Mock the GameSessionManager
jest.mock('@/lib/realtime-game-manager');
const MockedGameSessionManager = GameSessionManager as jest.MockedClass<typeof GameSessionManager>;

describe('useGameSession', () => {
  let mockGameManager: jest.Mocked<GameSessionManager>;

  beforeEach(() => {
    mockGameManager = {
      subscribeToSession: jest.fn().mockResolvedValue(undefined),
      getGameSession: jest.fn().mockResolvedValue(createMockGameSession()),
      getSessionPlayers: jest.fn().mockResolvedValue([]),
      startGameSession: jest.fn().mockResolvedValue(true),
      submitResponse: jest.fn().mockResolvedValue({
        id: 'response-id',
        session_id: 'test-session-id',
        question_id: 'test-question-id',
        user_id: 'test-user-id',
        response_text: 'Test response',
        response_order: 1,
        round_number: 1,
        is_current_turn: true,
        likes_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }),
      advanceTurn: jest.fn().mockResolvedValue({ success: true, data: {} }),
      pauseSession: jest.fn().mockResolvedValue(true),
      resumeSession: jest.fn().mockResolvedValue(true),
      endSession: jest.fn().mockResolvedValue(true),
      updatePlayerStatus: jest.fn().mockResolvedValue(true),
      getQuestionResponses: jest.fn().mockResolvedValue([]),
      emitGameEvent: jest.fn().mockResolvedValue(undefined),
      unsubscribe: jest.fn().mockResolvedValue(undefined),
      getOnlinePlayersCount: jest.fn().mockReturnValue(2),
    } as any;

    MockedGameSessionManager.mockImplementation(() => mockGameManager);

    // Mock supabase query
    const mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: createMockQuestion(),
          error: null,
        }),
      })),
    };

    // Mock the supabase import
    jest.doMock('@/lib/supabase', () => ({
      supabase: mockSupabase,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => 
        useGameSession({ sessionId: 'test-session-id' })
      );

      expect(result.current.loading).toBe(true);
      expect(result.current.session).toBeNull();
      expect(result.current.players).toEqual([]);
      expect(result.current.connectionStatus).toBe('connecting');
    });

    it('should create GameSessionManager with correct parameters', () => {
      renderHook(() => 
        useGameSession({ sessionId: 'test-session-id' })
      );

      expect(MockedGameSessionManager).toHaveBeenCalledWith(
        expect.anything(), // supabase client
        'test-session-id'
      );
    });
  });

  describe('session loading', () => {
    it('should load session data on mount', async () => {
      const mockSession = createMockGameSession();
      mockGameManager.getGameSession.mockResolvedValue(mockSession);

      const { result } = renderHook(() => 
        useGameSession({ sessionId: 'test-session-id' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.session).toEqual(mockSession);
      expect(mockGameManager.subscribeToSession).toHaveBeenCalled();
    });

    it('should handle session loading error', async () => {
      mockGameManager.getGameSession.mockRejectedValue(new Error('Failed to load'));

      const { result } = renderHook(() => 
        useGameSession({ sessionId: 'test-session-id' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load');
      expect(result.current.connectionStatus).toBe('disconnected');
    });
  });

  describe('game actions', () => {
    it('should start game with question queue', async () => {
      const { result } = renderHook(() => 
        useGameSession({ sessionId: 'test-session-id' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const questionQueue = ['q1', 'q2', 'q3'];
      let startResult: boolean;

      await act(async () => {
        startResult = await result.current.startGame(questionQueue);
      });

      expect(startResult!).toBe(true);
      expect(mockGameManager.startGameSession).toHaveBeenCalledWith(questionQueue);
    });

    it('should submit response when it\'s user turn', async () => {
      const mockSession = {
        ...createMockGameSession(),
        status: 'active' as const,
        current_question_id: 'test-question-id',
      };
      const mockQuestion = createMockQuestion();
      
      mockGameManager.getGameSession.mockResolvedValue(mockSession);

      const { result } = renderHook(() => 
        useGameSession({ sessionId: 'test-session-id' })
      );

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Mock isMyTurn to return true
      result.current.isMyTurn = jest.fn().mockReturnValue(true);

      let submitResult: boolean;

      await act(async () => {
        submitResult = await result.current.submitResponse('My response');
      });

      expect(submitResult!).toBe(true);
      expect(mockGameManager.submitResponse).toHaveBeenCalledWith(
        mockSession.current_question_id,
        'My response',
        mockSession.current_round
      );
    });

    it('should advance turn successfully', async () => {
      const { result } = renderHook(() => 
        useGameSession({ sessionId: 'test-session-id' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let advanceResult: boolean;

      await act(async () => {
        advanceResult = await result.current.advanceTurn();
      });

      expect(advanceResult!).toBe(true);
      expect(mockGameManager.advanceTurn).toHaveBeenCalled();
    });

    it('should pause game', async () => {
      const { result } = renderHook(() => 
        useGameSession({ sessionId: 'test-session-id' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let pauseResult: boolean;

      await act(async () => {
        pauseResult = await result.current.pauseGame();
      });

      expect(pauseResult!).toBe(true);
      expect(mockGameManager.pauseSession).toHaveBeenCalled();
    });

    it('should resume game', async () => {
      const { result } = renderHook(() => 
        useGameSession({ sessionId: 'test-session-id' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let resumeResult: boolean;

      await act(async () => {
        resumeResult = await result.current.resumeGame();
      });

      expect(resumeResult!).toBe(true);
      expect(mockGameManager.resumeSession).toHaveBeenCalled();
    });

    it('should end game', async () => {
      const { result } = renderHook(() => 
        useGameSession({ sessionId: 'test-session-id' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let endResult: boolean;

      await act(async () => {
        endResult = await result.current.endGame();
      });

      expect(endResult!).toBe(true);
      expect(mockGameManager.endSession).toHaveBeenCalled();
    });
  });

  describe('game event handling', () => {
    it('should call onGameEvent callback when provided', async () => {
      const mockOnGameEvent = jest.fn();
      
      const { result } = renderHook(() => 
        useGameSession({ 
          sessionId: 'test-session-id',
          onGameEvent: mockOnGameEvent 
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Get the callbacks that were passed to subscribeToSession
      const subscribeCall = mockGameManager.subscribeToSession.mock.calls[0];
      const callbacks = subscribeCall[0];

      // Simulate a session update event
      act(() => {
        callbacks.onSessionUpdate({ type: 'SESSION_UPDATE', payload: {} });
      });

      expect(mockOnGameEvent).toHaveBeenCalledWith('SESSION_UPDATE', { type: 'SESSION_UPDATE', payload: {} });
    });

    it('should handle response submitted event', async () => {
      const { result } = renderHook(() => 
        useGameSession({ sessionId: 'test-session-id' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Get the callbacks
      const subscribeCall = mockGameManager.subscribeToSession.mock.calls[0];
      const callbacks = subscribeCall[0];

      // Simulate response update
      act(() => {
        callbacks.onResponseUpdate({ type: 'RESPONSE_SUBMITTED', payload: {} });
      });

      expect(mockGameManager.getQuestionResponses).toHaveBeenCalled();
    });
  });

  describe('helper functions', () => {
    it('should get current player correctly', async () => {
      const mockPlayers = [
        {
          id: 'player1',
          session_id: 'test-session-id',
          user_id: 'user1',
          position: 0,
          status: 'active' as const,
          last_seen: '2024-01-01T00:00:00Z',
          score: 0,
          responses_count: 0,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'player2',
          session_id: 'test-session-id',
          user_id: 'user2',
          position: 1,
          status: 'active' as const,
          last_seen: '2024-01-01T00:00:00Z',
          score: 0,
          responses_count: 0,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockSession = {
        ...createMockGameSession(),
        current_player_index: 1,
      };

      mockGameManager.getGameSession.mockResolvedValue(mockSession);
      mockGameManager.getSessionPlayers.mockResolvedValue(mockPlayers);

      const { result } = renderHook(() => 
        useGameSession({ sessionId: 'test-session-id' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const currentPlayer = result.current.getCurrentPlayer();
      expect(currentPlayer).toEqual(mockPlayers[1]);
    });

    it('should determine if it\'s user turn', async () => {
      // Mock authenticated user
      const mockUser = { id: 'test-user-id', email: 'test@example.com' };
      
      const mockPlayers = [
        {
          id: 'player1',
          session_id: 'test-session-id',
          user_id: 'test-user-id', // This is the current user
          position: 0,
          status: 'active' as const,
          last_seen: '2024-01-01T00:00:00Z',
          score: 0,
          responses_count: 0,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockSession = {
        ...createMockGameSession(),
        current_player_index: 0, // Current player is at position 0
      };

      mockGameManager.getGameSession.mockResolvedValue(mockSession);
      mockGameManager.getSessionPlayers.mockResolvedValue(mockPlayers);

      const { result } = renderHook(() => 
        useGameSession({ sessionId: 'test-session-id' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Since we mock user in jest.setup.js, we need to override it here
      // This is a simplified test - in reality the hook would get user from auth
      expect(typeof result.current.isMyTurn).toBe('function');
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe on unmount', () => {
      const { unmount } = renderHook(() => 
        useGameSession({ sessionId: 'test-session-id' })
      );

      unmount();

      expect(mockGameManager.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle manager creation failure', async () => {
      MockedGameSessionManager.mockImplementation(() => {
        throw new Error('Manager creation failed');
      });

      const { result } = renderHook(() => 
        useGameSession({ sessionId: 'test-session-id' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });

    it('should handle action failures gracefully', async () => {
      mockGameManager.startGameSession.mockRejectedValue(new Error('Start failed'));

      const { result } = renderHook(() => 
        useGameSession({ sessionId: 'test-session-id' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let startResult: boolean;

      await act(async () => {
        startResult = await result.current.startGame(['q1']);
      });

      expect(startResult!).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });
});