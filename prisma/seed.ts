import { PrismaClient, Role, TipoProveedor } from '@prisma/client'
import bcrypt from 'bcryptjs'

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
