import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, level, theme, creator_id } = req.body;

    if (!text || !level || !theme || !creator_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('questions')
      .insert([
        {
          text,
          level,
          theme,
          is_custom: true,
          creator_id,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error submitting question:', error);
      return res.status(500).json({ error: 'Failed to submit question' });
    }

    res.status(201).json({ question: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
