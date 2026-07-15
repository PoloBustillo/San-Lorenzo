'use client'

import { useTransition } from 'react'
import { eliminarSalida } from '@/app/actions/inventario'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { ConfirmModal } from '@/components/confirm-modal'
import { toast } from 'sonner'

export function SalidaDelete({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  async function handleConfirm() {
    startTransition(async () => {
      const result = await eliminarSalida(id)
      if (result.success) {
        toast.success('Salida eliminada. Los bancos volvieron a inventario.')
      } else {
        toast.error(result.error || 'Error al eliminar')
      }
    })
  }

  return (
    <ConfirmModal
      title="Eliminar salida"
      description="¿Estás seguro? Los bancos volverán a estar disponibles en inventario."
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
