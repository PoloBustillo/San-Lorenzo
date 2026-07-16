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
import { MATERIALES } from '@/lib/constants'
import { ResponsiveTable } from '@/components/responsive-table'
import { ReportExport } from '@/components/report-export'
import { Pagination } from '@/components/pagination'
import { getEstatusLabel } from '@/lib/utils'
import { EntradaCreate } from './entrada-create'
import { EntradaFilters } from './entrada-filters'
import { EntradaEdit } from './entrada-edit'
import { EntradaDelete } from './entrada-delete'
import { EntradaStatus } from './entrada-status'

const PAGE_SIZE = 20

export default async function EntradasPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    material?: string
    estatus?: string
    proveedorId?: string
    fechaDesde?: string
    fechaHasta?: string
    semana?: string
  }>
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? 1))
  const materialFilter = params.material
  const estatusFilter = params.estatus as 'EnInventario' | 'EnPreparacion' | 'Entregado' | undefined
  const proveedorFilter = params.proveedorId
  const fechaDesde = params.fechaDesde
  const fechaHasta = params.fechaHasta
  const semanaFilter = params.semana ? Number(params.semana) : undefined

  const where = {
    ...(materialFilter && { material: materialFilter }),
    ...(estatusFilter && { estatus: estatusFilter }),
    ...(proveedorFilter && { proveedorId: proveedorFilter }),
    ...(semanaFilter && { semana: semanaFilter }),
    ...(fechaDesde || fechaHasta
      ? {
          fecha: {
            ...(fechaDesde && { gte: new Date(fechaDesde + 'T00:00:00') }),
            ...(fechaHasta && { lte: new Date(fechaHasta + 'T23:59:59') }),
          },
        }
      : {}),
  }

  const [entradas, total, proveedores, todasEntradas] = await Promise.all([
    prisma.entrada.findMany({
      where,
      include: { proveedor: true },
      orderBy: { fecha: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.entrada.count({ where }),
    prisma.proveedor.findMany({ orderBy: { nombre: 'asc' } }),
    prisma.entrada.findMany({
      where,
      include: { proveedor: true },
      orderBy: { fecha: 'desc' },
    }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const exportRows = todasEntradas.map((e) => ({
    Fecha: e.fecha.toISOString().split('T')[0],
    Semana: e.semana,
    Origen: e.proveedor.nombre,
    Banco: e.banco,
    Material: e.material,
    Medida: e.medida,
    'Peso KG': e.pesoKg,
    Estatus: getEstatusLabel(e.estatus),
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Entradas</h1>
          <p className="text-muted-foreground">Registro de bancos recibidos.</p>
        </div>
        <EntradaCreate proveedores={proveedores} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Historial</CardTitle>
          <ReportExport
            filename="entradas.pdf"
            title="Reporte de Entradas"
            headers={['Fecha', 'Semana', 'Banco', 'Material', 'Medida', 'Peso KG', 'Proveedor', 'Estatus']}
            rows={todasEntradas.map((e) => [
              e.fecha.toISOString().split('T')[0],
              e.semana,
              e.banco,
              e.material,
              e.medida,
              e.pesoKg.toFixed(2),
              e.proveedor.nombre,
              getEstatusLabel(e.estatus),
            ])}
            exportRows={exportRows}
            subtitle={`Generado el ${new Date().toLocaleDateString('es-MX')}`}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <EntradaFilters materiales={MATERIALES} proveedores={proveedores} />

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
                      <EntradaStatus id={e.id} estatus={e.estatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {(e.estatus === 'EnInventario' || e.estatus === 'EnPreparacion') && (
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

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            basePath="/entradas"
            params={{
              material: materialFilter,
              estatus: estatusFilter,
              proveedorId: proveedorFilter,
              fechaDesde,
              fechaHasta,
              semana: params.semana,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
