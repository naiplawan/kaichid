-- Migration for multiplayer support
-- Create room_players table to track players in each room
CREATE TABLE room_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    username TEXT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE (room_id, user_id) -- Ensure a user can only be in a room once
);

-- Create game_sessions table to track game state
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
    current_question_id UUID REFERENCES questions(id),
    current_round INTEGER DEFAULT 1,
    total_rounds INTEGER NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned'))
);

-- Create player_responses table to track responses in multiplayer games
CREATE TABLE player_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    question_id UUID REFERENCES questions(id),
    response TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for new tables
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for room_players
CREATE POLICY "Anyone can view room players" ON room_players FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join rooms" ON room_players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own room presence" ON room_players FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can leave rooms" ON room_players FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for game_sessions
CREATE POLICY "Players can view sessions in their rooms" ON game_sessions
    FOR SELECT USING (
        room_id IN (
            SELECT room_id FROM room_players WHERE user_id = auth.uid()
        )
    );
CREATE POLICY "Room creators can manage game sessions" ON game_sessions
    FOR ALL USING (
        room_id IN (
            SELECT id FROM game_rooms WHERE creator_id = auth.uid()
        )
    );

-- RLS Policies for player_responses
CREATE POLICY "Players can view responses in their sessions" ON player_responses
    FOR SELECT USING (
        session_id IN (
            SELECT gs.id FROM game_sessions gs
            JOIN room_players rp ON gs.room_id = rp.room_id
            WHERE rp.user_id = auth.uid()
        )
    );
CREATE POLICY "Players can insert their own responses" ON player_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Players can update their own responses" ON player_responses
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to update player last_seen timestamp
CREATE OR REPLACE FUNCTION update_player_last_seen(p_room_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE room_players
    SET last_seen = NOW()
    WHERE room_id = p_room_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up inactive players (older than 5 minutes)
CREATE OR REPLACE FUNCTION cleanup_inactive_players()
RETURNS VOID AS $$
BEGIN
    UPDATE room_players
    SET is_active = false
    WHERE last_seen < NOW() - INTERVAL '5 minutes' AND is_active = true;
END;
$$ LANGUAGE plpgsql;
