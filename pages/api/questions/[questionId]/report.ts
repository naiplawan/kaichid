import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { questionId } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!questionId || typeof questionId !== 'string') {
      return res.status(400).json({ error: 'Question ID is required' });
    }

    const { error } = await supabase.rpc('increment_reported_count', {
      q_id: questionId,
    });

    if (error) {
      console.error('Error reporting question:', error);
      return res.status(500).json({ error: 'Failed to report question' });
    }

    res.status(200).json({ message: 'Question reported successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
