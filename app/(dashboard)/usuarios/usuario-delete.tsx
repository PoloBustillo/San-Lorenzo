'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { eliminarUsuario } from '@/app/actions/usuarios'
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

  function handleDelete() {
    if (!confirm(`¿Eliminar al usuario ${email}?`)) return
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
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      disabled={isPending || isSelf}
      onClick={handleDelete}
    >
      {isSelf ? 'Tú' : isPending ? '...' : 'Eliminar'}
    </Button>
  )
}
