import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { Package, ArrowDownLeft, ArrowUpRight, Users } from 'lucide-react'
import { ESTATUS_INVENTARIO } from '@/lib/utils'

export default async function HomePage() {
  const session = await auth()
  if (!session) redirect('/login')

  const totalEntradas = await prisma.entrada.count()
  const totalSalidas = await prisma.salida.count()
  const enInventario = await prisma.entrada.count({
    where: { estatus: { in: ESTATUS_INVENTARIO } },
  })
  const totalProveedores = await prisma.proveedor.count()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido, {session.user.name || session.user.email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntradas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Salidas</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSalidas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En inventario</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enInventario}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Proveedores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProveedores}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
