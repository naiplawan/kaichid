import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const toastVariants = cva(
  "fixed top-4 right-4 z-50 max-w-md p-4 rounded-xl border backdrop-blur-lg shadow-2xl",
  {
    variants: {
      variant: {
        default: "bg-kahoot-dark-card/90 border-teal-500/30 text-teal-100",
        success: "bg-kahoot-green/20 border-kahoot-green text-green-100 shadow-green-500/30",
        error: "bg-kahoot-red/20 border-kahoot-red text-red-100 shadow-red-500/30",
        warning: "bg-kahoot-yellow/20 border-kahoot-yellow text-yellow-100 shadow-yellow-500/30",
        info: "bg-kahoot-blue/20 border-kahoot-blue text-blue-100 shadow-blue-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface ToastProps extends VariantProps<typeof toastVariants> {
  message: string
  duration?: number
  onClose: () => void
  className?: string
}

const toastIcons = {
  default: Info,
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ message, variant = "default", duration = 5000, onClose, className }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)
    const Icon = toastIcons[variant || "default"]

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300)
      }, duration)

      return () => clearTimeout(timer)
    }, [duration, onClose])

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className={cn(toastVariants({ variant }), className)}
          >
            <div className="flex items-center space-x-3">
              <Icon className="h-5 w-5 flex-shrink-0" />
              <p className="flex-1 text-sm font-medium">{message}</p>
              <button
                onClick={() => setIsVisible(false)}
                className="text-current/60 hover:text-current transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
)
Toast.displayName = "Toast"

export { Toast, toastVariants }