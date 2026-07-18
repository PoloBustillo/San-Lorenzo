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
import { toast } from 'sonner'

type Producto = {
  id: string
  codigo: string
  nombre: string
  medida: string
}

export function EntradaForm({
  proveedores,
  productos,
  entrada,
  onSuccess,
}: {
  proveedores: { id: string; nombre: string }[]
  productos: Producto[]
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

  const matchingProducto = entrada
    ? productos.find(
        (p) => p.nombre === entrada.material && p.medida === entrada.medida
      )
    : null

  const [productoId, setProductoId] = useState<string>(matchingProducto?.id ?? '')
  const [proveedorId, setProveedorId] = useState<string>(entrada?.proveedorId ?? '')
  const [isPending, startTransition] = useTransition()

  const selectedProducto = productos.find((p) => p.id === productoId)

  async function handleSubmit(formData: FormData) {
    if (selectedProducto) {
      formData.set('material', selectedProducto.nombre)
      formData.set('medida', selectedProducto.medida)
    }
    startTransition(async () => {
      const result = isEditing
        ? await actualizarEntrada(entrada!.id, formData)
        : await crearEntrada(formData)
      if (result.success) {
        toast.success(isEditing ? 'Entrada actualizada' : 'Entrada registrada')
        if (!isEditing) {
          ref.current?.reset()
          setProductoId('')
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
        <Label>Producto (Material × Medida)</Label>
        <Select
          value={productoId}
          onValueChange={(v) => setProductoId(v ?? '')}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un producto" />
          </SelectTrigger>
          <SelectContent>
            {productos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.codigo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <input type="hidden" name="material" value={selectedProducto?.nombre ?? ''} />
      <input type="hidden" name="medida" value={selectedProducto?.medida ?? ''} />
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
