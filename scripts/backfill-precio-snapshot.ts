import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const entradas = await prisma.entrada.findMany({
    where: { precioPorKg: null },
    select: { id: true, material: true },
  })

  if (entradas.length === 0) {
    console.log('No entradas need backfill.')
    return
  }

  const materiales = [...new Set(entradas.map((e) => e.material))]
  const umbrales = await prisma.umbralMaterial.findMany({
    where: { material: { in: materiales } },
    select: { material: true, precioPorKg: true },
  })
  const precioMap = new Map(umbrales.map((u) => [u.material, u.precioPorKg]))

  let updated = 0
  for (const e of entradas) {
    const precio = precioMap.get(e.material) ?? null
    await prisma.entrada.update({
      where: { id: e.id },
      data: { precioPorKg: precio },
    })
    updated++
  }

  console.log(`Backfilled ${updated} entradas.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
