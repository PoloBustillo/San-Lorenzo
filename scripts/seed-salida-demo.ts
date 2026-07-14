import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const entradas = await prisma.entrada.findMany({
    where: { estatus: 'EnInventario', material: 'TABLILLA' },
    take: 2,
  })

  if (entradas.length === 0) {
    console.error('No hay entradas disponibles')
    process.exit(1)
  }

  await prisma.$transaction(async (tx) => {
    const salida = await tx.salida.create({
      data: { fecha: new Date('2026-07-12') },
    })
    await tx.entrada.updateMany({
      where: { id: { in: entradas.map((e) => e.id) } },
      data: { estatus: 'Entregado', salidaId: salida.id },
    })
  })

  console.log(`Salida creada con ${entradas.length} bancos.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
