'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { EntityModal } from '@/components/entity-modal'
import { EntradaForm } from './entrada-form'

export function EntradaEdit({
  entrada,
  proveedores,
  materiales,
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
  materiales: string[]
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
      <EntradaForm entrada={entrada} proveedores={proveedores} materiales={materiales} onSuccess={() => setOpen(false)} />
    </EntityModal>
  )
}
