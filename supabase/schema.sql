-- Create the user_profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('green', 'yellow', 'red')),
    theme TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    creator_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected')),
    reported_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the saved_questions table
CREATE TABLE saved_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    question_id UUID REFERENCES public.questions(id),
    response TEXT,
    privacy TEXT DEFAULT 'private' CHECK (privacy IN ('private', 'shared')),
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, question_id) -- Ensure a user can save a question only once
);

-- Create the game_rooms table
CREATE TABLE game_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_code TEXT UNIQUE NOT NULL,
    creator_id UUID REFERENCES auth.users(id),
    max_players INTEGER NOT NULL,
    current_players INTEGER DEFAULT 0, -- This might be managed by Socket.io state, but good to have for persistence
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
    settings JSONB, -- Store rounds, level_progression, themes as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to increment reported_count for a question
CREATE OR REPLACE FUNCTION increment_reported_count(q_id UUID)
RETURNS VOID AS $$
  UPDATE questions
  SET reported_count = reported_count + 1
  WHERE id = q_id;
$$ LANGUAGE SQL;

-- Enable Row Level Security (RLS) for tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for questions
CREATE POLICY "Anyone can view approved questions" ON questions FOR SELECT USING (status = 'approved');
CREATE POLICY "Authenticated users can insert custom questions" ON questions FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND is_custom = TRUE AND creator_id = auth.uid());
-- Admin policy for questions (you'd define this based on your admin role setup)
-- CREATE POLICY "Admins can manage all questions" ON questions FOR ALL USING (auth.role() = 'admin');

-- RLS Policies for saved_questions
CREATE POLICY "Users can view their own saved questions" ON saved_questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own saved questions" ON saved_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own saved questions" ON saved_questions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for game_rooms
CREATE POLICY "Anyone can view game rooms" ON game_rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create game rooms" ON game_rooms FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Room creators can update their rooms" ON game_rooms FOR UPDATE USING (auth.uid() = creator_id);
