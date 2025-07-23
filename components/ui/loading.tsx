import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'accent' | 'white'
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  }

  const variantClasses = {
    primary: 'border-blue-600 border-t-transparent',
    secondary: 'border-green-600 border-t-transparent',
    accent: 'border-orange-500 border-t-transparent',
    white: 'border-white border-t-transparent',
  }

  return (
    <div
      className={cn(
        'rounded-full animate-spin',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  )
}

interface LoadingCardProps {
  children?: React.ReactNode
  className?: string
}

export function LoadingCard({ children, className }: LoadingCardProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border border-blue-200',
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" variant="primary" />
        {children && <p className="text-sm text-blue-600 font-medium">{children}</p>}
      </div>
    </div>
  )
}

interface LoadingWidgetProps {
  className?: string
}

export function LoadingWidget({ className }: LoadingWidgetProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-4',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <div className="h-3 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-400 rounded mb-1"></div>
          <div className="h-2 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  )
}
