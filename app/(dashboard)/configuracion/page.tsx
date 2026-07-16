import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Role } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { obtenerConfiguracion, obtenerUmbrales } from '@/app/actions/configuracion'
import { MATERIALES } from '@/lib/constants'
import { ConfigEmpresaForm } from './config-empresa-form'
import { ConfigUmbralesForm } from './config-umbrales-form'

export default async function ConfiguracionPage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (session.user.role !== Role.ADMIN) redirect('/')

  const [config, umbrales] = await Promise.all([
    obtenerConfiguracion(),
    obtenerUmbrales(),
  ])

  const umbralesMap = new Map(umbrales.map((u) => [u.material, u]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Datos de la empresa, IVA, umbrales y precios por material.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigEmpresaForm config={config} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Umbrales y precios por material</CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigUmbralesForm materiales={MATERIALES} umbrales={umbralesMap} />
        </CardContent>
      </Card>
    </div>
  )
}
