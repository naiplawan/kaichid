import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { questionQuerySchema, createApiResponse, createApiError, withValidation } from '@/lib/validation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json(createApiError('METHOD_NOT_ALLOWED', 'Method not allowed'));
  }

  try {
    // Validate query parameters
    const validation = withValidation(questionQuerySchema)(req.query);
    if (!validation.success) {
      return res.status(400).json(createApiError('VALIDATION_ERROR', validation.error));
    }

    const { level, theme, exclude } = validation.data;

    let query = supabase
      .from('questions')
      .select('id, text, level, theme, is_custom, created_at, status, reported_count')
      .eq('status', 'approved')
      .limit(50);

    if (level) {
      query = query.eq('level', level);
    }

    if (theme) {
      query = query.eq('theme', theme);
    }

    // Fix SQL injection vulnerability: properly validate UUIDs and use safe array method
    if (exclude) {
      const excludeIds = exclude.split(',')
        .map(id => id.trim())
        .filter(id => /^[a-fA-F0-9-]{36}$/.test(id)); // Validate UUID format
      
      if (excludeIds.length > 0) {
        query = query.not('id', 'in', excludeIds); // Use array instead of string interpolation
      }
    }

    const { data: questions, error } = await query;

    if (error) {
      console.error('[API Error] Error fetching questions:', error);
      return res.status(500).json(createApiError('DATABASE_ERROR', 'Failed to fetch questions'));
    }

    return res.status(200).json(createApiResponse({ questions }));
  } catch (error) {
    console.error('[API Error] Unexpected error:', error);
    return res.status(500).json(createApiError('INTERNAL_ERROR', 'Internal server error'));
  }
}
