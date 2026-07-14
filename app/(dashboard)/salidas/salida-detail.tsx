'use client'

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
  const pesoTotal = salida.entradas.reduce((sum, e) => sum + e.pesoKg, 0)
  const fecha = new Date(salida.fecha)

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            Ver
          </Button>
        }
      />
      <DialogContent className="max-w-2xl">
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
                    <Badge variant={e.estatus === 'EnInventario' ? 'default' : 'secondary'}>
                      {e.estatus === 'EnInventario' ? 'En inventario' : 'Entregado'}
                    </Badge>
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
