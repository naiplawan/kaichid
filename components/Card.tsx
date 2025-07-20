'use client';

import { useState, useRef } from 'react';
import { motion, useAnimation, type PanInfo } from 'framer-motion';
import { Flag } from 'lucide-react';
import { Question } from '@/lib/supabase';
import { CardProps, SwipeDirection } from '@/lib/types';

export default function Card({ question, onSwipe, onReport, disabled = false }: CardProps) {
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (disabled) return;

    const threshold = 150;
    const { offset, velocity } = info;

    if (Math.abs(offset.x) > threshold || Math.abs(velocity.x) > 500) {
      const direction = offset.x > 0 ? 'right' : 'left';
      setSwipeDirection(direction);

      // Animate card out
      controls
        .start({
          x: direction === 'right' ? 1000 : -1000,
          rotate: direction === 'right' ? 10 : -10,
          opacity: 0,
          transition: { duration: 0.3 },
        })
        .then(() => {
          onSwipe(direction, question);
        });
    } else {
      // Snap back to center
      controls.start({
        x: 0,
        rotate: 0,
        transition: { type: 'spring', stiffness: 500, damping: 30 },
      });
      setSwipeDirection(null);
      setShowFeedback(false);
    }
  };

  const handleDrag = (event: any, info: PanInfo) => {
    if (disabled) return;

    const { offset } = info;
    const threshold = 100;

    if (Math.abs(offset.x) > threshold) {
      const direction = offset.x > 0 ? 'right' : 'left';
      setSwipeDirection(direction);
      setShowFeedback(true);
    } else {
      setSwipeDirection(null);
      setShowFeedback(false);
    }
  };

  const getLevelColor = () => {
    switch (question.level) {
      case 'green':
        return '#6EE7B7'; // Emerald-300 for a subtle glow
      case 'yellow':
        return '#FCD34D'; // Amber-300
      case 'red':
        return '#F87171'; // Red-400
      default:
        return '#6EE7B7';
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        ref={cardRef}
        className={`glass-card w-80 h-96 p-8 cursor-grab active:cursor-grabbing select-none`}
        drag={!disabled ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          borderColor: getLevelColor(), // Border color based on level
          boxShadow: `0 8px 32px 0 rgba(31, 38, 135, 0.37), 0 0 40px ${getLevelColor()}20`, // Glassmorphism shadow + subtle glow
        }}
      >
        {/* Level Indicator - now a simple glowing dot */}
        <div className="absolute top-4 right-4">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getLevelColor(), boxShadow: `0 0 10px ${getLevelColor()}` }}
          ></div>
        </div>

        {/* Question Content */}
        <div className="h-full flex flex-col justify-center items-center text-center relative z-10">
          <div className="mb-4">
            <span className="text-sm font-modern-sans tracking-wider uppercase text-gray-300 opacity-80">
              {question.level} • {question.theme}
            </span>
          </div>
          <h3 className="text-xl font-modern-heading leading-relaxed text-white mb-6">{question.text}</h3>
          <div className="text-xs text-gray-400 absolute bottom-0 opacity-70">
            Swipe right for insight • Swipe left to skip
          </div>
        </div>

        {/* Swipe Feedback */}
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={`swipe-feedback ${swipeDirection === 'right' ? 'insight-feedback' : 'skip-feedback'}`}
          >
            {swipeDirection === 'right' ? 'INSIGHT' : 'SKIP'}
          </motion.div>
        )}

        {/* Report Button */}
        <button
          onClick={() => onReport(question.id)}
          className="absolute bottom-4 left-4 text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1 opacity-80 hover:opacity-100"
        >
          <Flag size={14} />
          Report
        </button>
      </motion.div>
    </div>
  );
}
