import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Migrando CatalogoMaterial + CatalogoMedida + CatalogoProducto → CatalogoProducto unificado...')

  // 1. Fetch all old data
  const materiales = await prisma.$queryRawUnsafe<{ id: string; nombre: string; descripcion: string | null; categoria: string | null; imagenUrl: string | null; sku: string | null; activo: boolean }[]>(
    'SELECT id, nombre, descripcion, categoria, "imagenUrl", sku, activo FROM "CatalogoMaterial"'
  )
  const medidas = await prisma.$queryRawUnsafe<{ id: string; nombre: string; activo: boolean }[]>(
    'SELECT id, nombre, activo FROM "CatalogoMedida"'
  )
  const oldProductos = await prisma.$queryRawUnsafe<{ id: string; "materialId": string; "medidaId": string; codigo: string; activo: boolean }[]>(
    'SELECT id, "materialId", "medidaId", codigo, activo FROM "CatalogoProducto"'
  )

  console.log(`  Materiales: ${materiales.length}, Medidas: ${medidas.length}, Productos viejos: ${oldProductos.length}`)

  // 2. Build lookup maps
  const materialMap = new Map(materiales.map(m => [m.id, m]))
  const medidaMap = new Map(medidas.map(m => [m.id, m]))

  // 3. Drop old CatalogoProducto table (has FKs to old tables)
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "CatalogoProducto" CASCADE')

  // 4. Drop old tables
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "CatalogoMedida" CASCADE')
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "CatalogoMaterial" CASCADE')

  // 5. Create new CatalogoProducto table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE "CatalogoProducto" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
      "nombre" TEXT NOT NULL,
      "medida" TEXT NOT NULL,
      "codigo" TEXT NOT NULL,
      "descripcion" TEXT,
      "categoria" TEXT,
      "imagenUrl" TEXT,
      "sku" TEXT,
      "activo" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT "CatalogoProducto_pkey" PRIMARY KEY ("id")
    )
  `)
  await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX "CatalogoProducto_codigo_key" ON "CatalogoProducto"("codigo")')
  await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX "CatalogoProducto_nombre_medida_key" ON "CatalogoProducto"("nombre", "medida")')

  // 6. Migrate data from old products
  let migrated = 0
  for (const old of oldProductos) {
    const mat = materialMap.get(old.materialId)
    const med = medidaMap.get(old.medidaId)
    if (!mat || !med) continue

    await prisma.$executeRawUnsafe(
      `INSERT INTO "CatalogoProducto" (id, nombre, medida, codigo, descripcion, categoria, "imagenUrl", sku, activo, "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
       ON CONFLICT ("codigo") DO NOTHING`,
      old.id, mat.nombre, med.nombre, old.codigo,
      mat.descripcion, mat.categoria, mat.imagenUrl, mat.sku, old.activo
    )
    migrated++
  }

  console.log(`  Migrados ${migrated} productos.`)

  // 7. Recreate FK on Entrada
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Entrada"
    ADD CONSTRAINT "Entrada_productoId_fkey"
    FOREIGN KEY ("productoId") REFERENCES "CatalogoProducto"("id") ON DELETE SET NULL ON UPDATE CASCADE
  `)

  console.log('Migración completada.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
