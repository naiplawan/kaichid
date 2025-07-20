import * as React from "react"
import { motion, useAnimation, type PanInfo } from "framer-motion"
import { Flag, Zap, Brain, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { Question } from "@/lib/supabase"
import { SwipeDirection } from "@/lib/types"

interface GameCardProps {
  question: Question
  onSwipe: (direction: SwipeDirection, question: Question) => void
  onReport: (questionId: string) => void
  disabled?: boolean
  className?: string
}

const levelStyles = {
  green: "level-green",
  yellow: "level-yellow", 
  red: "level-red",
  purple: "level-purple",
}

const levelIcons = {
  green: Target,
  yellow: Brain,
  red: Zap,
  purple: Zap,
}

const levelColors = {
  green: "#26890c",
  yellow: "#ffa602",
  red: "#e21b3c",
  purple: "#9c4494",
}

export const GameCard = React.forwardRef<HTMLDivElement, GameCardProps>(
  ({ question, onSwipe, onReport, disabled = false, className }, ref) => {
    const [swipeDirection, setSwipeDirection] = React.useState<SwipeDirection | null>(null)
    const [showFeedback, setShowFeedback] = React.useState(false)
    const controls = useAnimation()
    
    const LevelIcon = levelIcons[question.level as keyof typeof levelIcons] || Target

    const handleDragEnd = (event: any, info: PanInfo) => {
      if (disabled) return

      const threshold = 150
      const { offset, velocity } = info

      if (Math.abs(offset.x) > threshold || Math.abs(velocity.x) > 500) {
        const direction = offset.x > 0 ? "right" : "left"
        setSwipeDirection(direction)

        // Animate card out with web3 style
        controls
          .start({
            x: direction === "right" ? 1000 : -1000,
            rotate: direction === "right" ? 15 : -15,
            opacity: 0,
            scale: 0.8,
            transition: { duration: 0.4, ease: "easeInOut" },
          })
          .then(() => {
            onSwipe(direction, question)
          })
      } else {
        // Snap back with elastic animation
        controls.start({
          x: 0,
          rotate: 0,
          scale: 1,
          transition: { type: "spring", stiffness: 500, damping: 30 },
        })
        setSwipeDirection(null)
        setShowFeedback(false)
      }
    }

    const handleDrag = (event: any, info: PanInfo) => {
      if (disabled) return

      const { offset } = info
      const threshold = 100

      if (Math.abs(offset.x) > threshold) {
        const direction = offset.x > 0 ? "right" : "left"
        setSwipeDirection(direction)
        setShowFeedback(true)
      } else {
        setSwipeDirection(null)
        setShowFeedback(false)
      }
    }

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <motion.div
          ref={ref}
          className={cn(
            "kahoot-card w-80 h-96 p-8 cursor-grab active:cursor-grabbing select-none",
            levelStyles[question.level as keyof typeof levelStyles],
            "cyber-grid",
            className
          )}
          drag={!disabled ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={controls}
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          whileInView={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
          }}
          whileHover={{
            scale: 1.02,
            y: -5,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Level Indicator with Neon Effect */}
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <motion.div
              className="w-3 h-3 rounded-full"
              style={{ 
                backgroundColor: levelColors[question.level as keyof typeof levelColors],
                boxShadow: `0 0 15px ${levelColors[question.level as keyof typeof levelColors]}`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <LevelIcon 
              className="w-4 h-4 text-current opacity-80" 
              style={{ color: levelColors[question.level as keyof typeof levelColors] }}
            />
          </div>

          {/* Question Content */}
          <div className="h-full flex flex-col justify-center items-center text-center relative z-10">
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-sm font-kahoot font-medium tracking-wider uppercase text-teal-300/80 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
                {question.level} • {question.theme}
              </span>
            </motion.div>
            
            <motion.h3 
              className="text-xl font-display font-semibold leading-relaxed text-white mb-8 px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {question.text}
            </motion.h3>
            
            <motion.div 
              className="text-xs text-teal-300/60 absolute bottom-0 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-kahoot-green rounded-full animate-pulse"></span>
                  <span>Swipe right for insight</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-kahoot-red rounded-full animate-pulse"></span>
                  <span>Swipe left to skip</span>
                </span>
              </span>
            </motion.div>
          </div>

          {/* Swipe Feedback with Web3 Style */}
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "swipe-feedback",
                swipeDirection === "right" ? "insight-feedback" : "skip-feedback"
              )}
            >
              <motion.span
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: swipeDirection === "right" ? [15, 20, 15] : [-15, -20, -15],
                }}
                transition={{
                  duration: 0.3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {swipeDirection === "right" ? "INSIGHT" : "SKIP"}
              </motion.span>
            </motion.div>
          )}

          {/* Report Button */}
          <motion.button
            onClick={() => onReport(question.id)}
            className="absolute bottom-4 left-4 text-xs text-teal-400/60 hover:text-kahoot-red transition-all flex items-center space-x-1 opacity-80 hover:opacity-100 bg-kahoot-dark/50 px-2 py-1 rounded-lg border border-teal-500/20 hover:border-red-500/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Flag size={12} />
            <span>Report</span>
          </motion.button>
        </motion.div>
      </div>
    )
  }
)

GameCard.displayName = "GameCard"