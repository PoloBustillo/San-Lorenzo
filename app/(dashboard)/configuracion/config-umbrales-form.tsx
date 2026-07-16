'use client'

import { useTransition } from 'react'
import { actualizarUmbral } from '@/app/actions/configuracion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ResponsiveTable } from '@/components/responsive-table'
import { toast } from 'sonner'

type Umbral = {
  minBancos: number | null
  minKg: number | null
  precioPorKg: number | null
}

export function ConfigUmbralesForm({
  materiales,
  umbrales,
}: {
  materiales: readonly string[]
  umbrales: Map<string, Umbral>
}) {
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const updates = materiales.map(async (material) => {
        const minBancosRaw = String(formData.get(`${material}_minBancos`) ?? '').trim()
        const minKgRaw = String(formData.get(`${material}_minKg`) ?? '').trim()
        const precioRaw = String(formData.get(`${material}_precioPorKg`) ?? '').trim()

        return actualizarUmbral(material, {
          minBancos: minBancosRaw === '' ? null : Number(minBancosRaw),
          minKg: minKgRaw === '' ? null : Number(minKgRaw),
          precioPorKg: precioRaw === '' ? null : Number(precioRaw),
        })
      })

      const results = await Promise.all(updates)
      const failed = results.find((r) => !r.success)

      if (failed) {
        toast.error(failed.error || 'Error al guardar umbrales')
      } else {
        toast.success('Umbrales y precios guardados')
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <ResponsiveTable>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material</TableHead>
              <TableHead>Mín. bancos</TableHead>
              <TableHead>Mín. KG</TableHead>
              <TableHead>Precio / KG</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materiales.map((material) => {
              const u = umbrales.get(material)
              return (
                <TableRow key={material}>
                  <TableCell className="font-medium">{material}</TableCell>
                  <TableCell>
                    <Input
                      name={`${material}_minBancos`}
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={u?.minBancos ?? ''}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      name={`${material}_minKg`}
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={u?.minKg ?? ''}
                      className="w-28"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      name={`${material}_precioPorKg`}
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={u?.precioPorKg ?? ''}
                      className="w-28"
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </ResponsiveTable>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar umbrales y precios'}
        </Button>
      </div>
    </form>
  )
}
