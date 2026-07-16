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
import { getEstatusLabel } from '@/lib/utils'

interface EntradaFiltersProps {
  materiales: readonly string[]
  proveedores: { id: string; nombre: string }[]
}

export function EntradaFilters({ materiales, proveedores }: EntradaFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const params = new URLSearchParams()
    const material = String(formData.get('material') ?? '')
    const estatus = String(formData.get('estatus') ?? '')
    const proveedorId = String(formData.get('proveedorId') ?? '')
    const fechaDesde = String(formData.get('fechaDesde') ?? '')
    const fechaHasta = String(formData.get('fechaHasta') ?? '')
    const semana = String(formData.get('semana') ?? '')
    if (material) params.set('material', material)
    if (estatus) params.set('estatus', estatus)
    if (proveedorId) params.set('proveedorId', proveedorId)
    if (fechaDesde) params.set('fechaDesde', fechaDesde)
    if (fechaHasta) params.set('fechaHasta', fechaHasta)
    if (semana) params.set('semana', semana)
    router.push(`/entradas?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
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
      <div className="space-y-2">
        <Label>Estatus</Label>
        <Select name="estatus" defaultValue={searchParams.get('estatus') ?? ''}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todos">
              {(value: string | null) =>
                value ? getEstatusLabel(value) : 'Todos'
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="EnInventario">{getEstatusLabel('EnInventario')}</SelectItem>
            <SelectItem value="EnPreparacion">{getEstatusLabel('EnPreparacion')}</SelectItem>
            <SelectItem value="Entregado">{getEstatusLabel('Entregado')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
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
      <div className="space-y-2">
        <Label>Desde</Label>
        <Input
          type="date"
          name="fechaDesde"
          defaultValue={searchParams.get('fechaDesde') ?? ''}
          className="w-40"
        />
      </div>
      <div className="space-y-2">
        <Label>Hasta</Label>
        <Input
          type="date"
          name="fechaHasta"
          defaultValue={searchParams.get('fechaHasta') ?? ''}
          className="w-40"
        />
      </div>
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
      <Button type="submit" variant="outline">
        Filtrar
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => router.push('/entradas')}
      >
        Limpiar
      </Button>
    </form>
  )
}
