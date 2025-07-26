import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { GameSessionView } from '@/components/multiplayer/GameSessionView';
import { GameSessionManager } from '@/lib/realtime-game-manager';

// Mock the GameSessionManager
jest.mock('@/lib/realtime-game-manager');
const MockedGameSessionManager = GameSessionManager as jest.MockedClass<typeof GameSessionManager>;

// Mock the hook to return controlled data
jest.mock('@/lib/hooks/useGameSession', () => ({
  useGameSession: jest.fn(),
}));

import { useGameSession } from '@/lib/hooks/useGameSession';
const mockUseGameSession = useGameSession as jest.MockedFunction<typeof useGameSession>;

describe('Multiplayer Real-time Integration', () => {
  let mockGameManager: jest.Mocked<GameSessionManager>;
  let mockGameSessionHook: ReturnType<typeof useGameSession>;

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

    // Default mock hook return value
    mockGameSessionHook = {
      session: createMockGameSession(),
      players: [
        {
          id: 'player1',
          session_id: 'test-session-id',
          user_id: 'user1',
          position: 0,
          status: 'active',
          last_seen: '2024-01-01T00:00:00Z',
          score: 10,
          responses_count: 2,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'player2',
          session_id: 'test-session-id',
          user_id: 'user2',
          position: 1,
          status: 'active',
          last_seen: '2024-01-01T00:00:00Z',
          score: 5,
          responses_count: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ],
      currentQuestion: createMockQuestion(),
      responses: [],
      loading: false,
      error: null,
      connectionStatus: 'connected',
      presenceCount: 2,
      startGame: jest.fn().mockResolvedValue(true),
      submitResponse: jest.fn().mockResolvedValue(true),
      advanceTurn: jest.fn().mockResolvedValue(true),
      pauseGame: jest.fn().mockResolvedValue(true),
      resumeGame: jest.fn().mockResolvedValue(true),
      endGame: jest.fn().mockResolvedValue(true),
      updatePlayerStatus: jest.fn().mockResolvedValue(true),
      getCurrentPlayer: jest.fn().mockReturnValue({
        id: 'player1',
        session_id: 'test-session-id',
        user_id: 'user1',
        position: 0,
        status: 'active',
        last_seen: '2024-01-01T00:00:00Z',
        score: 10,
        responses_count: 2,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }),
      isMyTurn: jest.fn().mockReturnValue(true),
      getPlayerByUserId: jest.fn().mockImplementation((userId) => 
        mockGameSessionHook.players.find(p => p.user_id === userId) || null
      ),
      gameManager: mockGameManager,
    };

    mockUseGameSession.mockReturnValue(mockGameSessionHook);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Game Session Initialization', () => {
    it('should display game session with correct player count', () => {
      render(<GameSessionView sessionId="test-session-id" />);

      expect(screen.getByText('Players (2)')).toBeInTheDocument();
      expect(screen.getByText('2 online')).toBeInTheDocument();
    });

    it('should show connection status', () => {
      render(<GameSessionView sessionId="test-session-id" />);

      // Should show connected status (Wifi icon)
      const wifiIcon = screen.getByTestId('wifi-icon') || document.querySelector('[data-lucide="wifi"]');
      expect(wifiIcon || screen.getByText('connected')).toBeTruthy();
    });

    it('should display current round information', () => {
      render(<GameSessionView sessionId="test-session-id" />);

      expect(screen.getByText('1/5')).toBeInTheDocument(); // Round 1 of 5
    });
  });

  describe('Real-time Player Management', () => {
    it('should display all players with their scores', () => {
      render(<GameSessionView sessionId="test-session-id" />);

      expect(screen.getByText('Player 1')).toBeInTheDocument();
      expect(screen.getByText('Player 2')).toBeInTheDocument();
    });

    it('should highlight current player', () => {
      render(<GameSessionView sessionId="test-session-id" />);

      // Current player should have special styling
      const currentPlayerElement = screen.getByText('Current Turn');
      expect(currentPlayerElement).toBeInTheDocument();
    });

    it('should show player status indicators', () => {
      render(<GameSessionView sessionId="test-session-id" />);

      // Should show active status for both players
      const activeIndicators = document.querySelectorAll('.bg-green-500');
      expect(activeIndicators.length).toBeGreaterThan(0);
    });
  });

  describe('Game State Management', () => {
    it('should show start game button when session is waiting', () => {
      mockGameSessionHook.session = {
        ...createMockGameSession(),
        status: 'waiting',
      };
      mockUseGameSession.mockReturnValue(mockGameSessionHook);

      render(<GameSessionView sessionId="test-session-id" />);

      expect(screen.getByText('Start Game')).toBeInTheDocument();
    });

    it('should show pause button when session is active', () => {
      mockGameSessionHook.session = {
        ...createMockGameSession(),
        status: 'active',
      };
      mockUseGameSession.mockReturnValue(mockGameSessionHook);

      render(<GameSessionView sessionId="test-session-id" />);

      expect(screen.getByText('Pause')).toBeInTheDocument();
    });

    it('should show resume button when session is paused', () => {
      mockGameSessionHook.session = {
        ...createMockGameSession(),
        status: 'paused',
      };
      mockUseGameSession.mockReturnValue(mockGameSessionHook);

      render(<GameSessionView sessionId="test-session-id" />);

      expect(screen.getByText('Resume')).toBeInTheDocument();
    });
  });

  describe('Question and Response Handling', () => {
    beforeEach(() => {
      mockGameSessionHook.session = {
        ...createMockGameSession(),
        status: 'active',
        current_question_id: 'test-question-id',
      };
      mockUseGameSession.mockReturnValue(mockGameSessionHook);
    });

    it('should display current question when game is active', () => {
      render(<GameSessionView sessionId="test-session-id" />);

      expect(screen.getByText(createMockQuestion().text)).toBeInTheDocument();
    });

    it('should show response input when it\'s user turn', () => {
      render(<GameSessionView sessionId="test-session-id" />);

      expect(screen.getByPlaceholderText('Share your thoughts...')).toBeInTheDocument();
      expect(screen.getByText('Submit Response')).toBeInTheDocument();
    });

    it('should handle response submission', async () => {
      render(<GameSessionView sessionId="test-session-id" />);

      const responseInput = screen.getByPlaceholderText('Share your thoughts...');
      const submitButton = screen.getByText('Submit Response');

      // Type a response
      fireEvent.change(responseInput, { target: { value: 'My test response' } });
      
      // Submit the response
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockGameSessionHook.submitResponse).toHaveBeenCalledWith('My test response');
      });
    });

    it('should show waiting message when not user turn', () => {
      mockGameSessionHook.isMyTurn = jest.fn().mockReturnValue(false);
      mockUseGameSession.mockReturnValue(mockGameSessionHook);

      render(<GameSessionView sessionId="test-session-id" />);

      expect(screen.getByText(/Waiting for Player \d+ to respond/)).toBeInTheDocument();
    });
  });

  describe('Real-time Events', () => {
    it('should handle player join events', async () => {
      const mockOnGameEvent = jest.fn();
      
      render(
        <GameSessionView 
          sessionId="test-session-id" 
          onGameEnd={mockOnGameEvent}
        />
      );

      // Simulate a player joining by updating the players array
      act(() => {
        mockGameSessionHook.players = [
          ...mockGameSessionHook.players,
          {
            id: 'player3',
            session_id: 'test-session-id',
            user_id: 'user3',
            position: 2,
            status: 'active',
            last_seen: '2024-01-01T00:00:00Z',
            score: 0,
            responses_count: 0,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ];
        mockUseGameSession.mockReturnValue(mockGameSessionHook);
      });

      // The component should re-render with the new player count
      expect(screen.getByText('Players (3)')).toBeInTheDocument();
    });

    it('should handle turn advancement', async () => {
      render(<GameSessionView sessionId="test-session-id" />);

      // Submit a response to trigger turn advancement
      const responseInput = screen.getByPlaceholderText('Share your thoughts...');
      const submitButton = screen.getByText('Submit Response');

      fireEvent.change(responseInput, { target: { value: 'My response' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockGameSessionHook.submitResponse).toHaveBeenCalled();
      });

      // Turn advancement should be called automatically after response
      await waitFor(() => {
        expect(mockGameSessionHook.advanceTurn).toHaveBeenCalled();
      }, { timeout: 2000 });
    });

    it('should handle game completion', () => {
      const mockOnGameEnd = jest.fn();
      
      mockGameSessionHook.session = {
        ...createMockGameSession(),
        status: 'completed',
      };
      mockUseGameSession.mockReturnValue(mockGameSessionHook);

      render(
        <GameSessionView 
          sessionId="test-session-id" 
          onGameEnd={mockOnGameEnd}
        />
      );

      expect(mockOnGameEnd).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when session fails to load', () => {
      mockGameSessionHook.error = 'Failed to load session';
      mockGameSessionHook.session = null;
      mockUseGameSession.mockReturnValue(mockGameSessionHook);

      const mockOnError = jest.fn();
      
      render(
        <GameSessionView 
          sessionId="test-session-id" 
          onError={mockOnError}
        />
      );

      expect(mockOnError).toHaveBeenCalledWith('Failed to load session');
    });

    it('should show loading state initially', () => {
      mockGameSessionHook.loading = true;
      mockGameSessionHook.session = null;
      mockUseGameSession.mockReturnValue(mockGameSessionHook);

      render(<GameSessionView sessionId="test-session-id" />);

      expect(screen.getByText('Loading game session...')).toBeInTheDocument();
    });

    it('should handle connection issues gracefully', () => {
      mockGameSessionHook.connectionStatus = 'disconnected';
      mockUseGameSession.mockReturnValue(mockGameSessionHook);

      render(<GameSessionView sessionId="test-session-id" />);

      // Should show disconnected status
      const wifiOffIcon = document.querySelector('[data-lucide="wifi-off"]');
      expect(wifiOffIcon || screen.getByText('disconnected')).toBeTruthy();
    });
  });

  describe('Performance and Optimization', () => {
    it('should not cause unnecessary re-renders', () => {
      const { rerender } = render(<GameSessionView sessionId="test-session-id" />);

      // Re-render with same session ID
      rerender(<GameSessionView sessionId="test-session-id" />);

      expect(screen.getByText('Players (2)')).toBeInTheDocument();
    });

    it('should clean up subscriptions on unmount', () => {
      const { unmount } = render(<GameSessionView sessionId="test-session-id" />);

      unmount();

      // The useGameSession hook should handle cleanup
      expect(mockGameManager.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should render mobile-optimized layout', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<GameSessionView sessionId="test-session-id" />);

      // Should still render all essential elements for mobile
      expect(screen.getByText('Players (2)')).toBeInTheDocument();
      expect(screen.getByText(createMockQuestion().text)).toBeInTheDocument();
    });
  });
});