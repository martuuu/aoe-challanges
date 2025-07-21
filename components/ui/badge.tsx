import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 border',
  {
    variants: {
      variant: {
        default: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100',
        secondary: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
        success: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
        destructive: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200',
        outline: 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50',
        soft: 'bg-blue-50/50 text-blue-600 border-blue-100/50 hover:bg-blue-100/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
