'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { buscarGlobal, type SearchResult } from '@/app/actions/buscar'
import {
  Search,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  X,
} from 'lucide-react'

const typeIcons = {
  entrada: ArrowDownLeft,
  salida: ArrowUpRight,
  proveedor: Users,
  inventario: Package,
}

const typeLabels = {
  entrada: 'Entrada',
  salida: 'Salida',
  proveedor: 'Proveedor',
  inventario: 'Inventario',
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSearch = useCallback(async (value: string) => {
    setQuery(value)
    if (value.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const data = await buscarGlobal(value)
      setResults(data)
    } finally {
      setLoading(false)
    }
  }, [])

  function handleSelect(href: string) {
    setOpen(false)
    setQuery('')
    setResults([])
    router.push(href)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-muted-foreground"
        onClick={() => {
          setOpen(true)
          setTimeout(() => inputRef.current?.focus(), 100)
        }}
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Buscar...</span>
        <kbd className="pointer-events-none hidden select-none rounded border bg-muted px-1.5 text-[10px] font-medium md:inline">
          ⌘K
        </kbd>
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative z-50 w-full max-w-lg rounded-lg border bg-background shadow-xl">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Buscar entradas, salidas, proveedores..."
                className="border-0 focus-visible:ring-0"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {loading && (
                <p className="py-6 text-center text-sm text-muted-foreground">Buscando...</p>
              )}
              {!loading && query.length >= 2 && results.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Sin resultados para &quot;{query}&quot;
                </p>
              )}
              {results.map((result, i) => {
                const Icon = typeIcons[result.type]
                return (
                  <button
                    key={`${result.type}-${i}`}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                    onClick={() => handleSelect(result.href)}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{result.title}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {result.subtitle}
                      </div>
                    </div>
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {typeLabels[result.type]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
