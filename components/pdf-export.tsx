'use client'

import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface PdfExportProps {
  filename: string
  title: string
  headers: string[]
  rows: (string | number)[][]
  subtitle?: string
}

export function PdfExport({ filename, title, headers, rows, subtitle }: PdfExportProps) {
  function handleExport() {
    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text(title, 14, 20)

    if (subtitle) {
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(subtitle, 14, 28)
      doc.setTextColor(0)
    }

    const startY = subtitle ? 34 : 28

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [51, 51, 51] },
    })

    doc.save(filename)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={rows.length === 0}>
      <FileDown className="mr-2 h-4 w-4" />
      PDF
    </Button>
  )
}
