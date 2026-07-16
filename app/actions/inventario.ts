'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { MATERIALES, MEDIDAS_POR_MATERIAL } from '@/lib/constants'
import { ESTATUS_INVENTARIO } from '@/lib/utils'

function getWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

async function checkAuth() {
  const session = await auth()
  if (!session) throw new Error('No autorizado')
  return session
}

export type ActionResult = { success: boolean; error?: string }

export async function crearProveedor(formData: FormData): Promise<ActionResult> {
  try {
    await checkAuth()
    const nombre = String(formData.get('nombre') ?? '').trim()
    const tipo = String(formData.get('tipo') ?? '') as 'CLIENTE' | 'PROVEEDOR'

    if (!nombre) return { success: false, error: 'El nombre es requerido' }
    if (!['CLIENTE', 'PROVEEDOR'].includes(tipo)) {
      return { success: false, error: 'Tipo de proveedor inválido' }
    }

    await prisma.proveedor.create({ data: { nombre, tipo } })
    revalidatePath('/proveedores')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear proveedor'
    return { success: false, error: message }
  }
}

export async function eliminarProveedor(id: string): Promise<ActionResult> {
  try {
    await checkAuth()
    await prisma.proveedor.delete({ where: { id } })
    revalidatePath('/proveedores')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar proveedor'
    if (message.includes('foreign key') || message.includes('violates')) {
      return { success: false, error: 'No se puede eliminar un proveedor con entradas registradas' }
    }
    return { success: false, error: message }
  }
}

export async function actualizarProveedor(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await checkAuth()
    const nombre = String(formData.get('nombre') ?? '').trim()
    const tipo = String(formData.get('tipo') ?? '') as 'CLIENTE' | 'PROVEEDOR'

    if (!nombre) return { success: false, error: 'El nombre es requerido' }
    if (!['CLIENTE', 'PROVEEDOR'].includes(tipo)) {
      return { success: false, error: 'Tipo de proveedor inválido' }
    }

    await prisma.proveedor.update({
      where: { id },
      data: { nombre, tipo },
    })
    revalidatePath('/proveedores')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar proveedor'
    if (message.includes('Unique constraint')) {
      return { success: false, error: 'Ya existe un proveedor con ese nombre' }
    }
    return { success: false, error: message }
  }
}

export async function crearEntrada(formData: FormData): Promise<ActionResult> {
  try {
    await checkAuth()
    const fechaRaw = String(formData.get('fecha') ?? '')
    const proveedorId = String(formData.get('proveedorId') ?? '')
    const banco = String(formData.get('banco') ?? '').trim()
    const material = String(formData.get('material') ?? '')
    const medida = String(formData.get('medida') ?? '')
    const pesoRaw = String(formData.get('pesoKg') ?? '')

    if (!fechaRaw || !proveedorId || !banco || !material || !medida || !pesoRaw) {
      return { success: false, error: 'Todos los campos son requeridos' }
    }

    if (!(MATERIALES as readonly string[]).includes(material)) {
      return { success: false, error: 'Material inválido' }
    }

    const medidasPermitidas = MEDIDAS_POR_MATERIAL[material as keyof typeof MEDIDAS_POR_MATERIAL]
    if (!(medidasPermitidas as readonly string[]).includes(medida)) {
      return { success: false, error: 'Medida inválida para el material seleccionado' }
    }

    const fecha = new Date(fechaRaw + 'T00:00:00')
    if (isNaN(fecha.getTime())) {
      return { success: false, error: 'Fecha inválida' }
    }

    const pesoKg = Number(pesoRaw)
    if (isNaN(pesoKg) || pesoKg <= 0) {
      return { success: false, error: 'Peso inválido' }
    }

    const semana = getWeek(fecha)

    await prisma.entrada.create({
      data: {
        fecha,
        semana,
        proveedorId,
        banco,
        material,
        medida,
        pesoKg,
      },
    })

    revalidatePath('/entradas')
    revalidatePath('/inventario')
    revalidatePath('/salidas')
    revalidatePath('/reportes/tacon')
    revalidatePath('/reportes/lena')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear entrada'
    return { success: false, error: message }
  }
}

export async function eliminarEntrada(id: string): Promise<ActionResult> {
  try {
    await checkAuth()
    const entrada = await prisma.entrada.findUnique({ where: { id } })
    if (!entrada) return { success: false, error: 'Entrada no encontrada' }
    if (entrada.estatus === 'Entregado') {
      return { success: false, error: 'No se puede eliminar una entrada entregada' }
    }
    await prisma.entrada.delete({ where: { id } })
    revalidatePath('/entradas')
    revalidatePath('/inventario')
    revalidatePath('/salidas')
    revalidatePath('/reportes/tacon')
    revalidatePath('/reportes/lena')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar entrada'
    return { success: false, error: message }
  }
}

export async function actualizarEntrada(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await checkAuth()
    const entrada = await prisma.entrada.findUnique({ where: { id } })
    if (!entrada) return { success: false, error: 'Entrada no encontrada' }
    if (entrada.estatus === 'Entregado') {
      return { success: false, error: 'No se puede editar una entrada entregada' }
    }

    const fechaRaw = String(formData.get('fecha') ?? '')
    const proveedorId = String(formData.get('proveedorId') ?? '')
    const banco = String(formData.get('banco') ?? '').trim()
    const material = String(formData.get('material') ?? '')
    const medida = String(formData.get('medida') ?? '')
    const pesoRaw = String(formData.get('pesoKg') ?? '')

    if (!fechaRaw || !proveedorId || !banco || !material || !medida || !pesoRaw) {
      return { success: false, error: 'Todos los campos son requeridos' }
    }

    if (!(MATERIALES as readonly string[]).includes(material)) {
      return { success: false, error: 'Material inválido' }
    }

    const medidasPermitidas = MEDIDAS_POR_MATERIAL[material as keyof typeof MEDIDAS_POR_MATERIAL]
    if (!(medidasPermitidas as readonly string[]).includes(medida)) {
      return { success: false, error: 'Medida inválida para el material seleccionado' }
    }

    const fecha = new Date(fechaRaw + 'T00:00:00')
    if (isNaN(fecha.getTime())) {
      return { success: false, error: 'Fecha inválida' }
    }

    const pesoKg = Number(pesoRaw)
    if (isNaN(pesoKg) || pesoKg <= 0) {
      return { success: false, error: 'Peso inválido' }
    }

    const semana = getWeek(fecha)

    await prisma.entrada.update({
      where: { id },
      data: { fecha, semana, proveedorId, banco, material, medida, pesoKg },
    })

    revalidatePath('/entradas')
    revalidatePath('/inventario')
    revalidatePath('/salidas')
    revalidatePath('/reportes/tacon')
    revalidatePath('/reportes/lena')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar entrada'
    return { success: false, error: message }
  }
}

export async function cambiarEstatusEntrada(
  id: string,
  estatus: string
): Promise<ActionResult> {
  try {
    await checkAuth()

    if (!['EnInventario', 'EnPreparacion', 'Entregado'].includes(estatus)) {
      return { success: false, error: 'Estatus inválido' }
    }

    if (estatus === 'Entregado') {
      return { success: false, error: 'El estatus Entregado solo se asigna desde una salida' }
    }

    const entrada = await prisma.entrada.findUnique({ where: { id } })
    if (!entrada) return { success: false, error: 'Entrada no encontrada' }

    const statusValue = estatus as import('@prisma/client').Estatus

    if (entrada.salidaId) {
      await prisma.entrada.update({
        where: { id },
        data: { estatus: statusValue, salidaId: null },
      })
    } else {
      await prisma.entrada.update({ where: { id }, data: { estatus: statusValue } })
    }

    revalidatePath('/entradas')
    revalidatePath('/inventario')
    revalidatePath('/salidas')
    revalidatePath('/reportes/tacon')
    revalidatePath('/reportes/lena')
    revalidatePath('/reportes/armado')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al cambiar estatus'
    return { success: false, error: message }
  }
}

export async function obtenerEntradasDisponibles() {
  const session = await auth()
  if (!session) throw new Error('No autorizado')

  return prisma.entrada.findMany({
    where: { estatus: { in: ESTATUS_INVENTARIO } },
    include: { proveedor: true },
    orderBy: { fecha: 'desc' },
  })
}

function parseNumeroSalidaOptional(
  raw: FormDataEntryValue | null
): { ok: true; numero: number | null } | { ok: false; error: string } {
  const cleaned = String(raw ?? '')
    .trim()
    .replace(/^salida\s*/i, '')
    .trim()
  if (!cleaned) return { ok: true, numero: null }

  const numero = Number(cleaned)
  if (!Number.isInteger(numero) || numero <= 0) {
    return { ok: false, error: 'El número de salida debe ser un entero positivo' }
  }
  return { ok: true, numero }
}

async function syncSalidaNumeroSequence(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
) {
  await tx.$executeRaw`
    SELECT setval(
      pg_get_serial_sequence('"Salida"', 'numero'),
      COALESCE((SELECT MAX(numero) FROM "Salida"), 1),
      true
    )
  `
}

export async function crearSalida(formData: FormData): Promise<ActionResult> {
  try {
    await checkAuth()
    const fechaRaw = String(formData.get('fecha') ?? '')
    const entradaIds = formData.getAll('entradaIds').map((v) => String(v))

    if (!fechaRaw) return { success: false, error: 'La fecha es requerida' }
    if (entradaIds.length === 0) {
      return { success: false, error: 'Selecciona al menos una entrada' }
    }

    const fecha = new Date(fechaRaw + 'T00:00:00')
    if (isNaN(fecha.getTime())) {
      return { success: false, error: 'Fecha inválida' }
    }

    const numeroParsed = parseNumeroSalidaOptional(formData.get('numero'))
    if (!numeroParsed.ok) return { success: false, error: numeroParsed.error }
    const numero = numeroParsed.numero

    if (numero !== null) {
      const exists = await prisma.salida.findUnique({ where: { numero } })
      if (exists) {
        return { success: false, error: `Ya existe la SALIDA ${numero}` }
      }
    }

    const disponibles = await prisma.entrada.findMany({
      where: { id: { in: entradaIds }, estatus: { in: ESTATUS_INVENTARIO } },
      select: { id: true },
    })

    if (disponibles.length !== entradaIds.length) {
      return { success: false, error: 'Una o más entradas ya no están disponibles' }
    }

    await prisma.$transaction(async (tx) => {
      const salida = await tx.salida.create({
        data: {
          fecha,
          ...(numero !== null ? { numero } : {}),
          entradas: { connect: entradaIds.map((id) => ({ id })) },
        },
      })
      if (numero !== null) {
        await syncSalidaNumeroSequence(tx)
      }
      await tx.entrada.updateMany({
        where: { id: { in: entradaIds } },
        data: { estatus: 'Entregado', salidaId: salida.id },
      })
    })

    revalidatePath('/salidas')
    revalidatePath('/entradas')
    revalidatePath('/inventario')
    revalidatePath('/reportes/tacon')
    revalidatePath('/reportes/lena')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear salida'
    return { success: false, error: message }
  }
}

export async function actualizarSalida(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await checkAuth()
    const fechaRaw = String(formData.get('fecha') ?? '')
    const entradaIds = formData.getAll('entradaIds').map((v) => String(v))

    if (!fechaRaw) return { success: false, error: 'La fecha es requerida' }
    if (entradaIds.length === 0) {
      return { success: false, error: 'Selecciona al menos una entrada' }
    }

    const fecha = new Date(fechaRaw + 'T00:00:00')
    if (isNaN(fecha.getTime())) {
      return { success: false, error: 'Fecha inválida' }
    }

    const numeroParsed = parseNumeroSalidaOptional(formData.get('numero'))
    if (!numeroParsed.ok) return { success: false, error: numeroParsed.error }
    const numero = numeroParsed.numero

    await prisma.$transaction(async (tx) => {
      const actual = await tx.salida.findUnique({ where: { id } })
      if (!actual) throw new Error('Salida no encontrada')

      if (numero !== null && numero !== actual.numero) {
        const exists = await tx.salida.findFirst({
          where: { numero, NOT: { id } },
        })
        if (exists) throw new Error(`Ya existe la SALIDA ${numero}`)
      }

      const salida = await tx.salida.update({
        where: { id },
        data: {
          fecha,
          ...(numero !== null && numero !== actual.numero ? { numero } : {}),
        },
      })

      if (numero !== null && numero !== actual.numero) {
        await syncSalidaNumeroSequence(tx)
      }

      // Devolver todas las entradas anteriores a inventario
      await tx.entrada.updateMany({
        where: { salidaId: id },
        data: { estatus: 'EnInventario', salidaId: null },
      })

      // Validar nuevas entradas disponibles
      const disponibles = await tx.entrada.findMany({
        where: { id: { in: entradaIds }, estatus: { in: ESTATUS_INVENTARIO } },
        select: { id: true },
      })

      if (disponibles.length !== entradaIds.length) {
        throw new Error('Una o más entradas ya no están disponibles')
      }

      // Asignar nuevas entradas a la salida
      await tx.entrada.updateMany({
        where: { id: { in: entradaIds } },
        data: { estatus: 'Entregado', salidaId: salida.id },
      })
    })

    revalidatePath('/salidas')
    revalidatePath('/entradas')
    revalidatePath('/inventario')
    revalidatePath('/reportes/tacon')
    revalidatePath('/reportes/lena')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar salida'
    return { success: false, error: message }
  }
}

export async function eliminarSalida(id: string): Promise<ActionResult> {
  try {
    await checkAuth()
    await prisma.$transaction(async (tx) => {
      await tx.entrada.updateMany({
        where: { salidaId: id },
        data: { estatus: 'EnInventario', salidaId: null },
      })
      await tx.salida.delete({ where: { id } })
    })

    revalidatePath('/salidas')
    revalidatePath('/entradas')
    revalidatePath('/inventario')
    revalidatePath('/reportes/tacon')
    revalidatePath('/reportes/lena')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar salida'
    return { success: false, error: message }
  }
}

export async function quitarEntradaDeSalida(
  salidaId: string,
  entradaId: string
): Promise<ActionResult> {
  try {
    await checkAuth()

    await prisma.$transaction(async (tx) => {
      const entrada = await tx.entrada.findFirst({
        where: { id: entradaId, salidaId },
      })
      if (!entrada) throw new Error('El banco no pertenece a esta salida')

      await tx.entrada.update({
        where: { id: entradaId },
        data: { estatus: 'EnInventario', salidaId: null },
      })

      const restantes = await tx.entrada.count({ where: { salidaId } })
      if (restantes === 0) {
        await tx.salida.delete({ where: { id: salidaId } })
      }
    })

    revalidatePath('/salidas')
    revalidatePath('/entradas')
    revalidatePath('/inventario')
    revalidatePath('/reportes/tacon')
    revalidatePath('/reportes/lena')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al quitar banco'
    return { success: false, error: message }
  }
}
