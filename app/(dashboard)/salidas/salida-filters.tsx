'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SalidaFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const params = new URLSearchParams()
    const numero = String(formData.get('numero') ?? '')
    const fechaDesde = String(formData.get('fechaDesde') ?? '')
    const fechaHasta = String(formData.get('fechaHasta') ?? '')
    const page = searchParams.get('page')
    if (page && page !== '1') params.set('page', page)
    if (numero) params.set('numero', numero)
    if (fechaDesde) params.set('fechaDesde', fechaDesde)
    if (fechaHasta) params.set('fechaHasta', fechaHasta)
    router.push(`/salidas?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="space-y-2">
        <Label>Número de salida</Label>
        <Input
          type="number"
          name="numero"
          defaultValue={searchParams.get('numero') ?? ''}
          placeholder="N°"
          className="w-28"
          min={1}
        />
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
      <Button type="submit" variant="outline">
        Filtrar
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => router.push('/salidas')}
      >
        Limpiar
      </Button>
    </form>
  )
}
