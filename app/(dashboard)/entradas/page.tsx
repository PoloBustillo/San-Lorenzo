import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ResponsiveTable } from '@/components/responsive-table'
import { ReportExport } from '@/components/report-export'
import { Pagination } from '@/components/pagination'
import { getEstatusLabel } from '@/lib/utils'
import { EntradaCreate } from './entrada-create'
import { EntradaEdit } from './entrada-edit'
import { EntradaDelete } from './entrada-delete'
import { EntradaStatus } from './entrada-status'
import { obtenerProductosActivos, obtenerNombresMateriales } from '@/app/actions/catalogo'
import { FilterBar } from '@/components/filter-bar'
import { SortableHead } from '@/components/sortable-head'
import { MobileCard, MobileCardField, MobileCardList } from '@/components/mobile-card'

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
    sortBy?: string
    sortOrder?: string
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

  const sortField = params.sortBy ?? 'fecha'
  const sortOrder = (params.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'

  const orderBy = sortField === 'proveedor'
    ? { proveedor: { nombre: sortOrder } }
    : { [sortField]: sortOrder }

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

  const [entradas, total, proveedores, todasEntradas, productos, materiales] = await Promise.all([
    prisma.entrada.findMany({
      where,
      include: { proveedor: true },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.entrada.count({ where }),
    prisma.proveedor.findMany({ orderBy: { nombre: 'asc' } }),
    prisma.entrada.findMany({
      where,
      include: { proveedor: true },
      orderBy,
    }),
    obtenerProductosActivos(),
    obtenerNombresMateriales(),
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
        <EntradaCreate proveedores={proveedores} productos={productos} />
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
          <FilterBar
            basePath="/entradas"
            fields={['material', 'estatus', 'proveedor', 'fechaDesde', 'fechaHasta', 'semana']}
            materiales={materiales}
            proveedores={proveedores}
          />

          <div className="hidden md:block">
            <ResponsiveTable>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHead label="Fecha" field="fecha" basePath="/entradas" />
                    <SortableHead label="Semana" field="semana" basePath="/entradas" />
                    <SortableHead label="Origen" field="proveedor" basePath="/entradas" />
                    <SortableHead label="Banco" field="banco" basePath="/entradas" />
                    <SortableHead label="Material" field="material" basePath="/entradas" />
                    <SortableHead label="Medida" field="medida" basePath="/entradas" />
                    <SortableHead label="Peso KG" field="pesoKg" basePath="/entradas" />
                    <SortableHead label="Estatus" field="estatus" basePath="/entradas" />
                    <th className="h-10 px-2 text-right align-middle font-medium whitespace-nowrap">Acciones</th>
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
                            <EntradaEdit entrada={e} proveedores={proveedores} productos={productos} />
                          )}
                          <EntradaDelete id={e.id} disabled={e.estatus === 'Entregado'} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ResponsiveTable>
          </div>

          <MobileCardList>
            {entradas.length === 0 && (
              <p className="text-center text-sm text-muted-foreground md:hidden">
                No hay entradas registradas.
              </p>
            )}
            {entradas.map((e) => (
              <MobileCard key={e.id}>
                <MobileCardField label="Fecha">
                  {e.fecha.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                </MobileCardField>
                <MobileCardField label="Banco">{e.banco}</MobileCardField>
                <MobileCardField label="Material">{e.material} · {e.medida}</MobileCardField>
                <MobileCardField label="Peso">{e.pesoKg.toFixed(2)} KG</MobileCardField>
                <MobileCardField label="Origen">{e.proveedor.nombre}</MobileCardField>
                <MobileCardField label="Estatus">
                  <EntradaStatus id={e.id} estatus={e.estatus} />
                </MobileCardField>
                <div className="flex justify-end gap-2 pt-1">
                  {(e.estatus === 'EnInventario' || e.estatus === 'EnPreparacion') && (
                    <EntradaEdit entrada={e} proveedores={proveedores} productos={productos} />
                  )}
                  <EntradaDelete id={e.id} disabled={e.estatus === 'Entregado'} />
                </div>
              </MobileCard>
            ))}
          </MobileCardList>

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
              sortBy: params.sortBy,
              sortOrder: params.sortOrder,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
