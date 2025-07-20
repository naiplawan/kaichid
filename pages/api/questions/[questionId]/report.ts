import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { createApiResponse, createApiError } from '@/lib/validation';

async function reportQuestionHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { questionId } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json(createApiError('METHOD_NOT_ALLOWED', 'Method not allowed'));
  }

  try {
    if (!questionId || typeof questionId !== 'string') {
      return res.status(400).json(createApiError('VALIDATION_ERROR', 'Question ID is required'));
    }

    // Validate UUID format
    if (!/^[a-fA-F0-9-]{36}$/.test(questionId)) {
      return res.status(400).json(createApiError('VALIDATION_ERROR', 'Invalid question ID format'));
    }

    // Check if question exists first
    const { data: question, error: fetchError } = await supabase
      .from('questions')
      .select('id')
      .eq('id', questionId)
      .single();

    if (fetchError || !question) {
      return res.status(404).json(createApiError('NOT_FOUND', 'Question not found'));
    }

    const { error } = await supabase.rpc('increment_reported_count', {
      q_id: questionId,
    });

    if (error) {
      console.error('[API Error] Error reporting question:', error);
      return res.status(500).json(createApiError('DATABASE_ERROR', 'Failed to report question'));
    }

    return res.status(200).json(createApiResponse({ message: 'Question reported successfully' }));
  } catch (error) {
    console.error('[API Error] Unexpected error:', error);
    return res.status(500).json(createApiError('INTERNAL_ERROR', 'Internal server error'));
  }
}

export default withAuth(reportQuestionHandler);
