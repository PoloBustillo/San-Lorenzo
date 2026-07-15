'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { EntityModal } from '@/components/entity-modal'
import { ProveedorForm } from './proveedor-form'

export function ProveedorEdit({
  proveedor,
}: {
  proveedor: { id: string; nombre: string; tipo: 'CLIENTE' | 'PROVEEDOR' }
}) {
  const [open, setOpen] = useState(false)

  return (
    <EntityModal
      title="Editar proveedor / cliente"
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="outline" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      }
    >
      <ProveedorForm proveedor={proveedor} onSuccess={() => setOpen(false)} />
    </EntityModal>
  )
}
