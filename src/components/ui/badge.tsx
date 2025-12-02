import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[hsl(205,100%,62%)]/20 text-[hsl(205,100%,62%)]",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive/20 text-destructive",
        outline: "text-foreground border-border/50",
        success:
          "border-transparent bg-[hsl(145,70%,55%)]/20 text-[hsl(145,70%,55%)]",
        warning:
          "border-transparent bg-[hsl(40,100%,60%)]/20 text-[hsl(40,100%,60%)]",
        purple:
          "border-transparent bg-[hsl(260,70%,60%)]/20 text-[hsl(260,70%,60%)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
