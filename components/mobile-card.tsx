import { cn } from '@/lib/utils'

interface MobileCardProps {
  children: React.ReactNode
  className?: string
}

export function MobileCard({ children, className }: MobileCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-3 space-y-2 md:hidden',
        className
      )}
    >
      {children}
    </div>
  )
}

interface MobileCardFieldProps {
  label: string
  children: React.ReactNode
  className?: string
}

export function MobileCardField({ label, children, className }: MobileCardFieldProps) {
  return (
    <div className={cn('flex items-center justify-between text-sm', className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  )
}

export function MobileCardList({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 md:hidden">{children}</div>
}
