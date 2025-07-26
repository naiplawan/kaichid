import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, X, MessageCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Question } from '@/lib/types';
import { 
  useLiveRegion, 
  useFocusManager, 
  useKeyboardNavigation,
  useReducedMotion,
  useAriaDescribedBy 
} from '@/lib/accessibility/a11y-utils';

interface AccessibleGameCardProps {
  question: Question;
  onSwipe: (direction: 'left' | 'right', question: Question) => void;
  onReport?: (questionId: string) => void;
  disabled?: boolean;
  showTimer?: boolean;
  timeRemaining?: number;
  isMyTurn?: boolean;
  isCurrentCard?: boolean;
}

export function AccessibleGameCard({
  question,
  onSwipe,
  onReport,
  disabled = false,
  showTimer = false,
  timeRemaining = 0,
  isMyTurn = false,
  isCurrentCard = false
}: AccessibleGameCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const skipButtonRef = useRef<HTMLButtonElement>(null);
  const insightButtonRef = useRef<HTMLButtonElement>(null);
  const reportButtonRef = useRef<HTMLButtonElement>(null);
  
  const [isSelected, setIsSelected] = useState(false);
  const [currentAction, setCurrentAction] = useState<'skip' | 'insight' | null>(null);
  
  const { announce } = useLiveRegion();
  const { trapFocus } = useFocusManager();
  const { handleArrowKeys, handleEscapeKey } = useKeyboardNavigation();
  const prefersReducedMotion = useReducedMotion();
  const { describedById, setDescription, clearDescription } = useAriaDescribedBy(`question-${question.id}`);

  // Set up description for screen readers
  useEffect(() => {
    const description = [
      `Question level: ${question.level}`,
      question.theme ? `Theme: ${question.theme}` : '',
      isMyTurn ? 'It is your turn to respond' : '',
      showTimer && timeRemaining > 0 ? `Time remaining: ${Math.ceil(timeRemaining / 1000)} seconds` : '',
      disabled ? 'This card is currently disabled' : 'Use arrow keys to navigate, space or enter to select actions'
    ].filter(Boolean).join('. ');

    setDescription(description);

    return () => clearDescription();
  }, [question, isMyTurn, showTimer, timeRemaining, disabled, setDescription, clearDescription]);

  // Announce turn changes
  useEffect(() => {
    if (isMyTurn && isCurrentCard) {
      announce('It is now your turn. You can skip this question or choose to answer it for insight.', 'polite');
    }
  }, [isMyTurn, isCurrentCard, announce]);

  // Focus management when card becomes current
  useEffect(() => {
    if (isCurrentCard && cardRef.current && !disabled) {
      cardRef.current.focus();
    }
  }, [isCurrentCard, disabled]);

  const handleSkip = () => {
    setCurrentAction('skip');
    announce('Skipping question', 'polite');
    onSwipe('left', question);
  };

  const handleInsight = () => {
    setCurrentAction('insight');
    announce('Selected question for insight', 'polite');
    onSwipe('right', question);
  };

  const handleReport = () => {
    if (onReport) {
      announce('Reporting question', 'polite');
      onReport(question.id);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (disabled) return;

    const actionButtons = [skipButtonRef.current, insightButtonRef.current].filter(Boolean) as HTMLButtonElement[];
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        setCurrentAction('skip');
        skipButtonRef.current?.focus();
        announce('Skip action highlighted', 'polite');
        break;
        
      case 'ArrowRight':
        e.preventDefault();
        setCurrentAction('insight');
        insightButtonRef.current?.focus();
        announce('Insight action highlighted', 'polite');
        break;
        
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (e.target === skipButtonRef.current) {
          handleSkip();
        } else if (e.target === insightButtonRef.current) {
          handleInsight();
        }
        break;
        
      case 'r':
      case 'R':
        if (onReport && reportButtonRef.current) {
          e.preventDefault();
          reportButtonRef.current.focus();
          announce('Report button focused', 'polite');
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setCurrentAction(null);
        cardRef.current?.focus();
        announce('Actions cancelled, card focused', 'polite');
        break;
    }
  };

  useEffect(() => {
    const currentCard = cardRef.current;
    if (currentCard) {
      currentCard.addEventListener('keydown', handleKeyDown as any);
      return () => currentCard.removeEventListener('keydown', handleKeyDown as any);
    }
  }, [disabled]);

  const getLevelColor = () => {
    switch (question.level) {
      case 'green':
        return {
          bg: 'bg-gradient-to-br from-green-50 to-green-100',
          border: 'border-green-200',
          text: 'text-green-800',
          accent: 'text-green-600',
          focus: 'focus:ring-green-500'
        };
      case 'yellow':
        return {
          bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          accent: 'text-yellow-600',
          focus: 'focus:ring-yellow-500'
        };
      case 'red':
        return {
          bg: 'bg-gradient-to-br from-red-50 to-red-100',
          border: 'border-red-200',
          text: 'text-red-800',
          accent: 'text-red-600',
          focus: 'focus:ring-red-500'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
          border: 'border-gray-200',
          text: 'text-gray-800',
          accent: 'text-gray-600',
          focus: 'focus:ring-gray-500'
        };
    }
  };

  const colors = getLevelColor();

  const cardMotionProps = prefersReducedMotion ? {} : {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Skip to actions link for screen readers */}
      <a 
        href={`#actions-${question.id}`}
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:px-2 focus:py-1 focus:bg-blue-600 focus:text-white focus:rounded text-sm"
      >
        Skip to card actions
      </a>

      {/* Timer announcement */}
      {showTimer && timeRemaining > 0 && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10">
          <div 
            className="flex items-center space-x-2 bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 border"
            role="timer"
            aria-live="polite"
            aria-label={`Time remaining: ${Math.ceil(timeRemaining / 1000)} seconds`}
          >
            <span className="text-sm font-medium">
              {Math.ceil(timeRemaining / 1000)}s
            </span>
          </div>
        </div>
      )}

      {/* Turn indicator */}
      {isMyTurn && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
          <div 
            className="flex items-center space-x-2 bg-primary/90 text-primary-foreground rounded-full px-3 py-1"
            role="status"
            aria-label="It is your turn"
          >
            <span className="text-xs font-medium">Your Turn</span>
          </div>
        </div>
      )}

      {/* Main Card */}
      <motion.div
        ref={cardRef}
        {...cardMotionProps}
        className={`
          relative w-full h-[500px] sm:h-[600px] rounded-2xl p-6 shadow-lg border-2
          ${colors.bg} ${colors.border} ${colors.focus}
          focus:outline-none focus:ring-4 focus:ring-offset-2
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isCurrentCard ? 'ring-2 ring-blue-500' : ''}
        `}
        role="article"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Question card: ${question.text}`}
        aria-describedby={describedById}
        aria-current={isCurrentCard ? 'true' : undefined}
        onFocus={() => setIsSelected(true)}
        onBlur={() => setIsSelected(false)}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div 
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors.accent} bg-white/50`}
            role="img"
            aria-label={`${question.level} difficulty level`}
          >
            {question.level.toUpperCase()} LEVEL
          </div>
          
          {onReport && (
            <Button
              ref={reportButtonRef}
              variant="ghost"
              size="sm"
              onClick={handleReport}
              disabled={disabled}
              className="p-2 rounded-full hover:bg-white/20 transition-colors focus:ring-2 focus:ring-offset-2"
              aria-label="Report this question"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>

        {/* Question Text */}
        <div className="flex-1 flex items-center justify-center mb-6">
          <h2 className={`text-lg sm:text-xl font-medium text-center leading-relaxed ${colors.text}`}>
            {question.text}
          </h2>
        </div>

        {/* Theme */}
        {question.theme && (
          <div className="text-center mb-6">
            <span className={`text-sm ${colors.accent} opacity-75`}>
              Theme: {question.theme}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div 
          id={`actions-${question.id}`}
          className="flex justify-center space-x-4"
          role="group"
          aria-label="Question actions"
        >
          <Button
            ref={skipButtonRef}
            onClick={handleSkip}
            disabled={disabled}
            variant="outline"
            size="lg"
            className={`
              flex items-center space-x-2 px-6 py-3 
              ${currentAction === 'skip' ? 'ring-2 ring-red-500' : ''}
              focus:ring-2 focus:ring-red-500 focus:ring-offset-2
              hover:bg-red-50 transition-colors
            `}
            aria-label="Skip this question and move to the next one"
            aria-pressed={currentAction === 'skip'}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            <span>Skip</span>
          </Button>

          <Button
            ref={insightButtonRef}
            onClick={handleInsight}
            disabled={disabled}
            size="lg"
            className={`
              flex items-center space-x-2 px-6 py-3 
              ${currentAction === 'insight' ? 'ring-2 ring-green-500' : ''}
              focus:ring-2 focus:ring-green-500 focus:ring-offset-2
              hover:bg-green-50 transition-colors
            `}
            aria-label="Choose this question to answer for insight"
            aria-pressed={currentAction === 'insight'}
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
            <span>Insight</span>
          </Button>
        </div>

        {/* Keyboard hints */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p className="sr-only">
              Use left and right arrow keys to navigate between skip and insight. 
              Press R to report this question. Press Escape to cancel selection.
            </p>
            <div className="hidden sm:block text-center">
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                ← Skip • Insight →
              </span>
            </div>
          </div>
        </div>

        {/* High contrast overlay when focused */}
        {isSelected && (
          <div className="absolute inset-0 ring-4 ring-blue-500 ring-opacity-50 rounded-2xl pointer-events-none" />
        )}
      </motion.div>

      {/* Screen reader only status */}
      <div className="sr-only" aria-live="polite" role="status">
        {currentAction && `${currentAction} action selected`}
        {isMyTurn && 'It is your turn to respond to this question'}
        {disabled && 'This question card is currently disabled'}
      </div>
    </div>
  );
}

export default AccessibleGameCard;