'use client'

import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import { sanitizeBarcodeValue } from '@/lib/utils'

interface BarcodeProps {
  value: string
  width?: number
  height?: number
  displayValue?: boolean
  className?: string
}

export function Barcode({
  value,
  width = 1.5,
  height = 40,
  displayValue = true,
  className,
}: BarcodeProps) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (ref.current && value) {
      try {
        JsBarcode(ref.current, sanitizeBarcodeValue(value), {
          format: 'CODE128',
          width,
          height,
          displayValue,
          fontSize: 12,
          margin: 0,
        })
      } catch {
        // invalid value — render nothing
      }
    }
  }, [value, width, height, displayValue])

  if (!value) return null
  return <svg ref={ref} className={className} />
}
