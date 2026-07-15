import { cn } from '@/lib/utils'

export function ResponsiveTable({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('w-full overflow-x-auto rounded-md border', className)}>
      {children}
    </div>
  )
}
