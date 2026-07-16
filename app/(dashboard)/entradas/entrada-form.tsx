'use client'

import { useRef, useState, useTransition } from 'react'
import { crearEntrada, actualizarEntrada } from '@/app/actions/inventario'
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
import { MEDIDAS_POR_MATERIAL } from '@/lib/constants'
import { toast } from 'sonner'

export function EntradaForm({
  proveedores,
  materiales,
  entrada,
  onSuccess,
}: {
  proveedores: { id: string; nombre: string }[]
  materiales: string[]
  entrada?: {
    id: string
    fecha: Date
    proveedorId: string
    banco: string
    material: string
    medida: string
    pesoKg: number
  }
  onSuccess?: () => void
}) {
  const ref = useRef<HTMLFormElement>(null)
  const isEditing = Boolean(entrada)
  const [material, setMaterial] = useState<string>(entrada?.material ?? materiales[0] ?? '')
  const [medida, setMedida] = useState<string>(
    entrada?.medida ?? (materiales[0] ? MEDIDAS_POR_MATERIAL[materiales[0] as keyof typeof MEDIDAS_POR_MATERIAL]?.[0] ?? '' : '')
  )
  const [proveedorId, setProveedorId] = useState<string>(entrada?.proveedorId ?? '')
  const [isPending, startTransition] = useTransition()

  const medidas = MEDIDAS_POR_MATERIAL[material as keyof typeof MEDIDAS_POR_MATERIAL]

  function handleMaterialChange(value: string | null) {
    const nextMaterial = value ?? ''
    setMaterial(nextMaterial)
    const nextMedidas =
      MEDIDAS_POR_MATERIAL[nextMaterial as keyof typeof MEDIDAS_POR_MATERIAL]
    setMedida(nextMedidas[0])
  }

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEditing
        ? await actualizarEntrada(entrada!.id, formData)
        : await crearEntrada(formData)
      if (result.success) {
        toast.success(isEditing ? 'Entrada actualizada' : 'Entrada registrada')
        if (!isEditing) {
          ref.current?.reset()
          const first = materiales[0] ?? ''
          setMaterial(first)
          setMedida(first ? MEDIDAS_POR_MATERIAL[first as keyof typeof MEDIDAS_POR_MATERIAL]?.[0] ?? '' : '')
          setProveedorId('')
        }
        onSuccess?.()
      } else {
        toast.error(result.error || 'Error al guardar entrada')
      }
    })
  }

  return (
    <form ref={ref} action={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="fecha">Fecha</Label>
        <Input
          id="fecha"
          name="fecha"
          type="date"
          defaultValue={
            entrada
              ? entrada.fecha.toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0]
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="proveedorId">Proveedor / Cliente</Label>
        <Select
          name="proveedorId"
          value={proveedorId}
          onValueChange={(value) => setProveedorId(value ?? '')}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona">
              {(value: string | null) =>
                value
                  ? proveedores.find((p) => p.id === value)?.nombre ?? 'Selecciona'
                  : 'Selecciona'
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {proveedores.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="banco">Banco</Label>
        <Input id="banco" name="banco" placeholder="Ej. B-001" defaultValue={entrada?.banco} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="material">Material</Label>
        <Select
          name="material"
          value={material}
          onValueChange={handleMaterialChange}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {materiales.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="medida">Medida</Label>
        <Select
          name="medida"
          value={medida}
          onValueChange={(v) => setMedida(v ?? '')}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {medidas.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="pesoKg">Peso KG</Label>
        <Input
          id="pesoKg"
          name="pesoKg"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          defaultValue={entrada?.pesoKg}
          required
        />
      </div>
      <div className="flex justify-end sm:col-span-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : isEditing ? 'Actualizar entrada' : 'Guardar entrada'}
        </Button>
      </div>
    </form>
  )
}
