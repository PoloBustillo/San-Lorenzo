'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SortableHeadProps {
  label: string
  field: string
  basePath: string
  className?: string
}

export function SortableHead({ label, field, basePath, className }: SortableHeadProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentSort = searchParams.get('sortBy')
  const currentOrder = searchParams.get('sortOrder')
  const isActive = currentSort === field

  function handleClick() {
    const params = new URLSearchParams(searchParams.toString())
    if (isActive) {
      params.set('sortOrder', currentOrder === 'asc' ? 'desc' : 'asc')
    } else {
      params.set('sortBy', field)
      params.set('sortOrder', 'asc')
    }
    params.delete('page')
    router.push(`${basePath}?${params.toString()}`)
  }

  return (
    <th
      className={cn(
        'h-10 px-2 text-left align-middle font-medium whitespace-nowrap cursor-pointer select-none hover:bg-accent/50 transition-colors',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive ? (
          currentOrder === 'asc' ? (
            <ArrowUp className="h-3 w-3 shrink-0" />
          ) : (
            <ArrowDown className="h-3 w-3 shrink-0" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 shrink-0 opacity-40" />
        )}
      </div>
    </th>
  )
}
