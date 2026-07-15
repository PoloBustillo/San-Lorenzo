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
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { MATERIALES } from '@/lib/constants'
import { ResponsiveTable } from '@/components/responsive-table'
import { EntradaForm } from './entrada-form'
import { EntradaFilters } from './entrada-filters'
import { EntradaEdit } from './entrada-edit'
import { EntradaDelete } from './entrada-delete'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 20

export default async function EntradasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; material?: string; estatus?: string }>
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? 1))
  const materialFilter = params.material
  const estatusFilter = params.estatus as 'EnInventario' | 'Entregado' | undefined

  const where = {
    ...(materialFilter && { material: materialFilter }),
    ...(estatusFilter && { estatus: estatusFilter }),
  }

  const [entradas, total, proveedores] = await Promise.all([
    prisma.entrada.findMany({
      where,
      include: { proveedor: true },
      orderBy: { fecha: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.entrada.count({ where }),
    prisma.proveedor.findMany({ orderBy: { nombre: 'asc' } }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Entradas</h1>
        <p className="text-muted-foreground">Registro de bancos recibidos.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nueva entrada</CardTitle>
        </CardHeader>
        <CardContent>
          <EntradaForm proveedores={proveedores} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EntradaFilters materiales={MATERIALES} />

          <ResponsiveTable>
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
                  <TableHead>Estatus</TableHead>
                  <TableHead className="w-28 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entradas.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center text-muted-foreground"
                    >
                      No hay entradas registradas.
                    </TableCell>
                  </TableRow>
                )}
                {entradas.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      {e.fecha.toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>{e.semana}</TableCell>
                    <TableCell>{e.proveedor.nombre}</TableCell>
                    <TableCell>{e.banco}</TableCell>
                    <TableCell>{e.material}</TableCell>
                    <TableCell>{e.medida}</TableCell>
                    <TableCell>{e.pesoKg.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          e.estatus === 'EnInventario' ? 'default' : 'secondary'
                        }
                      >
                        {e.estatus === 'EnInventario' ? 'En inventario' : 'Entregado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {e.estatus === 'EnInventario' && (
                          <EntradaEdit entrada={e} proveedores={proveedores} />
                        )}
                        <EntradaDelete id={e.id} disabled={e.estatus === 'Entregado'} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ResponsiveTable>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Página {page} de {totalPages} — {total} resultados
            </p>
            <div className="flex gap-2">
              <a
                href={`?page=${page - 1}${materialFilter ? `&material=${materialFilter}` : ''}${estatusFilter ? `&estatus=${estatusFilter}` : ''}`}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  page <= 1 && 'pointer-events-none opacity-50'
                )}
                aria-disabled={page <= 1}
              >
                Anterior
              </a>
              <a
                href={`?page=${page + 1}${materialFilter ? `&material=${materialFilter}` : ''}${estatusFilter ? `&estatus=${estatusFilter}` : ''}`}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  page >= totalPages && 'pointer-events-none opacity-50'
                )}
                aria-disabled={page >= totalPages}
              >
                Siguiente
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
