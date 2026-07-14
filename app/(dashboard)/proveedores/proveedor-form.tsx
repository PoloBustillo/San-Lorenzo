'use client'

import { useRef, useTransition } from 'react'
import { crearProveedor } from '@/app/actions/inventario'
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

export function ProveedorForm() {
  const ref = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await crearProveedor(formData)
      if (result.success) {
        toast.success('Proveedor creado')
        ref.current?.reset()
      } else {
        toast.error(result.error || 'Error al crear proveedor')
      }
    })
  }

  return (
    <form ref={ref} action={handleSubmit} className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" name="nombre" placeholder="Nombre" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo</Label>
        <Select name="tipo" defaultValue="PROVEEDOR" required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PROVEEDOR">PROVEEDOR</SelectItem>
            <SelectItem value="CLIENTE">CLIENTE</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
