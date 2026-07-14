'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function EntradaFilters({ materiales }: { materiales: readonly string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const params = new URLSearchParams()
    const material = String(formData.get('material') ?? '')
    const estatus = String(formData.get('estatus') ?? '')
    if (material) params.set('material', material)
    if (estatus) params.set('estatus', estatus)
    router.push(`/entradas?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="space-y-2">
        <Label htmlFor="material">Material</Label>
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
        <Label htmlFor="estatus">Estatus</Label>
        <Select name="estatus" defaultValue={searchParams.get('estatus') ?? ''}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="EnInventario">En inventario</SelectItem>
            <SelectItem value="Entregado">Entregado</SelectItem>
          </SelectContent>
        </Select>
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
