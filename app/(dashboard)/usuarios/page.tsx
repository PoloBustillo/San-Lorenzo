import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
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
import { UsuarioCreate } from './usuario-create'
import { UsuarioDelete } from './usuario-delete'
import { UsuarioEdit } from './usuario-edit'

export default async function UsuariosPage() {
  const session = await auth()
  if (session?.user.role !== Role.ADMIN) redirect('/')

  const usuarios = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const exportRows = usuarios.map((u) => ({
    Nombre: u.name ?? '',
    Correo: u.email,
    Rol: u.role,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">Gestión de usuarios del sistema.</p>
        </div>
        <UsuarioCreate />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Usuarios registrados</CardTitle>
          <TableExport filename="usuarios.xlsx" rows={exportRows} />
        </CardHeader>
        <CardContent>
          <ResponsiveTable>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="w-28 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No hay usuarios registrados.
                    </TableCell>
                  </TableRow>
                )}
                {usuarios.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.name || '-'}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <UsuarioEdit usuario={u} />
                        <UsuarioDelete
                          id={u.id}
                          email={u.email}
                          isSelf={session.user.id === u.id}
                        />
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
