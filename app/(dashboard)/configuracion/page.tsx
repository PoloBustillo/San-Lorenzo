import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Role } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { obtenerConfiguracion, obtenerUmbrales } from '@/app/actions/configuracion'
import { ConfigEmpresaForm } from './config-empresa-form'
import { ConfigUmbralesForm } from './config-umbrales-form'
import { obtenerCatalogoMateriales } from '@/app/actions/catalogo'

export default async function ConfiguracionPage() {
  const session = await auth()
  if (session?.user.role !== Role.ADMIN) redirect('/')

  const [config, umbrales, catalogoMateriales] = await Promise.all([
    obtenerConfiguracion(),
    obtenerUmbrales(),
    obtenerCatalogoMateriales(),
  ])

  const materiales = catalogoMateriales.map((m) => m.nombre)
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
          <ConfigUmbralesForm materiales={materiales} umbrales={umbralesMap} />
        </CardContent>
      </Card>
    </div>
  )
}
