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
import { ResponsiveTable } from '@/components/responsive-table'
import { ReportExport } from '@/components/report-export'
import { Pagination } from '@/components/pagination'
import { SalidaForm } from './salida-form'
import { SalidaDetail } from './salida-detail'
import { SalidaDelete } from './salida-delete'
import { SalidaTicket } from './salida-ticket'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { obtenerConfiguracion } from '@/app/actions/configuracion'
import { FilterBar } from '@/components/filter-bar'

const PAGE_SIZE = 20

export default async function SalidasPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    numero?: string
    fechaDesde?: string
    fechaHasta?: string
  }>
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? 1))
  const numeroFilter = params.numero ? Number(params.numero) : undefined
  const fechaDesde = params.fechaDesde
  const fechaHasta = params.fechaHasta

  const where = {
    ...(numeroFilter && { numero: numeroFilter }),
    ...(fechaDesde || fechaHasta
      ? {
          fecha: {
            ...(fechaDesde && { gte: new Date(fechaDesde + 'T00:00:00') }),
            ...(fechaHasta && { lte: new Date(fechaHasta + 'T23:59:59') }),
          },
        }
      : {}),
  }

  const [salidas, total, todasSalidas, config] = await Promise.all([
    prisma.salida.findMany({
      where,
      include: { entradas: { include: { proveedor: true } } },
      orderBy: { numero: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.salida.count({ where }),
    prisma.salida.findMany({
      where,
      include: { entradas: { include: { proveedor: true } } },
      orderBy: { numero: 'desc' },
    }),
    obtenerConfiguracion(),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const empresa = {
    nombre: config.EMPRESA_NOMBRE ?? 'Aserradero San Lorenzo',
    direccion: config.EMPRESA_DIRECCION ?? '',
    telefono: config.EMPRESA_TELEFONO ?? '',
    rfc: config.EMPRESA_RFC ?? '',
  }
  const ivaPorcentaje = Number(config.IVA_PORCENTAJE ?? 16)

  const exportRows = todasSalidas.flatMap((s) => {
    const fecha = s.fecha.toISOString().split('T')[0]
    if (s.entradas.length === 0) {
      return [{
        Salida: s.numero,
        Fecha: fecha,
        Banco: '',
        Material: '',
        Medida: '',
        'Peso KG': 0,
        Proveedor: '',
      }]
    }
    return s.entradas.map((e) => ({
      Salida: s.numero,
      Fecha: fecha,
      Banco: e.banco,
      Material: e.material,
      Medida: e.medida,
      'Peso KG': e.pesoKg,
      Proveedor: e.proveedor.nombre,
    }))
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salidas</h1>
          <p className="text-muted-foreground">Registro de entregas.</p>
        </div>
        <SalidaForm />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Listado de salidas</CardTitle>
          <ReportExport
            filename="salidas.pdf"
            title="Reporte de Salidas"
            headers={['Salida', 'Fecha', 'Banco', 'Material', 'Medida', 'Peso KG', 'Proveedor']}
            rows={exportRows.map((r) => [r.Salida, r.Fecha, r.Banco, r.Material, r.Medida, r['Peso KG'], r.Proveedor])}
            exportRows={exportRows}
            subtitle={`Generado el ${new Date().toLocaleDateString('es-MX')}`}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <FilterBar
            basePath="/salidas"
            fields={['numero', 'fechaDesde', 'fechaHasta']}
          />

          <ResponsiveTable>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Bancos</TableHead>
                  <TableHead>Peso total KG</TableHead>
                  <TableHead className="w-48 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salidas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No hay salidas registradas.
                    </TableCell>
                  </TableRow>
                )}
                {salidas.map((s) => {
                  const pesoTotal = s.entradas.reduce((sum, e) => sum + e.pesoKg, 0)
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">SALIDA {s.numero}</TableCell>
                      <TableCell>
                        {s.fecha.toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>{s.entradas.length}</TableCell>
                      <TableCell>{pesoTotal.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <SalidaTicket
                            salida={{
                              numero: s.numero,
                              fecha: s.fecha.toISOString(),
                              empresa,
                              ivaPorcentaje,
                              entradas: s.entradas.map((e) => ({
                                banco: e.banco,
                                material: e.material,
                                medida: e.medida,
                                pesoKg: e.pesoKg,
                                proveedor: e.proveedor.nombre,
                                precioPorKg: e.precioPorKg ?? 0,
                              })),
                            }}
                          />
                          <SalidaDetail
                            salida={{
                              ...s,
                              fecha: s.fecha.toISOString(),
                            }}
                          />
                          <SalidaForm
                            salida={s}
                            trigger={
                              <Button variant="outline" size="icon">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <SalidaDelete id={s.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </ResponsiveTable>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            basePath="/salidas"
          />
        </CardContent>
      </Card>
    </div>
  )
}
