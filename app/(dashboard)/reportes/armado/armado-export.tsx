'use client'

import { Button } from '@/components/ui/button'
import { FileSpreadsheet, FileDown } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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
  function handleExcelExport() {
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

  function handlePdfExport() {
    const doc = new jsPDF()
    const date = new Date().toLocaleDateString('es-MX')

    doc.setFontSize(16)
    doc.text('Reporte Armado', 14, 20)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generado el ${date} · ${grupos.length} códigos · ${grupos.reduce((s, g) => s + g.bancos.length, 0)} bancos`, 14, 28)
    doc.setTextColor(0)

    const rows = grupos.flatMap((g) =>
      g.bancos.map((b) => [
        g.key,
        g.material,
        g.medida,
        b.banco,
        b.proveedor.nombre,
        b.fecha.toISOString().split('T')[0],
        b.pesoKg.toFixed(2),
      ])
    )

    autoTable(doc, {
      head: [['Código', 'Material', 'Medida', 'Banco', 'Origen', 'Fecha', 'KG']],
      body: rows,
      startY: 34,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [51, 51, 51] },
    })

    doc.save(`armado_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <>
      <Button variant="outline" onClick={handlePdfExport} disabled={grupos.length === 0}>
        <FileDown className="mr-2 h-4 w-4" />
        PDF
      </Button>
      <Button variant="outline" onClick={handleExcelExport} disabled={grupos.length === 0}>
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Excel
      </Button>
    </>
  )
}
