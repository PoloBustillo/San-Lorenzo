import { PrismaClient, Role, TipoProveedor } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { MATERIALES, MEDIDAS, obtenerCodigoProducto } from '../lib/constants'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('madera@123', 10)

  await prisma.user.upsert({
    where: { email: 'madera@admin.com' },
    update: {},
    create: {
      email: 'madera@admin.com',
      name: 'Administrador',
      password: adminPassword,
      role: Role.ADMIN,
    },
  })

  const proveedores = [
    { nombre: 'VW', tipo: TipoProveedor.PROVEEDOR },
    { nombre: 'Maderas del Sur', tipo: TipoProveedor.PROVEEDOR },
    { nombre: 'Constructora Norte', tipo: TipoProveedor.CLIENTE },
  ]

  for (const p of proveedores) {
    await prisma.proveedor.upsert({
      where: { nombre: p.nombre },
      update: {},
      create: p,
    })
  }

  const configDefaults: Record<string, string> = {
    EMPRESA_NOMBRE: 'Aserradero San Lorenzo',
    EMPRESA_DIRECCION: 'Av. Principal #123, Col. Centro, Cd. Madero',
    EMPRESA_TELEFONO: '833-123-4567',
    EMPRESA_RFC: 'ASL123456ABC',
    EMPRESA_LOGO: '',
    IVA_PORCENTAJE: '16',
  }

  for (const [clave, valor] of Object.entries(configDefaults)) {
    await prisma.configuracion.upsert({
      where: { clave },
      update: {},
      create: { clave, valor },
    })
  }

  for (const material of MATERIALES) {
    await prisma.umbralMaterial.upsert({
      where: { material },
      update: {},
      create: { material, minBancos: 0, minKg: 0, precioPorKg: 0 },
    })
  }

  for (const m of MATERIALES) {
    await prisma.catalogoMaterial.upsert({
      where: { nombre: m },
      update: {},
      create: { nombre: m },
    })
  }

  for (const m of MEDIDAS) {
    await prisma.catalogoMedida.upsert({
      where: { nombre: m },
      update: {},
      create: { nombre: m },
    })
  }

  const dbMateriales = await prisma.catalogoMaterial.findMany()
  const dbMedidas = await prisma.catalogoMedida.findMany()

  for (const mat of dbMateriales) {
    for (const med of dbMedidas) {
      const codigo = obtenerCodigoProducto(mat.nombre, med.nombre)
      await prisma.catalogoProducto.upsert({
        where: { materialId_medidaId: { materialId: mat.id, medidaId: med.id } },
        update: {},
        create: {
          materialId: mat.id,
          medidaId: med.id,
          codigo,
          activo: true,
        },
      })
    }
  }

  console.log('Seed completado.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
