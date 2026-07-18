'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { EntityModal } from '@/components/entity-modal'
import { EntradaForm } from './entrada-form'

type Producto = {
  id: string
  codigo: string
  material: { nombre: string }
  medida: { nombre: string }
}

export function EntradaCreate({
  proveedores,
  productos,
}: {
  proveedores: { id: string; nombre: string }[]
  productos: Producto[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <EntityModal
      title="Nueva entrada"
      description="Registra un banco recibido."
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva entrada
        </Button>
      }
    >
      <EntradaForm proveedores={proveedores} productos={productos} onSuccess={() => setOpen(false)} />
    </EntityModal>
  )
}
