import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Client-side Supabase client with optimized settings
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Service role client for server-side operations (used in API routes)
export const supabaseAdmin =
  typeof window === 'undefined' && env.SUPABASE_SERVICE_KEY
    ? createClient(supabaseUrl, env.SUPABASE_SERVICE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

// Database types
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

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface SavedQuestion {
  id: string;
  user_id: string;
  question_id: string;
  response?: string;
  privacy: 'private' | 'shared';
  saved_at: string;
}

export interface GameRoom {
  id: string;
  room_code: string;
  creator_id: string;
  max_players: number;
  current_players: number;
  status: 'waiting' | 'playing' | 'finished';
  settings: {
    rounds: number;
    level_progression: string[];
    themes: string[];
  };
  created_at: string;
}

export interface RoomPlayer {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  joined_at: string;
  last_seen: string;
  is_active: boolean;
}

export interface GameSession {
  id: string;
  room_id: string;
  current_question_id: string | null;
  current_round: number;
  total_rounds: number;
  started_at: string;
  ended_at: string | null;
  status: 'active' | 'completed' | 'abandoned';
}

export interface PlayerResponse {
  id: string;
  session_id: string;
  user_id: string;
  question_id: string;
  response: string | null;
  submitted_at: string;
}
