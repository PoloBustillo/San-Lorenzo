import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const proveedor = await prisma.proveedor.findFirst({ where: { nombre: 'VW' } })
  if (!proveedor) {
    console.error('Proveedor VW no encontrado. Ejecuta prisma db seed primero.')
    process.exit(1)
  }

  await prisma.entrada.createMany({
    data: [
      {
        fecha: new Date('2026-07-10'),
        semana: 28,
        proveedorId: proveedor.id,
        banco: 'HUA1',
        material: 'TABLILLA',
        medida: '1.1',
        pesoKg: 1500,
        estatus: 'EnInventario',
      },
      {
        fecha: new Date('2026-07-10'),
        semana: 28,
        proveedorId: proveedor.id,
        banco: 'HUA2',
        material: 'TABLILLA',
        medida: '1.1',
        pesoKg: 2300,
        estatus: 'EnInventario',
      },
      {
        fecha: new Date('2026-07-11'),
        semana: 28,
        proveedorId: proveedor.id,
        banco: 'TAC001',
        material: 'TACON',
        medida: 'NA',
        pesoKg: 800,
        estatus: 'EnInventario',
      },
      {
        fecha: new Date('2026-07-11'),
        semana: 28,
        proveedorId: proveedor.id,
        banco: 'LEN001',
        material: 'LEÑA',
        medida: 'NA',
        pesoKg: 1200,
        estatus: 'EnInventario',
      },
    ],
  })

  console.log('Datos de demo insertados.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
