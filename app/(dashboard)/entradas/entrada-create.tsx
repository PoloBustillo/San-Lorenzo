'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { EntityModal } from '@/components/entity-modal'
import { EntradaForm } from './entrada-form'

export function EntradaCreate({
  proveedores,
}: {
  proveedores: { id: string; nombre: string }[]
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
      <EntradaForm proveedores={proveedores} onSuccess={() => setOpen(false)} />
    </EntityModal>
  )
}
