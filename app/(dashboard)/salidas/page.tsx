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
import { ResponsiveTable } from '@/components/responsive-table'
import { SalidaForm } from './salida-form'
import { SalidaDetail } from './salida-detail'
import { SalidaDelete } from './salida-delete'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'

export default async function SalidasPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const salidas = await prisma.salida.findMany({
    include: { entradas: { include: { proveedor: true } } },
    orderBy: { numero: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
          <ResponsiveTable>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Bancos</TableHead>
                  <TableHead>Peso total KG</TableHead>
                  <TableHead className="w-36 text-right">Acciones</TableHead>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <SalidaDetail
                            salida={{
                              ...s,
                              fecha: s.fecha.toISOString(),
                            }}
                          />
                          <SalidaForm
                            salida={s}
                            trigger={
                              <Button variant="outline" size="icon">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <SalidaDelete id={s.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </ResponsiveTable>
        </CardContent>
      </Card>
    </div>
  )
}
