'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { EntityModal } from '@/components/entity-modal'
import { UsuarioForm } from './usuario-form'

export function UsuarioCreate() {
  const [open, setOpen] = useState(false)

  return (
    <EntityModal
      title="Nuevo usuario"
      description="Crea un usuario con acceso al sistema."
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo usuario
        </Button>
      }
    >
      <UsuarioForm onSuccess={() => setOpen(false)} />
    </EntityModal>
  )
}
