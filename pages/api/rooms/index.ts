import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return createRoom(req, res);
  } else if (req.method === 'GET') {
    return getRoomByCode(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function createRoom(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { creator_id, max_players = 6, settings } = req.body;

    if (!creator_id) {
      return res.status(400).json({ error: 'Creator ID is required' });
    }

    // Generate a unique 6-character room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data, error } = await supabase
      .from('game_rooms')
      .insert([
        {
          id: uuidv4(),
          room_code: roomCode,
          creator_id,
          max_players,
          current_players: 0,
          status: 'waiting',
          settings: settings || {
            rounds: 3,
            level_progression: ['green', 'yellow', 'red'],
            themes: ['general'],
          },
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating room:', error);
      return res.status(500).json({ error: 'Failed to create room' });
    }

    res.status(201).json({ room: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getRoomByCode(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Room code is required' });
    }

    const { data, error } = await supabase.from('game_rooms').select('*').eq('room_code', code.toUpperCase()).single();

    if (error) {
      console.error('Error fetching room:', error);
      return res.status(404).json({ error: 'Room not found' });
    }

    res.status(200).json({ room: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
