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
import { ProveedorForm } from './proveedor-form'
import { ProveedorDelete } from './proveedor-delete'

export default async function ProveedoresPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const proveedores = await prisma.proveedor.findMany({
    orderBy: { nombre: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Proveedores</h1>
        <p className="text-muted-foreground">Administra proveedores y clientes.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo proveedor / cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ProveedorForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="w-24"></TableHead>
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
                  <TableCell>
                    <ProveedorDelete id={p.id} isAdmin={session.user.role === 'ADMIN'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
