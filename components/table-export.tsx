'use client'

import { Button } from '@/components/ui/button'
import { FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'

type ExportRow = Record<string, string | number | null | undefined>

export function TableExport({
  filename,
  sheetName = 'Datos',
  rows,
  disabled,
}: {
  filename: string
  sheetName?: string
  rows: ExportRow[]
  disabled?: boolean
}) {
  function handleExport() {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    XLSX.writeFile(wb, filename)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={disabled || rows.length === 0}>
      <FileSpreadsheet className="mr-2 h-4 w-4" />
      Exportar Excel
    </Button>
  )
}
