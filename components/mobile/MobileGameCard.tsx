import React, { useState, useRef } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, MessageCircle, Clock, Sparkles } from 'lucide-react';
import { Question } from '@/lib/types';

interface MobileGameCardProps {
  question: Question;
  onSwipe: (direction: 'left' | 'right', question: Question) => void;
  onReport?: (questionId: string) => void;
  disabled?: boolean;
  showTimer?: boolean;
  timeRemaining?: number;
  isMyTurn?: boolean;
}

const SWIPE_THRESHOLD = 100;
const ROTATION_FACTOR = 15;

export function MobileGameCard({
  question,
  onSwipe,
  onReport,
  disabled = false,
  showTimer = false,
  timeRemaining = 0,
  isMyTurn = false
}: MobileGameCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-ROTATION_FACTOR, ROTATION_FACTOR]);
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setIsDragging(false);
    
    const swipeDistance = Math.abs(info.offset.x);
    const swipeVelocity = Math.abs(info.velocity.x);
    
    if (swipeDistance > SWIPE_THRESHOLD || swipeVelocity > 500) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      onSwipe(direction, question);
    }
  };

  const getLevelColor = () => {
    switch (question.level) {
      case 'green':
        return {
          bg: 'bg-gradient-to-br from-green-50 to-green-100',
          border: 'border-green-200',
          text: 'text-green-800',
          accent: 'text-green-600'
        };
      case 'yellow':
        return {
          bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          accent: 'text-yellow-600'
        };
      case 'red':
        return {
          bg: 'bg-gradient-to-br from-red-50 to-red-100',
          border: 'border-red-200',
          text: 'text-red-800',
          accent: 'text-red-600'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
          border: 'border-gray-200',
          text: 'text-gray-800',
          accent: 'text-gray-600'
        };
    }
  };

  const colors = getLevelColor();

  return (
    <div className="relative w-full max-w-sm mx-auto touch-pan-y">
      {/* Timer */}
      {showTimer && timeRemaining > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="flex items-center space-x-2 bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 border">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">
              {Math.ceil(timeRemaining / 1000)}s
            </span>
          </div>
        </motion.div>
      )}

      {/* Turn Indicator */}
      {isMyTurn && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="flex items-center space-x-2 bg-primary/90 text-primary-foreground rounded-full px-3 py-1">
            <Sparkles className="h-3 w-3" />
            <span className="text-xs font-medium">Your Turn</span>
          </div>
        </motion.div>
      )}

      {/* Swipe Indicators */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Skip Indicator */}
        <motion.div
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-red-500/90 text-white rounded-full p-3 shadow-lg"
          style={{
            opacity: useTransform(x, [-100, -50, 0], [1, 0.5, 0]),
            scale: useTransform(x, [-100, -50, 0], [1.2, 1, 0.8]),
          }}
        >
          <X className="h-6 w-6" />
        </motion.div>

        {/* Insight Indicator */}
        <motion.div
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-green-500/90 text-white rounded-full p-3 shadow-lg"
          style={{
            opacity: useTransform(x, [0, 50, 100], [0, 0.5, 1]),
            scale: useTransform(x, [0, 50, 100], [0.8, 1, 1.2]),
          }}
        >
          <Heart className="h-6 w-6" />
        </motion.div>
      </div>

      {/* Main Card */}
      <motion.div
        ref={cardRef}
        drag={!disabled ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x, rotate, opacity }}
        whileTap={{ scale: 0.95 }}
        className={`relative w-full h-[500px] sm:h-[600px] rounded-2xl p-6 shadow-lg cursor-grab active:cursor-grabbing ${colors.bg} ${colors.border} border-2 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors.accent} bg-white/50`}>
            {question.level.toUpperCase()} LEVEL
          </div>
          
          {onReport && (
            <button
              onClick={() => onReport(question.id)}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              disabled={disabled}
            >
              <MessageCircle className="h-4 w-4 text-gray-600" />
            </button>
          )}
        </div>

        {/* Question Text */}
        <div className="flex-1 flex items-center justify-center">
          <p className={`text-lg sm:text-xl font-medium text-center leading-relaxed ${colors.text}`}>
            {question.text}
          </p>
        </div>

        {/* Theme */}
        {question.theme && (
          <div className="mt-4 text-center">
            <span className={`text-sm ${colors.accent} opacity-75`}>
              Theme: {question.theme}
            </span>
          </div>
        )}

        {/* Swipe Instructions */}
        {!disabled && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-400 rounded-full" />
                <span>Swipe left to skip</span>
              </div>
              <div className="w-px h-3 bg-gray-300" />
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span>Swipe right for insight</span>
              </div>
            </div>
          </div>
        )}

        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-black/5 rounded-2xl pointer-events-none" />
        )}
      </motion.div>

      {/* Mobile Action Buttons (fallback) */}
      {!disabled && (
        <div className="flex justify-center space-x-4 mt-4 sm:hidden">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onSwipe('left', question)}
            className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-full shadow-lg"
          >
            <X className="h-5 w-5" />
            <span>Skip</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onSwipe('right', question)}
            className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-full shadow-lg"
          >
            <Heart className="h-5 w-5" />
            <span>Insight</span>
          </motion.button>
        </div>
      )}
    </div>
  );
}

export default MobileGameCard;