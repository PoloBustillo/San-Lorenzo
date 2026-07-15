'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { eliminarUsuario } from '@/app/actions/usuarios'
import { Trash2 } from 'lucide-react'
import { ConfirmModal } from '@/components/confirm-modal'
import { toast } from 'sonner'

export function UsuarioDelete({
  id,
  email,
  isSelf,
}: {
  id: string
  email: string
  isSelf: boolean
}) {
  const [isPending, startTransition] = useTransition()

  if (isSelf) {
    return (
      <Button variant="outline" size="icon" disabled>
        Tú
      </Button>
    )
  }

  async function handleConfirm() {
    startTransition(async () => {
      const result = await eliminarUsuario(id)
      if (result.success) {
        toast.success('Usuario eliminado')
      } else {
        toast.error(result.error || 'Error al eliminar usuario')
      }
    })
  }

  return (
    <ConfirmModal
      title="Eliminar usuario"
      description={`¿Eliminar al usuario ${email}? Esta acción no se puede deshacer.`}
      confirmText="Eliminar"
      variant="destructive"
      onConfirm={handleConfirm}
      trigger={
        <Button variant="destructive" size="icon" disabled={isPending}>
          <Trash2 className="h-4 w-4" />
        </Button>
      }
    />
  )
}
