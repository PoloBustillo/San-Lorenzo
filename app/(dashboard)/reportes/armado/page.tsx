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
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { ArmadoFilters } from './armado-filters'
import { ArmadoExport } from './armado-export'
import { ResponsiveTable } from '@/components/responsive-table'
import { MATERIALES, obtenerCodigoProducto } from '@/lib/constants'
import { ESTATUS_INVENTARIO } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default async function ArmadoPage({
  searchParams,
}: {
  searchParams: Promise<{ proveedor?: string; material?: string; medida?: string }>
}) {
  const params = await searchParams

  const where = {
    estatus: { in: ESTATUS_INVENTARIO },
    ...(params.proveedor && { proveedorId: params.proveedor }),
    ...(params.material && { material: params.material }),
    ...(params.medida && { medida: params.medida }),
  }

  const [entradas, proveedores] = await Promise.all([
    prisma.entrada.findMany({
      where,
      include: { proveedor: true },
      orderBy: [{ material: 'asc' }, { medida: 'asc' }, { fecha: 'asc' }],
    }),
    prisma.proveedor.findMany({ orderBy: { nombre: 'asc' } }),
  ])

  const agrupado = entradas.reduce(
    (acc, e) => {
      const key = obtenerCodigoProducto(e.material, e.medida)
      if (!acc[key]) {
        acc[key] = {
          key,
          material: e.material,
          medida: e.medida,
          bancos: [],
          totalKg: 0,
        }
      }
      acc[key].bancos.push(e)
      acc[key].totalKg += e.pesoKg
      return acc
    },
    {} as Record<
      string,
      {
        key: string
        material: string
        medida: string
        bancos: typeof entradas
        totalKg: number
      }
    >
  )

  const grupos = Object.values(agrupado)
  const totalGeneralKg = grupos.reduce((sum, g) => sum + g.totalKg, 0)
  const totalBancos = entradas.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Armado</h1>
          <p className="text-muted-foreground">
            Bancos disponibles agrupados por código de producto para armar salidas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ArmadoExport grupos={grupos} />
          <a href="/salidas" className={cn(buttonVariants({ variant: 'default' }))}>
            Ir a Salidas
          </a>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <ArmadoFilters proveedores={proveedores} materiales={MATERIALES} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Códigos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grupos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bancos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBancos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total KG</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGeneralKg.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bancos agrupados</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveTable>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Medida</TableHead>
                  <TableHead>Bancos</TableHead>
                  <TableHead>Total KG</TableHead>
                  <TableHead>Detalle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grupos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No hay bancos en inventario con los filtros seleccionados.
                    </TableCell>
                  </TableRow>
                )}
                {grupos.map((g) => (
                  <TableRow key={g.key}>
                    <TableCell className="font-medium">{g.key}</TableCell>
                    <TableCell>{g.material}</TableCell>
                    <TableCell>{g.medida}</TableCell>
                    <TableCell>{g.bancos.length}</TableCell>
                    <TableCell>{g.totalKg.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex max-w-xs flex-wrap gap-1">
                        {g.bancos.slice(0, 5).map((b) => (
                          <Badge key={b.id} variant="outline">
                            {b.banco}
                          </Badge>
                        ))}
                        {g.bancos.length > 5 && (
                          <Badge variant="outline">+{g.bancos.length - 5}</Badge>
                        )}
                      </div>
                    </TableCell>
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
