'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Printer } from 'lucide-react'

type SalidaTicketData = {
  numero: number
  fecha: string
  empresa: {
    nombre: string
    direccion: string
    telefono: string
    rfc: string
  }
  ivaPorcentaje: number
  entradas: {
    banco: string
    material: string
    medida: string
    pesoKg: number
    proveedor: string
    precioPorKg: number
  }[]
}

export function SalidaTicket({ salida }: { salida: SalidaTicketData }) {
  const printRef = useRef<HTMLDivElement>(null)
  const fecha = new Date(salida.fecha)
  const subtotal = salida.entradas.reduce((sum, e) => sum + e.pesoKg * e.precioPorKg, 0)
  const iva = subtotal * (salida.ivaPorcentaje / 100)
  const total = subtotal + iva
  const pesoTotal = salida.entradas.reduce((sum, e) => sum + e.pesoKg, 0)

  function handlePrint() {
    const content = printRef.current
    if (!content) return

    const win = window.open('', '_blank', 'width=800,height=600')
    if (!win) return

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Remisión SALIDA ${salida.numero}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; margin: 24px; color: #111; }
            h1 { font-size: 18px; margin: 0 0 4px; }
            .meta { color: #555; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
            th { background: #f5f5f5; }
            .totals { margin-top: 12px; text-align: right; }
            .totals p { margin: 4px 0; }
            @media print { body { margin: 12px; } }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    win.print()
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] w-[95vw] sm:max-w-[1000px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vista previa — Remisión SALIDA {salida.numero}</DialogTitle>
        </DialogHeader>
        <div ref={printRef} className="space-y-4 text-sm">
          <div>
            <h2 className="text-lg font-bold">{salida.empresa.nombre}</h2>
            <p className="text-muted-foreground">{salida.empresa.direccion}</p>
            <p className="text-muted-foreground">
              Tel: {salida.empresa.telefono} · RFC: {salida.empresa.rfc}
            </p>
          </div>
          <div className="rounded-md border p-3">
            <p className="font-semibold">REMISIÓN DE SALIDA #{salida.numero}</p>
            <p className="text-muted-foreground">
              Fecha: {fecha.toLocaleDateString('es-MX')} · {salida.entradas.length} bancos ·{' '}
              {pesoTotal.toFixed(2)} KG
            </p>
          </div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left">Banco</th>
                <th className="p-2 text-left">Material</th>
                <th className="p-2 text-left">Medida</th>
                <th className="p-2 text-right">KG</th>
                <th className="p-2 text-right">$/KG</th>
                <th className="p-2 text-right">Importe</th>
                <th className="p-2 text-left">Origen</th>
              </tr>
            </thead>
            <tbody>
              {salida.entradas.map((e, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2">{e.banco}</td>
                  <td className="p-2">{e.material}</td>
                  <td className="p-2">{e.medida}</td>
                  <td className="p-2 text-right">{e.pesoKg.toFixed(2)}</td>
                  <td className="p-2 text-right">{e.precioPorKg.toFixed(2)}</td>
                  <td className="p-2 text-right">{(e.pesoKg * e.precioPorKg).toFixed(2)}</td>
                  <td className="p-2">{e.proveedor}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="space-y-1 text-right">
            <p>Subtotal: ${subtotal.toFixed(2)}</p>
            <p>IVA ({salida.ivaPorcentaje}%): ${iva.toFixed(2)}</p>
            <p className="text-base font-bold">Total: ${total.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir remisión
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
