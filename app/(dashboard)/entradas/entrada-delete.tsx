'use client'

import { useTransition } from 'react'
import { eliminarEntrada } from '@/app/actions/inventario'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { ConfirmModal } from '@/components/confirm-modal'
import { toast } from 'sonner'

export function EntradaDelete({ id, disabled }: { id: string; disabled?: boolean }) {
  const [isPending, startTransition] = useTransition()

  async function handleConfirm() {
    startTransition(async () => {
      const result = await eliminarEntrada(id)
      if (result.success) {
        toast.success('Entrada eliminada')
      } else {
        toast.error(result.error || 'Error al eliminar')
      }
    })
  }

  return (
    <ConfirmModal
      title="Eliminar entrada"
      description="¿Estás seguro? Esta acción no se puede deshacer."
      confirmText="Eliminar"
      variant="destructive"
      onConfirm={handleConfirm}
      trigger={
        <Button variant="destructive" size="icon" disabled={disabled || isPending}>
          <Trash2 className="h-4 w-4" />
        </Button>
      }
    />
  )
}
