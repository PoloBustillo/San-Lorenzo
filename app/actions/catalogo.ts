'use server'

import { prisma } from '@/lib/prisma'
import { checkAuth } from '@/lib/auth-helpers'
import { revalidatePath } from 'next/cache'

export async function obtenerCatalogoMateriales() {
  return prisma.catalogoMaterial.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' },
  })
}

export async function obtenerCatalogoMedidas() {
  return prisma.catalogoMedida.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' },
  })
}

export async function agregarMaterial(nombre: string) {
  await checkAuth()
  await prisma.catalogoMaterial.create({ data: { nombre } })
  revalidatePath('/')
}

export async function desactivarMaterial(id: string) {
  await checkAuth()
  await prisma.catalogoMaterial.update({ where: { id }, data: { activo: false } })
  revalidatePath('/')
}

export async function agregarMedida(nombre: string) {
  await checkAuth()
  await prisma.catalogoMedida.create({ data: { nombre } })
  revalidatePath('/')
}

export async function desactivarMedida(id: string) {
  await checkAuth()
  await prisma.catalogoMedida.update({ where: { id }, data: { activo: false } })
  revalidatePath('/')
}
