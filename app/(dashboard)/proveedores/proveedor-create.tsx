'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { EntityModal } from '@/components/entity-modal'
import { ProveedorForm } from './proveedor-form'

export function ProveedorCreate() {
  const [open, setOpen] = useState(false)

  return (
    <EntityModal
      title="Nuevo proveedor / cliente"
      description="Registra un proveedor o cliente."
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo proveedor
        </Button>
      }
    >
      <ProveedorForm onSuccess={() => setOpen(false)} />
    </EntityModal>
  )
}
