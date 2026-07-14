import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImportarForm } from './importar-form'

export default async function ImportarPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Importar desde Excel</h1>
        <p className="text-muted-foreground">
          Sube un archivo Excel con entradas. El sistema detecta automáticamente las columnas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Archivo Excel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Columnas esperadas: <strong>fecha</strong>, <strong>semana</strong> (opcional),{' '}
            <strong>origen/proveedor</strong>, <strong>banco/folio</strong>,{' '}
            <strong>material</strong>, <strong>medida/grosor</strong>, <strong>peso/kg</strong>.
          </p>
          <ImportarForm />
        </CardContent>
      </Card>
    </div>
  )
}
