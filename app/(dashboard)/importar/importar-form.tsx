'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { previewExcel, importarEntradas, PreviewRow } from '@/app/actions/importar'
import { toast } from 'sonner'

export function ImportarForm() {
  const [isPending, startTransition] = useTransition()
  const [preview, setPreview] = useState<PreviewRow[] | null>(null)
  const [file, setFile] = useState<File | null>(null)

  async function handlePreview(formData: FormData) {
    startTransition(async () => {
      const result = await previewExcel(formData)
      if (result.success) {
        setPreview(result.data ?? [])
        setFile(formData.get('file') as File)
        toast.success('Vista previa generada')
      } else {
        toast.error(result.error || 'Error al procesar archivo')
        setPreview(null)
      }
    })
  }

  async function handleImport() {
    if (!preview) return
    startTransition(async () => {
      const result = await importarEntradas(preview)
      if (result.success) {
        toast.success(`Importadas ${result.data?.creadas} entradas`)
        if (result.data?.errores.length) {
          toast.warning(`${result.data.errores.length} filas con errores no importadas`)
        }
        setPreview(null)
        setFile(null)
        const form = document.getElementById('importar-form') as HTMLFormElement
        form?.reset()
      } else {
        toast.error(result.error || 'Error al importar')
      }
    })
  }

  const validas = preview?.filter((r) => r.valido).length ?? 0
  const invalidas = preview?.filter((r) => !r.valido).length ?? 0

  return (
    <div className="space-y-4">
      <form id="importar-form" action={handlePreview} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file">Archivo Excel</Label>
          <Input
            id="file"
            name="file"
            type="file"
            accept=".xlsx,.xls,.csv"
            required
            disabled={isPending}
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Procesando...' : 'Vista previa'}
        </Button>
      </form>

      {preview && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge variant="default">{validas} válidas</Badge>
            <Badge variant="destructive">{invalidas} con errores</Badge>
          </div>

          <div className="rounded-md border max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Semana</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Banco</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Medida</TableHead>
                  <TableHead>Peso KG</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((row, idx) => (
                  <TableRow key={idx} className={!row.valido ? 'bg-destructive/10' : undefined}>
                    <TableCell>{row.fecha || '-'}</TableCell>
                    <TableCell>{row.semana || '-'}</TableCell>
                    <TableCell>{row.origen || '-'}</TableCell>
                    <TableCell>{row.banco || '-'}</TableCell>
                    <TableCell>{row.material || '-'}</TableCell>
                    <TableCell>{row.medida || '-'}</TableCell>
                    <TableCell>{row.pesoKg?.toFixed(2) || '-'}</TableCell>
                    <TableCell>
                      {row.valido ? (
                        <Badge variant="default">OK</Badge>
                      ) : (
                        <span className="text-xs text-destructive" title={row.errores.join(', ')}>
                          {row.errores.slice(0, 2).join(', ')}
                          {row.errores.length > 2 && '...'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button onClick={handleImport} disabled={isPending || validas === 0}>
            {isPending ? 'Importando...' : `Importar ${validas} entradas`}
          </Button>
        </div>
      )}
    </div>
  )
}
