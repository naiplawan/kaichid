import { GameSessionManager } from '@/lib/realtime-game-manager';
import { GameEventCallbacks } from '@/lib/types';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null,
    }),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    order: jest.fn().mockReturnThis(),
  })),
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockResolvedValue('SUBSCRIBED'),
    track: jest.fn().mockResolvedValue({}),
    send: jest.fn().mockResolvedValue({}),
    presenceState: jest.fn(() => ({})),
  })),
  removeChannel: jest.fn(),
  rpc: jest.fn().mockResolvedValue({ data: 'test-session-id', error: null }),
};

describe('GameSessionManager', () => {
  let gameManager: GameSessionManager;
  let mockCallbacks: GameEventCallbacks;

  beforeEach(() => {
    gameManager = new GameSessionManager(mockSupabaseClient as any, 'test-session-id');
    mockCallbacks = {
      onSessionUpdate: jest.fn(),
      onResponseUpdate: jest.fn(),
      onPresenceSync: jest.fn(),
      onPlayerJoin: jest.fn(),
      onPlayerLeave: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct session ID and Supabase client', () => {
      expect(gameManager).toBeInstanceOf(GameSessionManager);
    });
  });

  describe('subscribeToSession', () => {
    it('should set up real-time subscription with all callbacks', async () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockResolvedValue('SUBSCRIBED'),
        track: jest.fn().mockResolvedValue({}),
      };
      
      mockSupabaseClient.channel.mockReturnValue(mockChannel);

      await gameManager.subscribeToSession(mockCallbacks);

      expect(mockSupabaseClient.channel).toHaveBeenCalledWith('game_session:test-session-id');
      expect(mockChannel.on).toHaveBeenCalledTimes(5); // All event types
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    it('should unsubscribe from existing subscription before creating new one', async () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockResolvedValue('SUBSCRIBED'),
        track: jest.fn().mockResolvedValue({}),
      };
      
      mockSupabaseClient.channel.mockReturnValue(mockChannel);

      // Subscribe twice
      await gameManager.subscribeToSession(mockCallbacks);
      await gameManager.subscribeToSession(mockCallbacks);

      expect(mockSupabaseClient.removeChannel).toHaveBeenCalled();
    });
  });

  describe('createGameSession', () => {
    it('should create a new game session with correct parameters', async () => {
      const roomId = 'test-room-id';
      const settings = { difficulty: 'medium', rounds: 5 };

      mockSupabaseClient.rpc.mockResolvedValue({ data: 'new-session-id', error: null });
      mockSupabaseClient.from().single.mockResolvedValue({
        data: createMockGameSession(),
        error: null,
      });

      const result = await gameManager.createGameSession(roomId, settings);

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('create_game_session', {
        p_room_id: roomId,
        p_settings: settings,
      });
      expect(result).toBeTruthy();
    });

    it('should return null when creation fails', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: new Error('Creation failed') });

      const result = await gameManager.createGameSession('test-room-id');

      expect(result).toBeNull();
    });
  });

  describe('startGameSession', () => {
    it('should start game session with question queue', async () => {
      const questionQueue = ['q1', 'q2', 'q3'];
      mockSupabaseClient.rpc.mockResolvedValue({ data: true, error: null });

      const result = await gameManager.startGameSession(questionQueue);

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('start_game_session', {
        p_session_id: 'test-session-id',
        p_question_queue: JSON.stringify(questionQueue),
      });
      expect(result).toBe(true);
    });

    it('should return false when start fails', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: new Error('Start failed') });

      const result = await gameManager.startGameSession(['q1']);

      expect(result).toBe(false);
    });
  });

  describe('submitResponse', () => {
    it('should submit response with correct data', async () => {
      const questionId = 'test-question-id';
      const responseText = 'My response';
      const roundNumber = 1;

      mockSupabaseClient.from().insert().select().single.mockResolvedValue({
        data: {
          id: 'response-id',
          session_id: 'test-session-id',
          question_id: questionId,
          user_id: 'test-user-id',
          response_text: responseText,
          round_number: roundNumber,
          is_current_turn: true,
          created_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      });

      const result = await gameManager.submitResponse(questionId, responseText, roundNumber);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('session_responses');
      expect(result).toBeTruthy();
      expect(result?.response_text).toBe(responseText);
    });

    it('should return null when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

      const result = await gameManager.submitResponse('q1', 'response', 1);

      expect(result).toBeNull();
    });
  });

  describe('advanceTurn', () => {
    it('should advance turn successfully', async () => {
      const mockResult = {
        status: 'success',
        next_player_index: 1,
        current_round: 1,
        question_id: 'next-question-id',
      };

      mockSupabaseClient.rpc.mockResolvedValue({ data: mockResult, error: null });

      const result = await gameManager.advanceTurn();

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('advance_turn', {
        p_session_id: 'test-session-id',
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
    });

    it('should handle game completion', async () => {
      const mockResult = {
        status: 'completed',
        message: 'Game completed',
      };

      mockSupabaseClient.rpc.mockResolvedValue({ data: mockResult, error: null });

      const result = await gameManager.advanceTurn();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
    });

    it('should return error when advance fails', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: new Error('Advance failed') });

      const result = await gameManager.advanceTurn();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Advance failed');
    });
  });

  describe('getSessionPlayers', () => {
    it('should fetch session players', async () => {
      const mockPlayers = [
        {
          id: 'player1',
          session_id: 'test-session-id',
          user_id: 'user1',
          position: 0,
          status: 'active',
          last_seen: '2024-01-01T00:00:00Z',
          score: 0,
          responses_count: 0,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockSupabaseClient.from().select().eq().order.mockResolvedValue({
        data: mockPlayers,
        error: null,
      });

      const result = await gameManager.getSessionPlayers();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('player_sessions');
      expect(result).toEqual(mockPlayers);
    });

    it('should return empty array when fetch fails', async () => {
      mockSupabaseClient.from().select().eq().order.mockResolvedValue({
        data: null,
        error: new Error('Fetch failed'),
      });

      const result = await gameManager.getSessionPlayers();

      expect(result).toEqual([]);
    });
  });

  describe('updatePlayerStatus', () => {
    it('should update player status successfully', async () => {
      mockSupabaseClient.from().update().eq().eq.mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await gameManager.updatePlayerStatus('active');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('player_sessions');
      expect(result).toBe(true);
    });

    it('should return false when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

      const result = await gameManager.updatePlayerStatus('active');

      expect(result).toBe(false);
    });
  });

  describe('getSessionQuestions', () => {
    it('should fetch random questions for session', async () => {
      const mockQuestions = [
        createMockQuestion(),
        { ...createMockQuestion(), id: 'q2', text: 'Another question' },
      ];

      mockSupabaseClient.from().select().eq().eq().limit.mockResolvedValue({
        data: mockQuestions,
        error: null,
      });

      const result = await gameManager.getSessionQuestions('green', 2);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('questions');
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('text');
    });

    it('should return empty array when fetch fails', async () => {
      mockSupabaseClient.from().select().eq().eq().limit.mockResolvedValue({
        data: null,
        error: new Error('Fetch failed'),
      });

      const result = await gameManager.getSessionQuestions('green');

      expect(result).toEqual([]);
    });
  });

  describe('emitGameEvent', () => {
    it('should emit game event and log to database', async () => {
      const mockChannel = {
        send: jest.fn().mockResolvedValue({}),
      };

      // Mock the private subscription
      gameManager['subscription'] = mockChannel as any;

      mockSupabaseClient.from().insert.mockResolvedValue({ data: {}, error: null });

      await gameManager.emitGameEvent('TURN_CHANGED', {
        currentPlayerIndex: 1,
        questionId: 'test-question',
      });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('game_events');
      expect(mockChannel.send).toHaveBeenCalled();
    });

    it('should handle missing user gracefully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

      await expect(
        gameManager.emitGameEvent('TURN_CHANGED', {
          currentPlayerIndex: 1,
          questionId: 'test-question',
        })
      ).resolves.not.toThrow();
    });
  });

  describe('session management', () => {
    it('should pause session', async () => {
      mockSupabaseClient.from().update().eq.mockResolvedValue({ data: {}, error: null });

      const result = await gameManager.pauseSession();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('game_sessions');
      expect(result).toBe(true);
    });

    it('should resume session', async () => {
      mockSupabaseClient.from().update().eq.mockResolvedValue({ data: {}, error: null });

      const result = await gameManager.resumeSession();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('game_sessions');
      expect(result).toBe(true);
    });

    it('should end session', async () => {
      mockSupabaseClient.from().update().eq.mockResolvedValue({ data: {}, error: null });

      const result = await gameManager.endSession();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('game_sessions');
      expect(result).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe properly', async () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockResolvedValue('SUBSCRIBED'),
        track: jest.fn().mockResolvedValue({}),
      };
      
      mockSupabaseClient.channel.mockReturnValue(mockChannel);

      await gameManager.subscribeToSession(mockCallbacks);
      await gameManager.unsubscribe();

      expect(mockSupabaseClient.removeChannel).toHaveBeenCalled();
    });
  });
});