import * as React from "react"
import { motion } from "framer-motion"
import { Flag, Zap, Brain, Target, ArrowRight, SkipForward } from "lucide-react"
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
    const LevelIcon = levelIcons[question.level as keyof typeof levelIcons] || Target

    const handleInsightClick = () => {
      if (disabled) return
      onSwipe("right", question)
    }

    const handleSkipClick = () => {
      if (disabled) return
      onSwipe("left", question)
    }

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center gap-6">
        <motion.div
          ref={ref}
          className={cn(
            "kahoot-card w-80 h-96 p-8 select-none",
            levelStyles[question.level as keyof typeof levelStyles],
            "cyber-grid",
            className
          )}
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
            
          </div>


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

        {/* Action Buttons */}
        <div className="flex space-x-6">
          <motion.button
            onClick={handleSkipClick}
            disabled={disabled}
            className="kahoot-button bg-kahoot-red/20 hover:bg-kahoot-red/30 border-kahoot-red/40 text-kahoot-red px-6 py-3 rounded-xl font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SkipForward className="w-5 h-5" />
            <span>Skip</span>
          </motion.button>
          
          <motion.button
            onClick={handleInsightClick}
            disabled={disabled}
            className="kahoot-button bg-kahoot-green/20 hover:bg-kahoot-green/30 border-kahoot-green/40 text-kahoot-green px-6 py-3 rounded-xl font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowRight className="w-5 h-5" />
            <span>Insight</span>
          </motion.button>
        </div>
      </div>
    )
  }
)

GameCard.displayName = "GameCard"