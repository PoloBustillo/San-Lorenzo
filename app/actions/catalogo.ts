'use server'

import { prisma } from '@/lib/prisma'
import { checkAuth } from '@/lib/auth-helpers'
import { revalidatePath } from 'next/cache'

export type MaterialData = {
  nombre: string
  descripcion?: string | null
  categoria?: string | null
  imagenUrl?: string | null
  sku?: string | null
}

export async function obtenerCatalogoMateriales() {
  return prisma.catalogoMaterial.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' },
  })
}

export async function obtenerTodosMateriales() {
  return prisma.catalogoMaterial.findMany({
    orderBy: { nombre: 'asc' },
  })
}

export async function obtenerCatalogoMedidas() {
  return prisma.catalogoMedida.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' },
  })
}

export async function crearMaterial(data: MaterialData) {
  const session = await checkAuth()
  if (session.user.role !== 'ADMIN') throw new Error('No autorizado')
  await prisma.catalogoMaterial.create({ data })
  revalidatePath('/catalogo')
}

export async function actualizarMaterial(id: string, data: MaterialData) {
  const session = await checkAuth()
  if (session.user.role !== 'ADMIN') throw new Error('No autorizado')
  await prisma.catalogoMaterial.update({ where: { id }, data })
  revalidatePath('/catalogo')
}

export async function toggleMaterial(id: string) {
  const session = await checkAuth()
  if (session.user.role !== 'ADMIN') throw new Error('No autorizado')
  const material = await prisma.catalogoMaterial.findUnique({ where: { id } })
  if (!material) throw new Error('Material no encontrado')
  await prisma.catalogoMaterial.update({
    where: { id },
    data: { activo: !material.activo },
  })
  revalidatePath('/catalogo')
}

export async function crearMedida(nombre: string) {
  const session = await checkAuth()
  if (session.user.role !== 'ADMIN') throw new Error('No autorizado')
  await prisma.catalogoMedida.create({ data: { nombre } })
  revalidatePath('/catalogo')
}

export async function actualizarMedida(id: string, nombre: string) {
  const session = await checkAuth()
  if (session.user.role !== 'ADMIN') throw new Error('No autorizado')
  await prisma.catalogoMedida.update({ where: { id }, data: { nombre } })
  revalidatePath('/catalogo')
}

export async function toggleMedida(id: string) {
  const session = await checkAuth()
  if (session.user.role !== 'ADMIN') throw new Error('No autorizado')
  const medida = await prisma.catalogoMedida.findUnique({ where: { id } })
  if (!medida) throw new Error('Medida no encontrada')
  await prisma.catalogoMedida.update({
    where: { id },
    data: { activo: !medida.activo },
  })
  revalidatePath('/catalogo')
}
