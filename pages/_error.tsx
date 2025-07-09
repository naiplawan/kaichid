import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface ErrorProps {
  statusCode?: number;
  hasGetInitialPropsRun?: boolean;
  err?: Error & { statusCode?: number };
}

function Error({ statusCode, hasGetInitialPropsRun, err }: ErrorProps) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  // Default to 500 if no status code is provided
  const errorCode = statusCode || 500;

  const getErrorMessage = (code: number) => {
    switch (code) {
      case 400:
        return {
          title: 'Bad Request',
          oracle: 'KAICHID cannot understand this request...',
          message: 'The request sent to the mystical realm was malformed.',
        };
      case 401:
        return {
          title: 'Unauthorized',
          oracle: "KAICHID's sacred gates remain sealed...",
          message: 'You need proper credentials to access this mystical realm.',
        };
      case 403:
        return {
          title: 'Forbidden',
          oracle: 'KAICHID forbids this passage...',
          message: 'You lack the necessary permissions for this sacred space.',
        };
      case 404:
        return {
          title: 'Not Found',
          oracle: 'KAICHID cannot find this path...',
          message: 'The page you seek exists only in legend.',
        };
      case 500:
        return {
          title: 'Internal Server Error',
          oracle: "KAICHID's cosmic forces are in discord...",
          message: 'A disturbance in the mystical realm has occurred.',
        };
      case 502:
        return {
          title: 'Bad Gateway',
          oracle: "KAICHID's portal between worlds has collapsed...",
          message: 'The connection to the mystical realm has been severed.',
        };
      case 503:
        return {
          title: 'Service Unavailable',
          oracle: 'KAICHID rests in deep meditation...',
          message: 'The mystical services are temporarily unavailable.',
        };
      default:
        return {
          title: 'Unknown Error',
          oracle: "An ancient curse has befallen KAICHID's realm...",
          message: 'Something unexpected has occurred in the mystical realm.',
        };
    }
  };

  const errorInfo = getErrorMessage(errorCode);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  // Error reporting for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && err) {
      console.error('Error Details:', err);
    }
  }, [err]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-mystical-dark via-red-900/10 to-mystical-dark">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateX: -15 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mystical-card p-8 text-center max-w-2xl relative overflow-hidden"
      >
        {/* Mystical background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-mystical-gold/5 animate-pulse"></div>

        {/* Floating error spirits */}
        <div className="absolute top-4 left-4 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
        <div className="absolute top-8 right-8 w-1 h-1 bg-orange-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce"></div>

        <div className="relative z-10">
          {/* Error Code */}
          <motion.div
            initial={{ rotateY: -90 }}
            animate={{ rotateY: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-6"
          >
            <h1 className="text-7xl font-mystical text-transparent bg-gradient-to-r from-red-400 via-orange-300 to-red-400 bg-clip-text mb-2">
              {errorCode}
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent mx-auto"></div>
          </motion.div>

          {/* Error Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-mystical text-red-400 mb-3">{errorInfo.title}</h2>
            <p className="text-lg text-gray-300 italic mb-4">"{errorInfo.oracle}"</p>
            <p className="text-gray-400">{errorInfo.message}</p>
          </motion.div>

          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === 'development' && err && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mb-6 p-4 bg-gray-800/50 rounded-lg text-left"
            >
              <h3 className="text-sm font-bold text-red-400 mb-2">Debug Information:</h3>
              <pre className="text-xs text-gray-400 overflow-x-auto">
                {err.stack || err.message || 'No additional error details available'}
              </pre>
            </motion.div>
          )}

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRetrying ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></div>
                    Retrying...
                  </>
                ) : (
                  '🔄 Try Again'
                )}
              </button>
              <button onClick={handleGoBack} className="btn-secondary">
                ← Go Back
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="btn-mystical">
                🏠 Return to Dashboard
              </Link>
              <Link href="/solo" className="btn-mystical">
                🎴 Start Fresh Journey
              </Link>
            </div>
          </motion.div>

          {/* Help section for common errors */}
          {[400, 401, 403, 500, 502, 503].includes(errorCode) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              className="mt-8 pt-6 border-t border-gray-700"
            >
              <h3 className="text-sm font-medium text-mystical-gold mb-3">Seeking Guidance?</h3>
              <div className="text-xs text-gray-500 space-y-1">
                {errorCode === 401 && (
                  <p>
                    • Try{' '}
                    <Link href="/auth/login" className="text-mystical-gold hover:underline">
                      logging in again
                    </Link>
                  </p>
                )}
                {errorCode === 500 && <p>• This is likely a temporary issue. Please try again in a few moments.</p>}
                {errorCode === 503 && <p>• The service is temporarily down for maintenance. Please check back soon.</p>}
                <p>• If the problem persists, the spirits may need time to restore balance.</p>
              </div>
            </motion.div>
          )}

          {/* Mystical footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="mt-6"
          >
            <p className="text-xs text-gray-500 italic">
              "Even in darkness, the path to meaningful connection remains illuminated."
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: { res?: any; err?: any }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
