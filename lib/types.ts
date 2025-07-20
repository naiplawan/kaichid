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
  current_round: number;
  total_rounds: number;
  status: 'active' | 'completed';
  created_at: string;
  completed_at?: string;
}

export interface PlayerResponse {
  id: string;
  session_id: string;
  player_id: string;
  question_id: string;
  response?: string;
  round_number: number;
  submitted_at: string;
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
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
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
        Row: PlayerResponse;
        Insert: Omit<PlayerResponse, 'id' | 'submitted_at'>;
        Update: Partial<Omit<PlayerResponse, 'id' | 'submitted_at'>>;
      };
    };
  };
}