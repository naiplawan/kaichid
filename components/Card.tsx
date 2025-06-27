import { useState, useRef } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Question } from '@/lib/supabase';

interface CardProps {
  question: Question;
  onSwipe: (direction: 'left' | 'right', question: Question) => void;
  onReport: (questionId: string) => void;
  disabled?: boolean;
}

export default function Card({ question, onSwipe, onReport, disabled = false }: CardProps) {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
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
          rotate: direction === 'right' ? 30 : -30,
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

  const getLevelClass = () => {
    switch (question.level) {
      case 'green':
        return 'level-green';
      case 'yellow':
        return 'level-yellow';
      case 'red':
        return 'level-red';
      default:
        return 'level-green';
    }
  };

  const getLevelColor = () => {
    switch (question.level) {
      case 'green':
        return '#10b981';
      case 'yellow':
        return '#f59e0b';
      case 'red':
        return '#ef4444';
      default:
        return '#10b981';
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        ref={cardRef}
        className={`mystical-card w-80 h-96 p-8 cursor-grab active:cursor-grabbing select-none ${getLevelClass()}`}
        drag={!disabled ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          borderColor: getLevelColor(),
          boxShadow: `0 0 30px ${getLevelColor()}20`,
        }}
      >
        {/* Card Border Design */}
        <div className="absolute inset-2 border border-mystical-gold/30 rounded-md"></div>
        <div className="absolute inset-4 border border-mystical-gold/20 rounded-sm"></div>

        {/* Level Indicator */}
        <div className="absolute top-4 right-4">
          <div
            className="w-4 h-4 rounded-full border-2"
            style={{ borderColor: getLevelColor(), backgroundColor: `${getLevelColor()}40` }}
          ></div>
        </div>

        {/* Question Content */}
        <div className="h-full flex flex-col justify-center items-center text-center relative z-10">
          <div className="mb-4">
            <span className="text-sm font-mystical tracking-wider uppercase opacity-60">
              {question.level} • {question.theme}
            </span>
          </div>

          <h3 className="text-lg font-oracle leading-relaxed text-white mb-6">{question.text}</h3>

          <div className="text-xs text-gray-400 absolute bottom-0">Swipe right for insight • Swipe left to skip</div>
        </div>

        {/* Swipe Feedback */}
        {showFeedback && (
          <div className={`swipe-feedback ${swipeDirection === 'right' ? 'insight-feedback' : 'skip-feedback'}`}>
            {swipeDirection === 'right' ? 'INSIGHT' : 'SKIP'}
          </div>
        )}

        {/* Mystical Elements */}
        <div className="absolute top-6 left-6 text-mystical-gold opacity-30">✦</div>
        <div className="absolute bottom-6 right-6 text-mystical-gold opacity-30">✦</div>
        <div className="absolute top-1/3 left-2 text-mystical-gold opacity-20 text-xs">◆</div>
        <div className="absolute bottom-1/3 right-2 text-mystical-gold opacity-20 text-xs">◆</div>

        {/* Report Button */}
        <button 
            onClick={() => onReport(question.id)}
            className="absolute bottom-4 left-4 text-xs text-gray-500 hover:text-red-500 transition-colors"
        >
            Report
        </button>
      </motion.div>
    </div>
  );
}
