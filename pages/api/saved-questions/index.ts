import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getSavedQuestions(req, res);
  } else if (req.method === 'POST') {
    return saveQuestion(req, res);
  } else if (req.method === 'DELETE') {
    return deleteSavedQuestion(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getSavedQuestions(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { user_id } = req.query;

    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { data, error } = await supabase
      .from('saved_questions')
      .select(
        `
        *,
        questions (
          id,
          text,
          level,
          theme
        )
      `
      )
      .eq('user_id', user_id)
      .order('saved_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved questions:', error);
      return res.status(500).json({ error: 'Failed to fetch saved questions' });
    }

    res.status(200).json({ savedQuestions: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function saveQuestion(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { user_id, question_id, response, privacy = 'private' } = req.body;

    if (!user_id || !question_id) {
      return res.status(400).json({ error: 'User ID and Question ID are required' });
    }

    const { data, error } = await supabase
      .from('saved_questions')
      .insert([
        {
          user_id,
          question_id,
          response,
          privacy,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving question:', error);
      return res.status(500).json({ error: 'Failed to save question' });
    }

    res.status(201).json({ savedQuestion: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteSavedQuestion(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, user_id } = req.body;

    if (!id || !user_id) {
      return res.status(400).json({ error: 'Saved question ID and User ID are required' });
    }

    const { error } = await supabase.from('saved_questions').delete().eq('id', id).eq('user_id', user_id);

    if (error) {
      console.error('Error deleting saved question:', error);
      return res.status(500).json({ error: 'Failed to delete saved question' });
    }

    res.status(200).json({ message: 'Saved question deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
