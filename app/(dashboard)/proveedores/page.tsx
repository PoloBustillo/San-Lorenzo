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
import { ResponsiveTable } from '@/components/responsive-table'
import { TableExport } from '@/components/table-export'
import { ProveedorCreate } from './proveedor-create'
import { ProveedorDelete } from './proveedor-delete'
import { ProveedorEdit } from './proveedor-edit'

export default async function ProveedoresPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const proveedores = await prisma.proveedor.findMany({
    orderBy: { nombre: 'asc' },
  })

  const exportRows = proveedores.map((p) => ({
    Nombre: p.nombre,
    Tipo: p.tipo,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proveedores</h1>
          <p className="text-muted-foreground">Administra proveedores y clientes.</p>
        </div>
        <ProveedorCreate />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Listado</CardTitle>
          <TableExport filename="proveedores.xlsx" rows={exportRows} />
        </CardHeader>
        <CardContent>
          <ResponsiveTable>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-28 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proveedores.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No hay proveedores registrados.
                    </TableCell>
                  </TableRow>
                )}
                {proveedores.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nombre}</TableCell>
                    <TableCell>
                      <Badge variant={p.tipo === 'CLIENTE' ? 'secondary' : 'default'}>
                        {p.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <ProveedorEdit proveedor={p} />
                        <ProveedorDelete id={p.id} isAdmin={session.user.role === 'ADMIN'} />
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
