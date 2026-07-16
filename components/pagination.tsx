'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  basePath: string
  params?: Record<string, string | undefined>
}

export function Pagination({ page, totalPages, total, basePath, params = {} }: PaginationProps) {
  const router = useRouter()
  const [pageInput, setPageInput] = useState(String(page))

  const buildHref = useCallback(
    (p: number) => {
      const sp = new URLSearchParams()
      if (p > 1) sp.set('page', String(p))
      for (const [key, val] of Object.entries(params)) {
        if (val) sp.set(key, val)
      }
      const qs = sp.toString()
      return `${basePath}${qs ? `?${qs}` : ''}`
    },
    [basePath, params]
  )

  function goToPage() {
    const p = parseInt(pageInput, 10)
    if (!isNaN(p) && p >= 1 && p <= totalPages && p !== page) {
      router.push(buildHref(p))
    } else {
      setPageInput(String(page))
    }
  }

  const isFirst = page <= 1
  const isLast = page >= totalPages

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Página {page} de {totalPages} — {total} resultados
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={buildHref(page - 1)}
          aria-disabled={isFirst}
          tabIndex={isFirst ? -1 : undefined}
          className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-all outline-none select-none ${
            isFirst
              ? 'pointer-events-none opacity-50'
              : 'hover:bg-muted hover:text-foreground'
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Link>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={goToPage}
              onKeyDown={(e) => {
                if (e.key === 'Enter') goToPage()
              }}
              className="h-7 w-14 text-center text-xs"
            />
          </div>
        )}

        <Link
          href={buildHref(page + 1)}
          aria-disabled={isLast}
          tabIndex={isLast ? -1 : undefined}
          className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-all outline-none select-none ${
            isLast
              ? 'pointer-events-none opacity-50'
              : 'hover:bg-muted hover:text-foreground'
          }`}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
