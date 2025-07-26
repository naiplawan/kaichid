import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { 
  GameSession, 
  PlayerSession, 
  SessionResponse, 
  RealtimeGameEvent, 
  GameEventCallbacks,
  Question
} from './types';

export class GameSessionManager {
  private supabase: SupabaseClient;
  private sessionId: string;
  private subscription: RealtimeChannel | null = null;
  private presenceState: Record<string, unknown> = {};

  constructor(supabase: SupabaseClient, sessionId: string) {
    this.supabase = supabase;
    this.sessionId = sessionId;
  }

  /**
   * Subscribe to real-time game session events
   */
  async subscribeToSession(callbacks: GameEventCallbacks): Promise<void> {
    if (this.subscription) {
      await this.unsubscribe();
    }

    this.subscription = this.supabase
      .channel(`game_session:${this.sessionId}`)
      .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'game_sessions',
            filter: `id=eq.${this.sessionId}`
          },
          callbacks.onSessionUpdate)
      .on('postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'session_responses',
            filter: `session_id=eq.${this.sessionId}`
          },
          callbacks.onResponseUpdate)
      .on('postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'player_sessions',
            filter: `session_id=eq.${this.sessionId}`
          },
          callbacks.onPlayerJoin)
      .on('presence', { event: 'sync' }, () => {
        this.presenceState = this.subscription!.presenceState();
        callbacks.onPresenceSync();
      })
      .on('presence', { event: 'join' }, callbacks.onPlayerJoin)
      .on('presence', { event: 'leave' }, callbacks.onPlayerLeave)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track user presence
          await this.trackPresence();
        }
      });
  }

  /**
   * Track current user's presence in the game session
   */
  private async trackPresence(): Promise<void> {
    if (!this.subscription) return;

    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;

    await this.subscription.track({
      user_id: user.id,
      online_at: new Date().toISOString(),
      status: 'active'
    });
  }

  /**
   * Create a new game session
   */
  async createGameSession(roomId: string, settings: Record<string, unknown> = {}): Promise<GameSession | null> {
    const { data, error } = await this.supabase
      .rpc('create_game_session', {
        p_room_id: roomId,
        p_settings: settings
      });

    if (error) {
      console.error('Error creating game session:', error);
      return null;
    }

    // Fetch the created session
    return this.getGameSession(data);
  }

  /**
   * Start a game session with a queue of questions
   */
  async startGameSession(questionQueue: string[]): Promise<boolean> {
    const { data, error } = await this.supabase
      .rpc('start_game_session', {
        p_session_id: this.sessionId,
        p_question_queue: JSON.stringify(questionQueue)
      });

    if (error) {
      console.error('Error starting game session:', error);
      return false;
    }

    return data;
  }

  /**
   * Get current game session details
   */
  async getGameSession(sessionId?: string): Promise<GameSession | null> {
    const id = sessionId || this.sessionId;
    
    const { data, error } = await this.supabase
      .from('game_session_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching game session:', error);
      return null;
    }

    return data as GameSession;
  }

  /**
   * Get players in the current session
   */
  async getSessionPlayers(): Promise<PlayerSession[]> {
    const { data, error } = await this.supabase
      .from('player_sessions')
      .select('*')
      .eq('session_id', this.sessionId)
      .order('position');

    if (error) {
      console.error('Error fetching session players:', error);
      return [];
    }

    return data as PlayerSession[];
  }

  /**
   * Submit a response to the current question
   */
  async submitResponse(
    questionId: string, 
    responseText: string, 
    roundNumber: number
  ): Promise<SessionResponse | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('session_responses')
      .insert({
        session_id: this.sessionId,
        question_id: questionId,
        user_id: user.id,
        response_text: responseText,
        round_number: roundNumber,
        is_current_turn: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting response:', error);
      return null;
    }

    return data as SessionResponse;
  }

  /**
   * Advance to the next turn/player
   */
  async advanceTurn(): Promise<{ success: boolean; data?: unknown; error?: string }> {
    const { data, error } = await this.supabase
      .rpc('advance_turn', {
        p_session_id: this.sessionId
      });

    if (error) {
      console.error('Error advancing turn:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  /**
   * Update player status (active, inactive, disconnected)
   */
  async updatePlayerStatus(status: 'active' | 'inactive' | 'disconnected'): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return false;

    const { error } = await this.supabase
      .from('player_sessions')
      .update({ 
        status,
        last_seen: new Date().toISOString()
      })
      .eq('session_id', this.sessionId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating player status:', error);
      return false;
    }

    return true;
  }

  /**
   * Get session responses for a specific question
   */
  async getQuestionResponses(questionId: string): Promise<SessionResponse[]> {
    const { data, error } = await this.supabase
      .from('session_responses')
      .select('*')
      .eq('session_id', this.sessionId)
      .eq('question_id', questionId)
      .order('created_at');

    if (error) {
      console.error('Error fetching question responses:', error);
      return [];
    }

    return data as SessionResponse[];
  }

  /**
   * Get random questions for the session
   */
  async getSessionQuestions(level: 'green' | 'yellow' | 'red', count: number = 10): Promise<Question[]> {
    const { data, error } = await this.supabase
      .from('questions')
      .select('*')
      .eq('level', level)
      .eq('status', 'approved')
      .limit(count);

    if (error) {
      console.error('Error fetching session questions:', error);
      return [];
    }

    // Shuffle the questions
    return this.shuffleArray(data as Question[]);
  }

  /**
   * Pause the game session
   */
  async pauseSession(): Promise<boolean> {
    const { error } = await this.supabase
      .from('game_sessions')
      .update({ status: 'paused' })
      .eq('id', this.sessionId);

    if (error) {
      console.error('Error pausing session:', error);
      return false;
    }

    return true;
  }

  /**
   * Resume the game session
   */
  async resumeSession(): Promise<boolean> {
    const { error } = await this.supabase
      .from('game_sessions')
      .update({ status: 'active' })
      .eq('id', this.sessionId);

    if (error) {
      console.error('Error resuming session:', error);
      return false;
    }

    return true;
  }

  /**
   * End the game session
   */
  async endSession(): Promise<boolean> {
    const { error } = await this.supabase
      .from('game_sessions')
      .update({ 
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      .eq('id', this.sessionId);

    if (error) {
      console.error('Error ending session:', error);
      return false;
    }

    return true;
  }

  /**
   * Get current presence state
   */
  getPresenceState(): Record<string, unknown> {
    return this.presenceState;
  }

  /**
   * Get online players count
   */
  getOnlinePlayersCount(): number {
    return Object.keys(this.presenceState).length;
  }

  /**
   * Unsubscribe from real-time events
   */
  async unsubscribe(): Promise<void> {
    if (this.subscription) {
      await this.supabase.removeChannel(this.subscription);
      this.subscription = null;
    }
  }

  /**
   * Utility function to shuffle array
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    return shuffled;
  }

  /**
   * Emit a custom game event
   */
  async emitGameEvent<T extends keyof import('./types').GameEventPayload>(
    eventType: T, 
    payload: import('./types').GameEventPayload[T]
  ): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;

    const event = {
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
      userId: user.id
    };

    // Log the event to database
    await this.supabase
      .from('game_events')
      .insert({
        session_id: this.sessionId,
        user_id: user.id,
        event_type: eventType,
        event_data: payload as Record<string, unknown>
      });

    // Broadcast via real-time channel
    if (this.subscription) {
      await this.subscription.send({
        type: 'broadcast',
        event: eventType,
        payload: event
      });
    }
  }
}

export default GameSessionManager;