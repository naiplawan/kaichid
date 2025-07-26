// Centralized error handling utilities

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, 'VALIDATION_ERROR', { field });
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

// Error reporting service
export const errorReporting = {
  captureException: (error: Error, context?: Record<string, unknown>) => {
    // In production, send to monitoring service (Sentry, LogRocket, etc.)
    console.error('[ERROR]', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    });
    
    // TODO: Integrate with monitoring service
    // Sentry.captureException(error, { extra: context });
  },

  captureMessage: (message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, unknown>) => {
    console.log(`[${level.toUpperCase()}]`, message, context);
    
    // TODO: Integrate with monitoring service
    // Sentry.captureMessage(message, level as SeverityLevel);
  }
};

// Async error wrapper for components
export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  errorMessage: string = 'Operation failed'
): (...args: T) => Promise<{ data?: R; error?: string }> {
  return async (...args: T) => {
    try {
      const data = await fn(...args);
      return { data };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : errorMessage;
      errorReporting.captureException(error instanceof Error ? error : new Error(errorMsg), { args });
      return { error: errorMsg };
    }
  };
}

// React hook for error handling
export function useErrorHandler() {
  return {
    handleError: (error: Error, context?: Record<string, unknown>) => {
      errorReporting.captureException(error, context);
    },
    
    handleAsyncError: async <T>(
      operation: () => Promise<T>,
      fallback?: T
    ): Promise<T | undefined> => {
      try {
        return await operation();
      } catch (error) {
        errorReporting.captureException(error instanceof Error ? error : new Error(String(error)));
        return fallback;
      }
    }
  };
}

// Network error handling  
export function handleNetworkError(error: NetworkError): AppError {
  if (error.code === 'ECONNREFUSED') {
    return new AppError('Unable to connect to server', 503, 'CONNECTION_ERROR');
  }
  
  if (error.code === 'ENOTFOUND') {
    return new AppError('Network unavailable', 503, 'NETWORK_ERROR');
  }
  
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.message;
    
    switch (status) {
      case 400:
        return new ValidationError(message);
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new AuthorizationError(message);
      case 404:
        return new NotFoundError(message);
      case 409:
        return new ConflictError(message);
      case 429:
        return new RateLimitError(message);
      default:
        return new AppError(message, status);
    }
  }
  
  return new AppError(error.message || 'An unexpected error occurred');
}

// Network error interface
interface NetworkError {
  code?: string;
  message: string;
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
}

// Type guard for checking error types
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isAuthError(error: unknown): error is AuthenticationError | AuthorizationError {
  return error instanceof AuthenticationError || error instanceof AuthorizationError;
}

// Error boundary hook
export function useErrorBoundary() {
  return {
    captureError: (error: Error, errorInfo?: Record<string, unknown>) => {
      errorReporting.captureException(error, errorInfo);
    }
  };
}