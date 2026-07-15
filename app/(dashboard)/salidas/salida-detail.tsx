'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { quitarEntradaDeSalida } from '@/app/actions/inventario'
import { getEstatusLabel, getEstatusBadgeVariant } from '@/lib/utils'
import { toast } from 'sonner'
import { X } from 'lucide-react'

type SalidaConEntradas = {
  id: string
  numero: number
  fecha: string
  entradas: {
    id: string
    banco: string
    material: string
    medida: string
    pesoKg: number
    estatus: string
    proveedor: { nombre: string }
  }[]
}

export function SalidaDetail({ salida }: { salida: SalidaConEntradas }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const pesoTotal = salida.entradas.reduce((sum, e) => sum + e.pesoKg, 0)
  const fecha = new Date(salida.fecha)

  function handleQuitar(entradaId: string) {
    startTransition(async () => {
      const result = await quitarEntradaDeSalida(salida.id, entradaId)
      if (result.success) {
        toast.success('Banco regresado a inventario')
        setOpen(false)
      } else {
        toast.error(result.error || 'Error al quitar banco')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            Ver
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>SALIDA {salida.numero}</DialogTitle>
          <DialogDescription>
            Fecha: {fecha.toLocaleDateString('es-MX')} — {salida.entradas.length} bancos —{' '}
            {pesoTotal.toFixed(2)} KG
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banco</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Medida</TableHead>
                <TableHead>Peso KG</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Estatus</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salida.entradas.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.banco}</TableCell>
                  <TableCell>{e.material}</TableCell>
                  <TableCell>{e.medida}</TableCell>
                  <TableCell>{e.pesoKg.toFixed(2)}</TableCell>
                  <TableCell>{e.proveedor.nombre}</TableCell>
                  <TableCell>
                    <Badge variant={getEstatusBadgeVariant(e.estatus)}>
                      {getEstatusLabel(e.estatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      disabled={isPending}
                      onClick={() => handleQuitar(e.id)}
                      title="Quitar de la salida y regresar a inventario"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
