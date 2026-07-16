'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export type FilterField =
  | 'material'
  | 'estatus'
  | 'proveedor'
  | 'fechaDesde'
  | 'fechaHasta'
  | 'semana'
  | 'numero'

interface FilterBarProps {
  basePath: string
  fields: FilterField[]
  materiales?: string[]
  proveedores?: { id: string; nombre: string }[]
}

function navigate(basePath: string, currentParams: URLSearchParams, updates: Record<string, string | null>) {
  const params = new URLSearchParams(currentParams.toString())
  for (const [key, val] of Object.entries(updates)) {
    if (val === null || val === '') {
      params.delete(key)
    } else {
      params.set(key, val)
    }
  }
  params.delete('page')
  return `${basePath}?${params.toString()}`
}

function countActiveFilters(searchParams: URLSearchParams, fields: FilterField[]): number {
  let count = 0
  for (const field of fields) {
    const key = field === 'proveedor' ? 'proveedorId' : field
    if (searchParams.get(key)) count++
  }
  return count
}

interface FilterFieldsInnerProps {
  basePath: string
  fields: FilterField[]
  materiales?: string[]
  proveedores?: { id: string; nombre: string }[]
  onClose?: () => void
}

function FilterFieldsInner({
  basePath,
  fields,
  materiales = [],
  proveedores = [],
  onClose,
}: FilterFieldsInnerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const push = useCallback(
    (url: string) => router.push(url),
    [router]
  )

  function onSelect(field: string, value: string | null) {
    const url = navigate(basePath, searchParams, { [field]: value || null })
    push(url)
    onClose?.()
  }

  function onInputBlur(field: string, e: React.FocusEvent<HTMLInputElement>) {
    const val = e.target.value.trim()
    const current = searchParams.get(field) ?? ''
    if (val !== current) {
      const url = navigate(basePath, searchParams, { [field]: val || null })
      push(url)
      onClose?.()
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      {fields.includes('material') && (
        <div className="space-y-2">
          <Label>Material</Label>
          <Select
            value={searchParams.get('material') ?? ''}
            onValueChange={(val) => onSelect('material', val)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {materiales.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {fields.includes('estatus') && (
        <div className="space-y-2">
          <Label>Estatus</Label>
          <Select
            value={searchParams.get('estatus') ?? ''}
            onValueChange={(val) => onSelect('estatus', val)}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="EnInventario">En inventario</SelectItem>
              <SelectItem value="EnPreparacion">En preparación</SelectItem>
              <SelectItem value="Entregado">Entregado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {fields.includes('proveedor') && (
        <div className="space-y-2">
          <Label>Proveedor</Label>
          <Select
            value={searchParams.get('proveedorId') ?? ''}
            onValueChange={(val) => onSelect('proveedorId', val)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {proveedores.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {fields.includes('numero') && (
        <div className="space-y-2">
          <Label>Número</Label>
          <Input
            type="number"
            defaultValue={searchParams.get('numero') ?? ''}
            placeholder="N°"
            className="w-28"
            min={1}
            onBlur={(e) => onInputBlur('numero', e)}
          />
        </div>
      )}

      {fields.includes('fechaDesde') && (
        <div className="space-y-2">
          <Label>Desde</Label>
          <Input
            type="date"
            defaultValue={searchParams.get('fechaDesde') ?? ''}
            className="w-40"
            onBlur={(e) => onInputBlur('fechaDesde', e)}
          />
        </div>
      )}

      {fields.includes('fechaHasta') && (
        <div className="space-y-2">
          <Label>Hasta</Label>
          <Input
            type="date"
            defaultValue={searchParams.get('fechaHasta') ?? ''}
            className="w-40"
            onBlur={(e) => onInputBlur('fechaHasta', e)}
          />
        </div>
      )}

      {fields.includes('semana') && (
        <div className="space-y-2">
          <Label>Semana</Label>
          <Input
            type="number"
            defaultValue={searchParams.get('semana') ?? ''}
            placeholder="N°"
            className="w-20"
            min={1}
            max={53}
            onBlur={(e) => onInputBlur('semana', e)}
          />
        </div>
      )}

      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          router.push(basePath)
          onClose?.()
        }}
      >
        Limpiar
      </Button>
    </div>
  )
}

export function FilterBar(props: FilterBarProps) {
  const searchParams = useSearchParams()
  const activeCount = countActiveFilters(searchParams, props.fields)

  return (
    <>
      <div className="hidden md:block">
        <FilterFieldsInner {...props} />
      </div>

      <div className="md:hidden">
        <Sheet>
          <SheetTrigger render={<Button variant="outline" size="sm" />}>
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filtros
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center">
                {activeCount}
              </Badge>
            )}
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-4">
              <FilterFieldsInner {...props} onClose={() => document.querySelector('[data-slot="sheet-close"]')?.dispatchEvent(new MouseEvent('click'))} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
