'use client'

import { Barcode } from '@/components/barcode'
import { printBarcodeLabel } from '@/components/barcode-label'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export function BarcodeCell({
  codigo,
  material,
  medida,
}: {
  codigo: string
  material: string
  medida: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Barcode value={codigo} height={28} displayValue={false} />
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
        title="Imprimir etiqueta"
        onClick={() => printBarcodeLabel(codigo, material, medida)}
      >
        <Printer className="h-3 w-3" />
      </Button>
    </div>
  )
}
