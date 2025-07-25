import React, { createContext, useContext, useState, useCallback } from 'react';
import { Question, supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { GameState, GameContextType, RoomState } from '@/lib/types';

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

const initialGameState: GameState = {
  mode: null,
  level: 'green',
  currentQuestion: null,
  savedQuestions: [],
  gameSession: {
    playedQuestions: [],
    currentRound: 1,
    totalRounds: 3,
  },
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const setGameMode = useCallback((mode: 'solo' | 'multiplayer') => {
    setGameState((prev) => ({ ...prev, mode }));
  }, []);

  const setLevel = useCallback((level: 'green' | 'yellow' | 'red') => {
    setGameState((prev) => ({ ...prev, level }));
  }, []);

  const setCurrentQuestion = useCallback((question: Question | null) => {
    setGameState((prev) => ({ ...prev, currentQuestion: question }));
  }, []);

  const { user } = useAuth();

  const saveQuestion = useCallback(
    async (question: Question, response?: string, privacy: 'private' | 'shared' = 'private'): Promise<void> => {
      if (!user) return;

      const { data, error } = await supabase.from('saved_questions').insert([
        {
          user_id: user.id,
          question_id: question.id,
          response: response,
          privacy: privacy,
        },
      ]);

      if (error) {
        console.error('Error saving question:', error);
        throw new Error('Failed to save question');
      } else {
        setGameState((prev) => ({
          ...prev,
          savedQuestions: [...prev.savedQuestions, question],
        }));
      }
    },
    [user]
  );

  const markQuestionPlayed = useCallback((questionId: string) => {
    setGameState((prev) => ({
      ...prev,
      gameSession: {
        ...prev.gameSession,
        playedQuestions: [...prev.gameSession.playedQuestions, questionId],
      },
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(initialGameState);
  }, []);

  const setRoom = useCallback((room: RoomState) => {
    setGameState((prev) => ({ ...prev, room }));
  }, []);

  const value = {
    gameState,
    setGameMode,
    setLevel,
    setCurrentQuestion,
    saveQuestion,
    markQuestionPlayed,
    resetGame,
    setRoom,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
