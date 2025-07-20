import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { savedQuestionSchema, createApiResponse, createApiError, withValidation } from '@/lib/validation';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getSavedQuestions(req, res);
  } else if (req.method === 'POST') {
    return saveQuestion(req, res);
  } else if (req.method === 'DELETE') {
    return deleteSavedQuestion(req, res);
  } else {
    return res.status(405).json(createApiError('METHOD_NOT_ALLOWED', 'Method not allowed'));
  }
}

async function getSavedQuestions(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const user_id = req.user.id; // Use authenticated user ID

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
      console.error('[API Error] Error fetching saved questions:', error);
      return res.status(500).json(createApiError('DATABASE_ERROR', 'Failed to fetch saved questions'));
    }

    return res.status(200).json(createApiResponse({ savedQuestions: data }));
  } catch (error) {
    console.error('[API Error] Unexpected error:', error);
    return res.status(500).json(createApiError('INTERNAL_ERROR', 'Internal server error'));
  }
}

async function saveQuestion(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    // Validate input
    const validation = withValidation(savedQuestionSchema)(req.body);
    if (!validation.success) {
      return res.status(400).json(createApiError('VALIDATION_ERROR', validation.error));
    }

    const { question_id, response, privacy } = validation.data;
    const user_id = req.user.id; // Use authenticated user ID

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
      console.error('[API Error] Error saving question:', error);
      return res.status(500).json(createApiError('DATABASE_ERROR', 'Failed to save question'));
    }

    return res.status(201).json(createApiResponse({ savedQuestion: data }));
  } catch (error) {
    console.error('[API Error] Unexpected error:', error);
    return res.status(500).json(createApiError('INTERNAL_ERROR', 'Internal server error'));
  }
}

async function deleteSavedQuestion(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json(createApiError('VALIDATION_ERROR', 'Saved question ID is required'));
    }

    const user_id = req.user.id; // Use authenticated user ID

    // Verify ownership before deletion
    const { data: existingRecord } = await supabase
      .from('saved_questions')
      .select('id')
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (!existingRecord) {
      return res.status(404).json(createApiError('NOT_FOUND', 'Saved question not found or access denied'));
    }

    const { error } = await supabase
      .from('saved_questions')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);

    if (error) {
      console.error('[API Error] Error deleting saved question:', error);
      return res.status(500).json(createApiError('DATABASE_ERROR', 'Failed to delete saved question'));
    }

    return res.status(200).json(createApiResponse({ message: 'Saved question deleted successfully' }));
  } catch (error) {
    console.error('[API Error] Unexpected error:', error);
    return res.status(500).json(createApiError('INTERNAL_ERROR', 'Internal server error'));
  }
}

export default withAuth(handler);
