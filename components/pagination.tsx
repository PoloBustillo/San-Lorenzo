import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  basePath: string
  params?: Record<string, string | undefined>
}

export function Pagination({ page, totalPages, total, basePath, params = {} }: PaginationProps) {
  function buildHref(p: number) {
    const sp = new URLSearchParams()
    if (p > 1) sp.set('page', String(p))
    for (const [key, val] of Object.entries(params)) {
      if (val) sp.set(key, val)
    }
    const qs = sp.toString()
    return `${basePath}${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Página {page} de {totalPages} — {total} resultados
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          render={<Link href={buildHref(page - 1)} />}
          nativeButton={false}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          render={<Link href={buildHref(page + 1)} />}
          nativeButton={false}
          disabled={page >= totalPages}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
