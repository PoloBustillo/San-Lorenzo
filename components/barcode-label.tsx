'use client'

import { sanitizeBarcodeValue } from '@/lib/utils'

export function printBarcodeLabel(codigo: string, material: string, medida: string) {
  const win = window.open('', '_blank', 'width=400,height=300')
  if (!win) return

  const svgId = `bc-${Date.now()}`
  const safeCodigo = sanitizeBarcodeValue(codigo).replace(/"/g, '\\"')
  const safeMaterial = material.replace(/"/g, '&quot;')
  const safeMedida = medida.replace(/"/g, '&quot;')

  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Etiqueta - ${codigo}</title>
      <style>
        body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: sans-serif; }
        .label { text-align: center; padding: 16px; border: 1px solid #ccc; border-radius: 8px; }
        .label h3 { margin: 0 0 4px; font-size: 14px; }
        .label p { margin: 0; font-size: 12px; color: #666; }
        svg { margin-top: 8px; }
      </style>
    </head>
    <body>
      <div class="label">
        <h3>${safeMaterial}</h3>
        <p>${safeMedida}</p>
        <svg id="${svgId}"></svg>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
      <script>
        JsBarcode("#${svgId}", "${safeCodigo}", {
          format: "CODE128",
          width: 2,
          height: 60,
          displayValue: true,
          fontSize: 14,
          margin: 4
        });
        setTimeout(function() { window.print(); }, 300);
      </script>
    </body>
    </html>
  `)
  win.document.close()
}
