'use client'

import { Button } from '@/components/ui/button'
import { FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'

export function ArmadoExport({
  grupos,
}: {
  grupos: {
    key: string
    material: string
    medida: string
    bancos: { banco: string; pesoKg: number; proveedor: { nombre: string }; fecha: Date }[]
    totalKg: number
  }[]
}) {
  function handleExport() {
    const rows = grupos.flatMap((g) =>
      g.bancos.map((b) => ({
        Codigo: g.key,
        Material: g.material,
        Medida: g.medida,
        Banco: b.banco,
        Origen: b.proveedor.nombre,
        Fecha: b.fecha.toISOString().split('T')[0],
        'Peso KG': b.pesoKg,
      }))
    )

    const summary = grupos.map((g) => ({
      Codigo: g.key,
      Material: g.material,
      Medida: g.medida,
      Bancos: g.bancos.length,
      'Total KG': g.totalKg,
    }))

    const wb = XLSX.utils.book_new()
    const wsDetalle = XLSX.utils.json_to_sheet(rows)
    const wsResumen = XLSX.utils.json_to_sheet(summary)
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')
    XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle')
    XLSX.writeFile(wb, `armado_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={grupos.length === 0}>
      <FileSpreadsheet className="mr-2 h-4 w-4" />
      Exportar Excel
    </Button>
  )
}
