import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MATERIALES_LENA, obtenerCodigoProducto } from '@/lib/constants'
import { ResponsiveTable } from '@/components/responsive-table'
import { TableExport } from '@/components/table-export'
import { ESTATUS_INVENTARIO } from '@/lib/utils'

export default async function ReporteLenaPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const entradas = await prisma.entrada.findMany({
    where: {
      estatus: { in: ESTATUS_INVENTARIO },
      material: { in: MATERIALES_LENA },
    },
  })

  const grupos = entradas.reduce(
    (acc, e) => {
      const codigo = obtenerCodigoProducto(e.material, e.medida)
      if (!acc[codigo]) {
        acc[codigo] = {
          material: e.material,
          medida: e.medida,
          totalKg: 0,
          bancos: 0,
        }
      }
      acc[codigo].totalKg += e.pesoKg
      acc[codigo].bancos += 1
      return acc
    },
    {} as Record<string, { material: string; medida: string; totalKg: number; bancos: number }>
  )

  const items = Object.entries(grupos).sort(([a], [b]) => a.localeCompare(b))
  const totalKg = entradas.reduce((sum, e) => sum + e.pesoKg, 0)

  const exportRows = items.map(([codigo, item]) => ({
    Código: codigo,
    Material: item.material,
    Medida: item.medida,
    'Total KG': item.totalKg,
    Bancos: item.bancos,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reporte Leña</h1>
        <p className="text-muted-foreground">Inventario de leña.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total KG</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKg.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bancos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entradas.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Detalle por código</CardTitle>
          <TableExport filename="reporte_lena.xlsx" rows={exportRows} />
        </CardHeader>
        <CardContent>
          <ResponsiveTable>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Medida</TableHead>
                  <TableHead>Total KG</TableHead>
                  <TableHead>Cantidad de Bancos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No hay inventario de leña.
                    </TableCell>
                  </TableRow>
                )}
                {items.map(([codigo, item]) => (
                  <TableRow key={codigo}>
                    <TableCell className="font-medium">{codigo}</TableCell>
                    <TableCell>{item.material}</TableCell>
                    <TableCell>{item.medida}</TableCell>
                    <TableCell>{item.totalKg.toFixed(2)}</TableCell>
                    <TableCell>{item.bancos}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ResponsiveTable>
        </CardContent>
      </Card>
    </div>
  )
}
