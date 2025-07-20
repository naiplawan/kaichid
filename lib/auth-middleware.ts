import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from './supabase';

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    id: string;
    email: string;
  };
}

export async function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          success: false, 
          error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' } 
        });
      }

      const token = authHeader.split(' ')[1];
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ 
          success: false, 
          error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } 
        });
      }

      (req as AuthenticatedRequest).user = {
        id: user.id,
        email: user.email!,
      };

      return handler(req as AuthenticatedRequest, res);
    } catch (error) {
      console.error('[Auth Middleware Error]:', error);
      return res.status(500).json({ 
        success: false, 
        error: { code: 'INTERNAL_ERROR', message: 'Authentication failed' } 
      });
    }
  };
}