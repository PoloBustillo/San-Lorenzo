'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { EntityModal } from '@/components/entity-modal'
import { UsuarioForm } from './usuario-form'

export function UsuarioEdit({
  usuario,
}: {
  usuario: { id: string; name: string | null; email: string; role: string }
}) {
  const [open, setOpen] = useState(false)

  return (
    <EntityModal
      title="Editar usuario"
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="outline" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      }
    >
      <UsuarioForm usuario={usuario} onSuccess={() => setOpen(false)} />
    </EntityModal>
  )
}
