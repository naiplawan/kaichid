import { z } from 'zod';

// Question validation
export const questionSubmissionSchema = z.object({
  text: z.string()
    .min(10, 'Question must be at least 10 characters')
    .max(500, 'Question must not exceed 500 characters')
    .refine(text => text.trim().length > 0, 'Question cannot be empty'),
  level: z.enum(['green', 'yellow', 'red']),
  theme: z.string()
    .min(2, 'Theme must be at least 2 characters')
    .max(50, 'Theme must not exceed 50 characters'),
});

export const questionQuerySchema = z.object({
  level: z.enum(['green', 'yellow', 'red']).optional(),
  theme: z.string().max(50).optional(),
  exclude: z.string().refine(
    str => {
      if (!str) return true;
      const ids = str.split(',');
      return ids.every(id => /^[a-fA-F0-9-]{36}$/.test(id.trim()));
    },
    'Invalid question ID format in exclude list'
  ).optional(),
});

// Room validation
export const roomCreationSchema = z.object({
  max_players: z.number().min(2).max(8).optional().default(4),
  settings: z.object({
    rounds: z.number().min(1).max(20).default(5),
    themes: z.array(z.string().max(50)).max(10).optional(),
    level_progression: z.array(z.enum(['green', 'yellow', 'red'])).max(3).optional(),
  }).optional(),
});

// Saved question validation
export const savedQuestionSchema = z.object({
  question_id: z.string().uuid('Invalid question ID'),
  response: z.string()
    .max(1000, 'Response must not exceed 1000 characters')
    .optional(),
  privacy: z.enum(['private', 'shared']).default('private'),
});

// Report validation
export const reportQuestionSchema = z.object({
  questionId: z.string().uuid('Invalid question ID'),
});

// API response standardization
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export function createApiResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function createApiError(code: string, message: string, details?: any): ApiResponse {
  return { 
    success: false, 
    error: { code, message, details } 
  };
}

// Validation middleware
export function withValidation<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): { success: true; data: T } | { success: false; error: string } => {
    try {
      const validatedData = schema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`);
        return { success: false, error: messages.join(', ') };
      }
      return { success: false, error: 'Invalid input data' };
    }
  };
}