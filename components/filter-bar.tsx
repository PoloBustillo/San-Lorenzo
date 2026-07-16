'use client'

import { useRouter, useSearchParams } from 'next/navigation'
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

export function FilterBar({
  basePath,
  fields,
  materiales = [],
  proveedores = [],
}: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const params = new URLSearchParams()
    for (const field of fields) {
      const val = String(formData.get(field) ?? '')
      if (val) params.set(field, val)
    }
    router.push(`${basePath}?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      {fields.includes('material') && (
        <div className="space-y-2">
          <Label>Material</Label>
          <Select name="material" defaultValue={searchParams.get('material') ?? ''}>
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
          <Select name="estatus" defaultValue={searchParams.get('estatus') ?? ''}>
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
          <Select name="proveedorId" defaultValue={searchParams.get('proveedorId') ?? ''}>
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
            name="numero"
            defaultValue={searchParams.get('numero') ?? ''}
            placeholder="N°"
            className="w-28"
            min={1}
          />
        </div>
      )}

      {fields.includes('fechaDesde') && (
        <div className="space-y-2">
          <Label>Desde</Label>
          <Input
            type="date"
            name="fechaDesde"
            defaultValue={searchParams.get('fechaDesde') ?? ''}
            className="w-40"
          />
        </div>
      )}

      {fields.includes('fechaHasta') && (
        <div className="space-y-2">
          <Label>Hasta</Label>
          <Input
            type="date"
            name="fechaHasta"
            defaultValue={searchParams.get('fechaHasta') ?? ''}
            className="w-40"
          />
        </div>
      )}

      {fields.includes('semana') && (
        <div className="space-y-2">
          <Label>Semana</Label>
          <Input
            type="number"
            name="semana"
            defaultValue={searchParams.get('semana') ?? ''}
            placeholder="N°"
            className="w-20"
            min={1}
            max={53}
          />
        </div>
      )}

      <Button type="submit" variant="outline">
        Filtrar
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => router.push(basePath)}
      >
        Limpiar
      </Button>
    </form>
  )
}
