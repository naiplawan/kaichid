import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

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
