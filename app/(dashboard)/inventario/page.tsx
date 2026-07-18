import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { obtenerCodigoProducto } from '@/lib/constants'
import { ResponsiveTable } from '@/components/responsive-table'
import { TableExport } from '@/components/table-export'
import { Pagination } from '@/components/pagination'
import { ESTATUS_INVENTARIO } from '@/lib/utils'
import { obtenerNombresMateriales } from '@/app/actions/catalogo'
import { SortableHead } from '@/components/sortable-head'
import { FilterBar } from '@/components/filter-bar'
import { BarcodeCell } from '@/components/barcode-cell'
import { MobileCard, MobileCardField, MobileCardList } from '@/components/mobile-card'

const PAGE_SIZE = 20

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ material?: string; page?: string; sortBy?: string; sortOrder?: string }>
}) {
  const params = await searchParams
  const materialFilter = params.material
  const page = Math.max(1, Number(params.page ?? 1))
  const sortField = params.sortBy ?? 'codigo'
  const sortOrder = params.sortOrder === 'asc' ? 1 : -1

  const [entradas, materiales] = await Promise.all([
    prisma.entrada.findMany({
      where: {
        estatus: { in: ESTATUS_INVENTARIO },
        ...(materialFilter && { material: materialFilter }),
      },
    }),
    obtenerNombresMateriales(),
  ])

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

  type Item = { material: string; medida: string; totalKg: number; bancos: number }
  const allItems = Object.entries(grupos)
  const sortFns: Record<string, (a: [string, Item], b: [string, Item]) => number> = {
    codigo: ([a], [b]) => a.localeCompare(b) * sortOrder,
    material: ([, a], [, b]) => a.material.localeCompare(b.material) * sortOrder,
    medida: ([, a], [, b]) => a.medida.localeCompare(b.medida) * sortOrder,
    totalKg: ([, a], [, b]) => (a.totalKg - b.totalKg) * sortOrder,
    bancos: ([, a], [, b]) => (a.bancos - b.bancos) * sortOrder,
  }
  const sortedItems = allItems.sort(sortFns[sortField] ?? sortFns.codigo)
  const totalKg = entradas.reduce((sum, e) => sum + e.pesoKg, 0)
  const total = sortedItems.length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const items = sortedItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const exportRows = sortedItems.map(([codigo, item]) => ({
    Código: codigo,
    SKU: codigo,
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
          <FilterBar
            basePath="/inventario"
            fields={['material']}
            materiales={materiales}
          />
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
              <p className="text-2xl font-bold">{total}</p>
            </div>
          </div>

          <div className="hidden md:block">
            <ResponsiveTable>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHead label="Código" field="codigo" basePath="/inventario" />
                    <SortableHead label="Material" field="material" basePath="/inventario" />
                    <SortableHead label="Medida" field="medida" basePath="/inventario" />
                    <SortableHead label="Total KG" field="totalKg" basePath="/inventario" />
                    <SortableHead label="Bancos" field="bancos" basePath="/inventario" />
                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Código de barras</th>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
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
                      <TableCell>
                        <BarcodeCell
                          codigo={codigo}
                          material={item.material}
                          medida={item.medida}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ResponsiveTable>
          </div>

          <MobileCardList>
            {items.length === 0 && (
              <p className="text-center text-sm text-muted-foreground md:hidden">
                No hay inventario disponible.
              </p>
            )}
            {items.map(([codigo, item]) => (
              <MobileCard key={codigo}>
                <MobileCardField label="Código">{codigo}</MobileCardField>
                <MobileCardField label="Material">{item.material}</MobileCardField>
                <MobileCardField label="Medida">{item.medida}</MobileCardField>
                <MobileCardField label="Total KG">{item.totalKg.toFixed(2)}</MobileCardField>
                <MobileCardField label="Bancos">{item.bancos}</MobileCardField>
                <div className="pt-1">
                  <BarcodeCell
                    codigo={codigo}
                    material={item.material}
                    medida={item.medida}
                  />
                </div>
              </MobileCard>
            ))}
          </MobileCardList>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            basePath="/inventario"
            params={{
              material: materialFilter,
              sortBy: params.sortBy,
              sortOrder: params.sortOrder,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
