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
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MATERIALES, obtenerCodigoProducto } from '@/lib/constants'
import { ResponsiveTable } from '@/components/responsive-table'
import { TableExport } from '@/components/table-export'
import { ESTATUS_INVENTARIO } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ material?: string }>
}) {
  const params = await searchParams
  const materialFilter = params.material

  const entradas = await prisma.entrada.findMany({
    where: {
      estatus: { in: ESTATUS_INVENTARIO },
      ...(materialFilter && { material: materialFilter }),
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
        <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
        <p className="text-muted-foreground">Resumen por código de producto.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtro</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/inventario" method="GET" className="flex items-end gap-3">
            <div className="space-y-2">
              <label htmlFor="material" className="text-sm font-medium">
                Material
              </label>
              <Select name="material" defaultValue={materialFilter ?? ''}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {MATERIALES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" variant="outline">
              Filtrar
            </Button>
            <a href="/inventario" className={cn(buttonVariants({ variant: 'ghost' }))}>
              Limpiar
            </a>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Resumen</CardTitle>
          <TableExport filename="inventario.xlsx" rows={exportRows} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Total KG</p>
              <p className="text-2xl font-bold">{totalKg.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Bancos en inventario</p>
              <p className="text-2xl font-bold">{entradas.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Códigos</p>
              <p className="text-2xl font-bold">{items.length}</p>
            </div>
          </div>

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
                      No hay inventario disponible.
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
