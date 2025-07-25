import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "btn-kahoot-primary",
        destructive: "btn-kahoot-danger",
        outline: "btn-kahoot-secondary",
        secondary: "bg-kahoot-dark-surface text-teal-300 hover:bg-kahoot-dark-card border border-teal-500/30 hover:border-teal-400",
        ghost: "text-teal-300 hover:bg-teal-500/10 hover:text-teal-200",
        link: "text-teal-400 underline-offset-4 hover:underline hover:text-teal-300",
        success: "btn-kahoot-success",
        neon: "neon-border neon-glow bg-transparent text-teal-300 hover:bg-teal-500/10",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-lg px-3",
        lg: "h-14 rounded-xl px-8 text-lg font-bold",
        xl: "h-16 rounded-2xl px-10 text-xl font-bold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }