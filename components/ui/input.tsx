import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-xl border-2 border-blue-200 bg-white px-4 py-3 text-sm text-green-700 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-blue-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 focus-visible:border-blue-400 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:border-blue-300',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
