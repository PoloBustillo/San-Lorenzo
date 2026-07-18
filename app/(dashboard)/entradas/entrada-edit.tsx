'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { EntityModal } from '@/components/entity-modal'
import { EntradaForm } from './entrada-form'

type Producto = {
  id: string
  codigo: string
  material: { nombre: string }
  medida: { nombre: string }
}

export function EntradaEdit({
  entrada,
  proveedores,
  productos,
}: {
  entrada: {
    id: string
    fecha: Date
    proveedorId: string
    banco: string
    material: string
    medida: string
    pesoKg: number
  }
  proveedores: { id: string; nombre: string }[]
  productos: Producto[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <EntityModal
      title="Editar entrada"
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="outline" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      }
    >
      <EntradaForm entrada={entrada} proveedores={proveedores} productos={productos} onSuccess={() => setOpen(false)} />
    </EntityModal>
  )
}
