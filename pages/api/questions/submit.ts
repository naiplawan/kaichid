import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { questionSubmissionSchema, createApiResponse, createApiError, withValidation } from '@/lib/validation';
import { withSubmissionRateLimit } from '@/lib/simple-rate-limit';

async function submitQuestionHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json(createApiError('METHOD_NOT_ALLOWED', 'Method not allowed'));
  }

  try {
    // Validate input
    const validation = withValidation(questionSubmissionSchema)(req.body);
    if (!validation.success) {
      return res.status(400).json(createApiError('VALIDATION_ERROR', validation.error));
    }

    const { text, level, theme } = validation.data;
    const creator_id = req.user.id; // Use authenticated user ID

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
      console.error('[API Error] Error submitting question:', error);
      return res.status(500).json(createApiError('DATABASE_ERROR', 'Failed to submit question'));
    }

    return res.status(201).json(createApiResponse({ question: data }));
  } catch (error) {
    console.error('[API Error] Unexpected error:', error);
    return res.status(500).json(createApiError('INTERNAL_ERROR', 'Internal server error'));
  }
}

// Compose middlewares: first rate limit, then auth
const rateLimitedHandler = withSubmissionRateLimit(async (req, res) => {
  // Cast to AuthenticatedRequest after auth middleware runs
  return submitQuestionHandler(req as AuthenticatedRequest, res);
});

export default withAuth(rateLimitedHandler);
