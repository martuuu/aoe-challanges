import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5',
        destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl',
        outline:
          'border-2 border-blue-200 bg-white text-blue-600 hover:border-blue-300 hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-200',
        secondary:
          'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5',
        ghost: 'hover:bg-blue-50 hover:text-blue-600 text-green-700',
        link: 'text-blue-600 underline-offset-4 hover:underline hover:text-blue-500',
        soft: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 hover:border-blue-200',
      },
      size: {
        default: 'h-11 px-6 py-3',
        sm: 'h-9 rounded-lg px-4 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
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
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
