import { auth } from '@/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { obtenerDatosDashboard } from '@/app/actions/dashboard'
import { DashboardChart, InventarioChart } from './dashboard-charts'
import {
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'

export default async function HomePage() {
  const session = await auth()

  const data = await obtenerDatosDashboard()
  const { stats, actividadDiaria, inventarioMaterial, alertas, actividadReciente } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido, {session?.user.name || session?.user.email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEntradas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Salidas</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSalidas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En inventario</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enInventario}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Proveedores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProveedores}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardChart data={actividadDiaria} />
        <InventarioChart data={inventarioMaterial} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Alertas de inventario
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alertas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay materiales por debajo del umbral configurado.
              </p>
            ) : (
              <ul className="space-y-2">
                {alertas.map((a, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Badge variant="destructive">{a.tipo === 'bancos' ? 'Bancos' : 'KG'}</Badge>
                    {a.mensaje}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Últimas entradas</p>
              <ul className="space-y-1">
                {actividadReciente.entradas.length === 0 && (
                  <li className="text-sm text-muted-foreground">Sin entradas recientes.</li>
                )}
                {actividadReciente.entradas.map((e) => (
                  <li key={e.id} className="flex justify-between text-sm">
                    <span>
                      {e.banco} · {e.material}
                    </span>
                    <span className="text-muted-foreground">
                      {e.pesoKg.toFixed(2)} KG · {e.proveedor}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Últimas salidas</p>
              <ul className="space-y-1">
                {actividadReciente.salidas.length === 0 && (
                  <li className="text-sm text-muted-foreground">Sin salidas recientes.</li>
                )}
                {actividadReciente.salidas.map((s) => (
                  <li key={s.id} className="flex justify-between text-sm">
                    <Link href="/salidas" className="hover:underline">
                      SALIDA {s.numero}
                    </Link>
                    <span className="text-muted-foreground">
                      {s.bancos} bancos · {s.pesoKg.toFixed(2)} KG
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
