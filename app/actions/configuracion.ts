'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export type ActionResult = { success: boolean; error?: string }

async function checkAdmin() {
  const session = await auth()
  if (!session) throw new Error('No autorizado')
  if (session.user.role !== Role.ADMIN) throw new Error('Solo administradores')
  return session
}

export async function obtenerConfiguracion(): Promise<Record<string, string>> {
  const session = await auth()
  if (!session) throw new Error('No autorizado')

  const registros = await prisma.configuracion.findMany()
  return registros.reduce(
    (acc, r) => {
      acc[r.clave] = r.valor
      return acc
    },
    {} as Record<string, string>
  )
}

export async function actualizarConfiguracion(
  clave: string,
  valor: string
): Promise<ActionResult> {
  try {
    await checkAdmin()

    await prisma.configuracion.upsert({
      where: { clave },
      update: { valor },
      create: { clave, valor },
    })

    revalidatePath('/configuracion')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al guardar configuración'
    return { success: false, error: message }
  }
}

export async function obtenerUmbrales() {
  const session = await auth()
  if (!session) throw new Error('No autorizado')

  return prisma.umbralMaterial.findMany({ orderBy: { material: 'asc' } })
}

export async function actualizarUmbral(
  material: string,
  data: { minBancos?: number | null; minKg?: number | null; precioPorKg?: number | null }
): Promise<ActionResult> {
  try {
    await checkAdmin()

    await prisma.umbralMaterial.upsert({
      where: { material },
      update: {
        minBancos: data.minBancos ?? null,
        minKg: data.minKg ?? null,
        precioPorKg: data.precioPorKg ?? null,
      },
      create: {
        material,
        minBancos: data.minBancos ?? null,
        minKg: data.minKg ?? null,
        precioPorKg: data.precioPorKg ?? null,
      },
    })

    revalidatePath('/configuracion')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al guardar umbral'
    return { success: false, error: message }
  }
}
