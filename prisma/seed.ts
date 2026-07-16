import { PrismaClient, Role, TipoProveedor } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { MATERIALES, MEDIDAS } from '../lib/constants'

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
