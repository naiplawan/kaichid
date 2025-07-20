import { NextApiRequest, NextApiResponse } from 'next';
import { createApiError } from './validation';

// Simple in-memory rate limiter
class SimpleRateLimiter {
  private requests: Map<string, number[]> = new Map();

  check(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing requests for this identifier
    const existingRequests = this.requests.get(identifier) || [];

    // Filter out old requests outside the window
    const validRequests = existingRequests.filter(time => time > windowStart);

    // Check if limit exceeded
    if (validRequests.length >= limit) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      this.cleanup();
    }

    return true;
  }

  private cleanup() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    this.requests.forEach((requests, key) => {
      const validRequests = requests.filter((time: number) => time > oneHourAgo);
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    });
  }
}

const rateLimiter = new SimpleRateLimiter();

// Get client IP address
function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  
  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return ip || 'unknown';
  }
  
  if (realIp) {
    const ip = Array.isArray(realIp) ? realIp[0] : realIp;
    return ip || 'unknown';
  }
  
  return req.socket.remoteAddress || 'unknown';
}

// Rate limiting middleware factory
export function withRateLimit(
  options: {
    requests: number;
    windowMs: number;
    message?: string;
  } = {
    requests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many requests'
  }
) {
  return (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const clientIP = getClientIP(req);
      const identifier = `${clientIP}:${req.url}`;
      
      if (!rateLimiter.check(identifier, options.requests, options.windowMs)) {
        return res.status(429).json(
          createApiError('RATE_LIMIT_EXCEEDED', options.message || 'Too many requests')
        );
      }
      
      return handler(req, res);
    };
  };
}

// Predefined rate limiting middlewares
export const withDefaultRateLimit = withRateLimit({
  requests: 100,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests. Please try again later.'
});

export const withStrictRateLimit = withRateLimit({
  requests: 10,
  windowMs: 15 * 60 * 1000,
  message: 'Rate limit exceeded for this operation. Please wait before trying again.'
});

export const withSubmissionRateLimit = withRateLimit({
  requests: 5,
  windowMs: 60 * 60 * 1000,
  message: 'Too many submissions. Please wait before submitting again.'
});

export const withAuthRateLimit = withRateLimit({
  requests: 5,
  windowMs: 15 * 60 * 1000,
  message: 'Too many authentication attempts. Please wait before trying again.'
});