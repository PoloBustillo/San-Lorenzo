'use server'

import { prisma } from '@/lib/prisma'
import { checkAuth } from '@/lib/auth-helpers'
import { revalidatePath } from 'next/cache'
import { obtenerCodigoProducto } from '@/lib/constants'

export type ProductoData = {
  nombre: string
  medida: string
  descripcion?: string | null
  categoria?: string | null
  imagenUrl?: string | null
  sku?: string | null
}

export async function obtenerProductos() {
  return prisma.catalogoProducto.findMany({
    orderBy: { codigo: 'asc' },
  })
}

export async function obtenerProductosActivos() {
  return prisma.catalogoProducto.findMany({
    where: { activo: true },
    orderBy: { codigo: 'asc' },
  })
}

export async function obtenerNombresMateriales() {
  const productos = await prisma.catalogoProducto.findMany({
    where: { activo: true },
    select: { nombre: true },
    distinct: ['nombre'],
    orderBy: { nombre: 'asc' },
  })
  return productos.map((p) => p.nombre)
}

export async function crearProducto(data: ProductoData) {
  const session = await checkAuth()
  if (session.user.role !== 'ADMIN') throw new Error('No autorizado')
  const codigo = obtenerCodigoProducto(data.nombre, data.medida)
  await prisma.catalogoProducto.create({
    data: { ...data, codigo },
  })
  revalidatePath('/catalogo')
}

export async function actualizarProducto(id: string, data: ProductoData) {
  const session = await checkAuth()
  if (session.user.role !== 'ADMIN') throw new Error('No autorizado')
  const codigo = obtenerCodigoProducto(data.nombre, data.medida)
  await prisma.catalogoProducto.update({
    where: { id },
    data: { ...data, codigo },
  })
  revalidatePath('/catalogo')
}

export async function toggleProducto(id: string) {
  const session = await checkAuth()
  if (session.user.role !== 'ADMIN') throw new Error('No autorizado')
  const producto = await prisma.catalogoProducto.findUnique({ where: { id } })
  if (!producto) throw new Error('Producto no encontrado')
  await prisma.catalogoProducto.update({
    where: { id },
    data: { activo: !producto.activo },
  })
  revalidatePath('/catalogo')
}

export async function eliminarProducto(id: string) {
  const session = await checkAuth()
  if (session.user.role !== 'ADMIN') throw new Error('No autorizado')
  const producto = await prisma.catalogoProducto.findUnique({ where: { id } })
  if (!producto) throw new Error('Producto no encontrado')
  await prisma.catalogoProducto.delete({ where: { id } })
  revalidatePath('/catalogo')
}
