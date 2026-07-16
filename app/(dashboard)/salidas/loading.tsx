import { TableSkeleton } from '@/components/skeletons'

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-md bg-primary/10" />
          <div className="h-4 w-64 animate-pulse rounded-md bg-primary/10" />
        </div>
      </div>
      <TableSkeleton cols={5} />
    </div>
  )
}
