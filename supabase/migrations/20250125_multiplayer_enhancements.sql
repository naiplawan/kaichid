-- Enhanced multiplayer game session schema
-- Execute this in Supabase SQL editor

-- 1. Create enum types for game session status
CREATE TYPE game_session_status AS ENUM ('waiting', 'active', 'paused', 'completed');
CREATE TYPE player_status AS ENUM ('active', 'inactive', 'disconnected');

-- 2. Game sessions table for managing multiplayer games
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
    status game_session_status DEFAULT 'waiting',
    current_question_id UUID REFERENCES questions(id),
    current_player_index INTEGER DEFAULT 0,
    question_queue JSONB DEFAULT '[]'::jsonb,
    total_rounds INTEGER DEFAULT 5,
    current_round INTEGER DEFAULT 1,
    settings JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Player sessions for tracking individual player participation
CREATE TABLE IF NOT EXISTS player_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    status player_status DEFAULT 'active',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    score INTEGER DEFAULT 0,
    responses_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, user_id),
    UNIQUE(session_id, position)
);

-- 4. Enhanced session responses for multiplayer game answers
CREATE TABLE IF NOT EXISTS session_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    response_text TEXT NOT NULL,
    response_order INTEGER,
    round_number INTEGER DEFAULT 1,
    is_current_turn BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Game events log for tracking game actions
CREATE TABLE IF NOT EXISTS game_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_room_id ON game_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_player_sessions_session_id ON player_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_player_sessions_user_id ON player_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_session_responses_session_id ON session_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_session_responses_user_id ON session_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_game_events_session_id ON game_events(session_id);

-- 7. Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Apply updated_at triggers
CREATE TRIGGER update_game_sessions_updated_at 
    BEFORE UPDATE ON game_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_sessions_updated_at 
    BEFORE UPDATE ON player_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_responses_updated_at 
    BEFORE UPDATE ON session_responses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Row Level Security (RLS) policies
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

-- Players can access sessions for their rooms
CREATE POLICY "Users can access their game sessions" ON game_sessions
    FOR ALL USING (
        room_id IN (
            SELECT room_id FROM room_players 
            WHERE user_id = auth.uid()
        )
    );

-- Players can access their own session data
CREATE POLICY "Users can access their player sessions" ON player_sessions
    FOR ALL USING (
        user_id = auth.uid() OR
        session_id IN (
            SELECT id FROM game_sessions 
            WHERE room_id IN (
                SELECT room_id FROM room_players 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Players can access responses for their sessions
CREATE POLICY "Users can access session responses" ON session_responses
    FOR ALL USING (
        user_id = auth.uid() OR
        session_id IN (
            SELECT id FROM game_sessions 
            WHERE room_id IN (
                SELECT room_id FROM room_players 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Players can access game events for their sessions
CREATE POLICY "Users can access game events" ON game_events
    FOR ALL USING (
        user_id = auth.uid() OR
        session_id IN (
            SELECT id FROM game_sessions 
            WHERE room_id IN (
                SELECT room_id FROM room_players 
                WHERE user_id = auth.uid()
            )
        )
    );

-- 10. Create view for session details with player info
CREATE OR REPLACE VIEW game_session_details AS
SELECT 
    gs.*,
    gr.room_code,
    gr.creator_id as room_creator_id,
    COUNT(ps.id) as player_count,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'user_id', ps.user_id,
            'position', ps.position,
            'status', ps.status,
            'score', ps.score,
            'responses_count', ps.responses_count,
            'last_seen', ps.last_seen
        ) ORDER BY ps.position
    ) as players
FROM game_sessions gs
LEFT JOIN game_rooms gr ON gs.room_id = gr.id
LEFT JOIN player_sessions ps ON gs.id = ps.session_id
GROUP BY gs.id, gr.room_code, gr.creator_id;

-- 11. Function to create a new game session
CREATE OR REPLACE FUNCTION create_game_session(
    p_room_id UUID,
    p_settings JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    session_id UUID;
    player_record RECORD;
    position_counter INTEGER := 0;
BEGIN
    -- Create the game session
    INSERT INTO game_sessions (room_id, settings)
    VALUES (p_room_id, p_settings)
    RETURNING id INTO session_id;
    
    -- Add all room players to the session
    FOR player_record IN 
        SELECT user_id FROM room_players 
        WHERE room_id = p_room_id AND is_active = true
        ORDER BY joined_at
    LOOP
        INSERT INTO player_sessions (session_id, user_id, position, status)
        VALUES (session_id, player_record.user_id, position_counter, 'active');
        position_counter := position_counter + 1;
    END LOOP;
    
    RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Function to start a game session
CREATE OR REPLACE FUNCTION start_game_session(
    p_session_id UUID,
    p_question_queue JSONB DEFAULT '[]'::jsonb
)
RETURNS BOOLEAN AS $$
DECLARE
    first_question_id UUID;
BEGIN
    -- Get first question from queue
    IF jsonb_array_length(p_question_queue) > 0 THEN
        first_question_id := (p_question_queue->0)::UUID;
    END IF;
    
    -- Update session to active status
    UPDATE game_sessions 
    SET 
        status = 'active',
        started_at = NOW(),
        question_queue = p_question_queue,
        current_question_id = first_question_id,
        current_player_index = 0
    WHERE id = p_session_id;
    
    -- Log the start event
    INSERT INTO game_events (session_id, event_type, event_data)
    VALUES (p_session_id, 'GAME_STARTED', jsonb_build_object('started_at', NOW()));
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Function to advance to next turn
CREATE OR REPLACE FUNCTION advance_turn(p_session_id UUID)
RETURNS JSONB AS $$
DECLARE
    session_record RECORD;
    next_player_index INTEGER;
    next_question_id UUID;
    current_queue_index INTEGER;
    result JSONB;
BEGIN
    -- Get current session state
    SELECT * INTO session_record FROM game_sessions WHERE id = p_session_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Session not found');
    END IF;
    
    -- Calculate next player index (rotate through players)
    SELECT COUNT(*) INTO next_player_index 
    FROM player_sessions 
    WHERE session_id = p_session_id AND status = 'active';
    
    next_player_index := (session_record.current_player_index + 1) % next_player_index;
    
    -- If we've completed a round (back to first player), advance round
    IF next_player_index = 0 THEN
        -- Get next question from queue
        current_queue_index := session_record.current_round;
        IF current_queue_index < jsonb_array_length(session_record.question_queue) THEN
            next_question_id := (session_record.question_queue->current_queue_index)::UUID;
            
            UPDATE game_sessions 
            SET 
                current_player_index = next_player_index,
                current_round = session_record.current_round + 1,
                current_question_id = next_question_id
            WHERE id = p_session_id;
        ELSE
            -- Game completed
            UPDATE game_sessions 
            SET 
                status = 'completed',
                ended_at = NOW()
            WHERE id = p_session_id;
            
            RETURN jsonb_build_object(
                'status', 'completed',
                'message', 'Game completed'
            );
        END IF;
    ELSE
        -- Just advance player
        UPDATE game_sessions 
        SET current_player_index = next_player_index
        WHERE id = p_session_id;
    END IF;
    
    -- Log the turn change
    INSERT INTO game_events (session_id, event_type, event_data)
    VALUES (p_session_id, 'TURN_ADVANCED', jsonb_build_object(
        'next_player_index', next_player_index,
        'round', session_record.current_round,
        'question_id', COALESCE(next_question_id, session_record.current_question_id)
    ));
    
    RETURN jsonb_build_object(
        'status', 'success',
        'next_player_index', next_player_index,
        'current_round', session_record.current_round,
        'question_id', COALESCE(next_question_id, session_record.current_question_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;