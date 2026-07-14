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
import { SalidaForm } from './salida-form'
import { SalidaDetail } from './salida-detail'

export default async function SalidasPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const salidas = await prisma.salida.findMany({
    include: { entradas: { include: { proveedor: true } } },
    orderBy: { numero: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salidas</h1>
          <p className="text-muted-foreground">Registro de entregas.</p>
        </div>
        <SalidaForm />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de salidas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Bancos</TableHead>
                <TableHead>Peso total KG</TableHead>
                <TableHead className="w-24"></TableHead>
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
                    <TableCell>
                      <SalidaDetail
                        salida={{
                          ...s,
                          fecha: s.fecha.toISOString(),
                        }}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
