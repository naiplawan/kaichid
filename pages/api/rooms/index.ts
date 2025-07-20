import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { roomCreationSchema, createApiResponse, createApiError, withValidation } from '@/lib/validation';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return createRoom(req, res);
  } else if (req.method === 'GET') {
    return getRoomByCode(req, res);
  } else {
    return res.status(405).json(createApiError('METHOD_NOT_ALLOWED', 'Method not allowed'));
  }
}

async function createRoom(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    // Validate input
    const validation = withValidation(roomCreationSchema)(req.body);
    if (!validation.success) {
      return res.status(400).json(createApiError('VALIDATION_ERROR', validation.error));
    }

    const { max_players, settings } = validation.data;
    const creator_id = req.user.id; // Use authenticated user ID

    // Generate cryptographically secure room code
    const roomCode = randomBytes(3).toString('hex').toUpperCase();

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
            rounds: 5,
            level_progression: ['green', 'yellow', 'red'],
            themes: ['general'],
          },
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[API Error] Error creating room:', error);
      return res.status(500).json(createApiError('DATABASE_ERROR', 'Failed to create room'));
    }

    return res.status(201).json(createApiResponse({ room: data }));
  } catch (error) {
    console.error('[API Error] Unexpected error:', error);
    return res.status(500).json(createApiError('INTERNAL_ERROR', 'Internal server error'));
  }
}

async function getRoomByCode(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json(createApiError('VALIDATION_ERROR', 'Room code is required'));
    }

    // Validate room code format (6 hex characters)
    if (!/^[A-F0-9]{6}$/.test(code.toUpperCase())) {
      return res.status(400).json(createApiError('VALIDATION_ERROR', 'Invalid room code format'));
    }

    const { data, error } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('room_code', code.toUpperCase())
      .single();

    if (error) {
      console.error('[API Error] Error fetching room:', error);
      return res.status(404).json(createApiError('NOT_FOUND', 'Room not found'));
    }

    return res.status(200).json(createApiResponse({ room: data }));
  } catch (error) {
    console.error('[API Error] Unexpected error:', error);
    return res.status(500).json(createApiError('INTERNAL_ERROR', 'Internal server error'));
  }
}

export default withAuth(handler);
