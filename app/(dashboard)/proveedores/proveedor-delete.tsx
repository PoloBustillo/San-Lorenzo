'use client'

import { useTransition } from 'react'
import { eliminarProveedor } from '@/app/actions/inventario'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function ProveedorDelete({ id, isAdmin }: { id: string; isAdmin: boolean }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('¿Eliminar este proveedor?')) return
    startTransition(async () => {
      const result = await eliminarProveedor(id)
      if (result.success) {
        toast.success('Proveedor eliminado')
      } else {
        toast.error(result.error || 'Error al eliminar')
      }
    })
  }

  if (!isAdmin) return null

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? '...' : 'Eliminar'}
    </Button>
  )
}
