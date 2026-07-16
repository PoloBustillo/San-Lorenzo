'use client'

import { TableExport } from '@/components/table-export'
import { PdfExport } from '@/components/pdf-export'

interface ReportExportProps {
  filename: string
  title: string
  headers: string[]
  rows: (string | number)[][]
  exportRows: Record<string, string | number>[]
  subtitle?: string
}

export function ReportExport({
  filename,
  title,
  headers,
  rows,
  exportRows,
  subtitle,
}: ReportExportProps) {
  const xlsxName = filename.replace('.pdf', '.xlsx')

  return (
    <div className="flex items-center gap-2">
      <PdfExport
        filename={filename}
        title={title}
        headers={headers}
        rows={rows}
        subtitle={subtitle}
      />
      <TableExport filename={xlsxName} rows={exportRows} />
    </div>
  )
}
