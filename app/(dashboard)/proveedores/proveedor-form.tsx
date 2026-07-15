'use client'

import { useRef, useTransition } from 'react'
import { crearProveedor, actualizarProveedor } from '@/app/actions/inventario'
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

export function ProveedorForm({
  proveedor,
  onSuccess,
}: {
  proveedor?: { id: string; nombre: string; tipo: 'CLIENTE' | 'PROVEEDOR' }
  onSuccess?: () => void
}) {
  const ref = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const isEditing = Boolean(proveedor)

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEditing
        ? await actualizarProveedor(proveedor!.id, formData)
        : await crearProveedor(formData)
      if (result.success) {
        toast.success(isEditing ? 'Proveedor actualizado' : 'Proveedor creado')
        if (!isEditing) ref.current?.reset()
        onSuccess?.()
      } else {
        toast.error(result.error || 'Error al guardar proveedor')
      }
    })
  }

  return (
    <form ref={ref} action={handleSubmit} className="grid gap-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          name="nombre"
          placeholder="Nombre"
          defaultValue={proveedor?.nombre}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo</Label>
        <Select name="tipo" defaultValue={proveedor?.tipo ?? 'PROVEEDOR'} required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PROVEEDOR">PROVEEDOR</SelectItem>
            <SelectItem value="CLIENTE">CLIENTE</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
