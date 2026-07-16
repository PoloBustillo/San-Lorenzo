import { prisma } from '@/lib/prisma'
import { ESTATUS_INVENTARIO } from '@/lib/utils'
import { ArmadoDnd } from '@/components/armado-dnd'
import type { ArmadoData } from '@/app/actions/inventario'

export const dynamic = 'force-dynamic'

export default async function ArmadoPage() {
  const [entradas, salidas] = await Promise.all([
    prisma.entrada.findMany({
      where: { estatus: { in: ESTATUS_INVENTARIO } },
      include: { proveedor: true },
      orderBy: [{ material: 'asc' }, { medida: 'asc' }, { fecha: 'asc' }],
    }),
    prisma.salida.findMany({
      include: {
        entradas: {
          where: { estatus: { in: ['Entregado', 'EnPreparacion'] } },
          include: { proveedor: true },
        },
      },
      orderBy: { numero: 'desc' },
    }),
  ])

  const initialData: ArmadoData = {
    disponibles: entradas.map((e) => ({
      id: e.id,
      banco: e.banco,
      material: e.material,
      medida: e.medida,
      pesoKg: e.pesoKg,
      proveedor: { nombre: e.proveedor.nombre },
    })),
    salidas: salidas.map((s) => ({
      id: s.id,
      numero: s.numero,
      fecha: s.fecha.toISOString().split('T')[0],
      entradas: s.entradas.map((e) => ({
        id: e.id,
        banco: e.banco,
        material: e.material,
        medida: e.medida,
        pesoKg: e.pesoKg,
        proveedor: { nombre: e.proveedor.nombre },
      })),
    })),
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Armado de salidas</h1>
        <p className="text-muted-foreground">
          Arrastra bancos del inventario a las salidas para asignarlos.
        </p>
      </div>
      <ArmadoDnd initialData={initialData} />
    </div>
  )
}
