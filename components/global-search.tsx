'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { buscarGlobal, type SearchResult } from '@/app/actions/buscar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'cmdk'
import {
  Search,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
} from 'lucide-react'
import './global-search.css'

const typeConfig = {
  entrada: { icon: ArrowDownLeft, label: 'Entradas' },
  salida: { icon: ArrowUpRight, label: 'Salidas' },
  proveedor: { icon: Users, label: 'Proveedores' },
  inventario: { icon: Package, label: 'Inventario' },
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
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

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const grouped = results.reduce(
    (acc, r) => {
      if (!acc[r.type]) acc[r.type] = []
      acc[r.type].push(r)
      return acc
    },
    {} as Record<string, SearchResult[]>
  )

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-muted-foreground h-8 px-2 md:px-3"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Buscar...</span>
        <kbd className="pointer-events-none hidden select-none rounded border bg-muted px-1.5 text-[10px] font-medium md:inline">
          ⌘K
        </kbd>
      </Button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2">
            <Command
              className="rounded-lg border bg-background shadow-2xl overflow-hidden"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setOpen(false)
                }
              }}
            >
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <CommandInput
                  value={query}
                  onValueChange={handleSearch}
                  placeholder="Buscar entradas, salidas, proveedores..."
                  className="h-11 flex-1"
                  autoFocus
                />
              </div>
              <CommandList className="max-h-[350px]">
                {loading && query.length >= 2 && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Buscando...
                  </div>
                )}
                {!loading && query.length >= 2 && results.length === 0 && (
                  <CommandEmpty>Sin resultados para &quot;{query}&quot;</CommandEmpty>
                )}
                {(Object.keys(grouped) as Array<keyof typeof typeConfig>).map((type) => {
                  const config = typeConfig[type]
                  const Icon = config.icon
                  const items = grouped[type]
                  if (!items || items.length === 0) return null
                  return (
                    <CommandGroup key={type} heading={config.label}>
                      {items.map((result, i) => (
                        <CommandItem
                          key={`${type}-${i}`}
                          value={`${result.title} ${result.subtitle}`}
                          onSelect={() => handleSelect(result.href)}
                          className="cursor-pointer"
                        >
                          <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium">{result.title}</div>
                            <div className="truncate text-xs text-muted-foreground">
                              {result.subtitle}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )
                })}
              </CommandList>
              <div className="flex items-center justify-between border-t px-3 py-1.5 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border bg-muted px-1">↑↓</kbd> navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border bg-muted px-1">↵</kbd> seleccionar
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border bg-muted px-1">esc</kbd> cerrar
                </span>
              </div>
            </Command>
          </div>
        </div>
      )}
    </>
  )
}
