import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { level, theme, exclude } = req.query;

    let query = supabase
      .from('questions')
      .select('id, text, level, theme, is_custom, created_at, status, reported_count')
      .eq('status', 'approved')
      .limit(50);

    if (level && typeof level === 'string') {
      query = query.eq('level', level);
    }

    if (theme && typeof theme === 'string') {
      query = query.eq('theme', theme);
    }

    if (exclude && typeof exclude === 'string') {
      const excludeIds = exclude.split(',');
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    const { data: questions, error } = await query;

    if (error) {
      console.error('Error fetching questions:', error);
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }

    res.status(200).json({ questions });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
