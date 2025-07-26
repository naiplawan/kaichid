// Core type definitions for the KAICHID application
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export type User = SupabaseUser;

export interface Question {
  id: string;
  text: string;
  level: 'green' | 'yellow' | 'red';
  theme: string;
  is_custom: boolean;
  creator_id?: string;
  status: 'approved' | 'pending' | 'rejected';
  reported_count: number;
  created_at: string;
}

export interface SavedQuestion {
  id: string;
  user_id: string;
  question_id: string;
  response?: string;
  privacy: 'private' | 'shared';
  saved_at: string;
  questions?: Question;
}

export interface Player {
  id: string;
  user_id: string;
  room_id: string;
  username: string;
  is_active: boolean;
  joined_at: string;
  last_seen: string;
}

export interface GameRoom {
  id: string;
  room_code: string;
  creator_id: string;
  max_players: number;
  current_players: number;
  status: 'waiting' | 'playing' | 'finished';
  settings?: RoomSettings;
  created_at: string;
}

export interface RoomSettings {
  rounds: number;
  themes?: string[];
  level_progression?: ('green' | 'yellow' | 'red')[];
}

export interface GameSession {
  id: string;
  room_id: string;
  status: 'waiting' | 'active' | 'paused' | 'completed';
  current_question_id: string | null;
  current_player_index: number;
  question_queue: string[];
  total_rounds: number;
  current_round: number;
  settings: Record<string, unknown>;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlayerSession {
  id: string;
  session_id: string;
  user_id: string;
  position: number;
  status: 'active' | 'inactive' | 'disconnected';
  last_seen: string;
  score: number;
  responses_count: number;
  created_at: string;
  updated_at: string;
}

export interface SessionResponse {
  id: string;
  session_id: string;
  question_id: string;
  user_id: string;
  response_text: string;
  response_order: number;
  round_number: number;
  is_current_turn: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface GameEvent {
  id: string;
  session_id: string;
  user_id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}

// Game state interfaces
export interface GameState {
  mode: 'solo' | 'multiplayer' | null;
  level: 'green' | 'yellow' | 'red';
  currentQuestion: Question | null;
  savedQuestions: Question[];
  gameSession: {
    playedQuestions: string[];
    currentRound: number;
    totalRounds: number;
  };
  room?: RoomState;
}

export interface RoomState {
  id: string;
  code: string;
  players: Player[];
  currentPlayer: string;
  isHost: boolean;
}

// Context interfaces
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface GameContextType {
  gameState: GameState;
  setGameMode: (mode: 'solo' | 'multiplayer') => void;
  setLevel: (level: 'green' | 'yellow' | 'red') => void;
  setCurrentQuestion: (question: Question | null) => void;
  saveQuestion: (question: Question, response?: string, privacy?: 'private' | 'shared') => Promise<void>;
  markQuestionPlayed: (questionId: string) => void;
  resetGame: () => void;
  setRoom: (room: RoomState) => void;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Form data types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  username: string;
}

export interface QuestionSubmissionData {
  text: string;
  level: 'green' | 'yellow' | 'red';
  theme: string;
}

export interface RoomCreationData {
  max_players?: number;
  settings?: RoomSettings;
}

// Component prop types
export interface CardProps {
  question: Question;
  onSwipe: (direction: 'left' | 'right', question: Question) => void;
  onReport: (questionId: string) => void;
  disabled?: boolean;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

// Utility types
export type Level = 'green' | 'yellow' | 'red';
export type GameMode = 'solo' | 'multiplayer';
export type RoomStatus = 'waiting' | 'playing' | 'finished';
export type QuestionStatus = 'approved' | 'pending' | 'rejected';
export type Privacy = 'private' | 'shared';

// Real-time game event types
export interface GameEventPayload {
  PLAYER_JOINED: { player: PlayerSession };
  PLAYER_LEFT: { playerId: string };
  TURN_CHANGED: { currentPlayerIndex: number; questionId: string };
  RESPONSE_SUBMITTED: { response: SessionResponse };
  GAME_STARTED: { sessionId: string; startedAt: string };
  GAME_COMPLETED: { sessionId: string; endedAt: string };
  PLAYER_PRESENCE: { userId: string; status: 'online' | 'offline' };
}

export interface RealtimeGameEvent<T extends keyof GameEventPayload = keyof GameEventPayload> {
  type: T;
  payload: GameEventPayload[T];
  timestamp: string;
  userId: string;
}

export interface GameEventCallbacks {
  onSessionUpdate: (payload: unknown) => void;
  onResponseUpdate: (payload: unknown) => void;
  onPresenceSync: () => void;
  onPlayerJoin: (payload: unknown) => void;
  onPlayerLeave: (payload: unknown) => void;
}

// Event handler types
export type SwipeDirection = 'left' | 'right';
export type SwipeHandler = (direction: SwipeDirection, question: Question) => void;
export type ReportHandler = (questionId: string) => void;

// Database table types (for Supabase)
export interface Database {
  public: {
    Tables: {
      questions: {
        Row: Question;
        Insert: Omit<Question, 'id' | 'created_at'>;
        Update: Partial<Omit<Question, 'id' | 'created_at'>>;
      };
      saved_questions: {
        Row: SavedQuestion;
        Insert: Omit<SavedQuestion, 'id' | 'saved_at'>;
        Update: Partial<Omit<SavedQuestion, 'id' | 'saved_at'>>;
      };
      game_rooms: {
        Row: GameRoom;
        Insert: Omit<GameRoom, 'id' | 'created_at'>;
        Update: Partial<Omit<GameRoom, 'id' | 'created_at'>>;
      };
      room_players: {
        Row: Player;
        Insert: Omit<Player, 'id' | 'joined_at'>;
        Update: Partial<Omit<Player, 'id' | 'joined_at'>>;
      };
      game_sessions: {
        Row: GameSession;
        Insert: Omit<GameSession, 'id' | 'created_at'>;
        Update: Partial<Omit<GameSession, 'id' | 'created_at'>>;
      };
      player_responses: {
        Row: SessionResponse;
        Insert: Omit<SessionResponse, 'id' | 'created_at'>;
        Update: Partial<Omit<SessionResponse, 'id' | 'created_at'>>;
      };
    };
  };
}