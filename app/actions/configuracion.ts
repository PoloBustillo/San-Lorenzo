'use server'

import { prisma } from '@/lib/prisma'
import { checkAuth, checkAdmin } from '@/lib/auth-helpers'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/types'

export async function obtenerConfiguracion(): Promise<Record<string, string>> {
  await checkAuth()

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
  await checkAuth()

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
