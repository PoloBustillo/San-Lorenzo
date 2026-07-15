'use client'

import { useTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cambiarEstatusEntrada } from '@/app/actions/inventario'
import { ESTATUS_ORDEN, getEstatusLabel } from '@/lib/utils'
import { toast } from 'sonner'

export function EntradaStatus({
  id,
  estatus,
}: {
  id: string
  estatus: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleChange(value: string | null) {
    if (!value) return
    startTransition(async () => {
      const result = await cambiarEstatusEntrada(id, value)
      if (result.success) {
        toast.success('Estatus actualizado')
      } else {
        toast.error(result.error || 'Error al cambiar estatus')
      }
    })
  }

  const opciones = ESTATUS_ORDEN.filter((e) => e !== 'Entregado')

  return (
    <Select
      value={estatus}
      onValueChange={handleChange}
      disabled={isPending || estatus === 'Entregado'}
    >
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {opciones.map((e) => (
          <SelectItem key={e} value={e}>
            {getEstatusLabel(e)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
