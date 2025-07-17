import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-500/20 border-green-500 text-green-200',
    error: 'bg-red-500/20 border-red-500 text-red-200',
    warning: 'bg-yellow-500/20 border-yellow-500 text-yellow-200',
    info: 'bg-blue-500/20 border-blue-500 text-blue-200',
  };

  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg border backdrop-blur-sm ${typeStyles[type]} max-w-md`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-lg">{icons[type]}</span>
            <p className="flex-1">{message}</p>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}