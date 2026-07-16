'use server'

import { prisma } from '@/lib/prisma'
import { ESTATUS_INVENTARIO, getWeek } from '@/lib/utils'
import { checkAuth } from '@/lib/auth-helpers'
import { revalidateEntradas, revalidateSalidas, revalidateAll, revalidateProveedores } from '@/lib/revalidate'
import { crearProveedorSchema, actualizarProveedorSchema } from '@/lib/schemas/proveedor'
import { crearEntradaSchema, actualizarEntradaSchema } from '@/lib/schemas/entrada'
import { crearSalidaSchema } from '@/lib/schemas/salida'
import type { ActionResult } from '@/lib/types'
import { logAudit } from '@/lib/audit'

export async function crearProveedor(formData: FormData): Promise<ActionResult> {
  try {
    const session = await checkAuth()
    const parsed = crearProveedorSchema.safeParse({
      nombre: formData.get('nombre'),
      tipo: formData.get('tipo'),
    })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    await prisma.proveedor.create({ data: parsed.data })
    await logAudit({ userId: session.user.id, action: 'CREAR', entity: 'Proveedor', details: parsed.data })
    revalidateProveedores()
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear proveedor'
    return { success: false, error: message }
  }
}

export async function eliminarProveedor(id: string): Promise<ActionResult> {
  try {
    const session = await checkAuth()
    await prisma.proveedor.delete({ where: { id } })
    await logAudit({ userId: session.user.id, action: 'ELIMINAR', entity: 'Proveedor', entityId: id })
    revalidateProveedores()
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
    const parsed = actualizarProveedorSchema.safeParse({
      nombre: formData.get('nombre'),
      tipo: formData.get('tipo'),
    })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    await prisma.proveedor.update({
      where: { id },
      data: parsed.data,
    })
    revalidateProveedores()
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
    const session = await checkAuth()
    const parsed = crearEntradaSchema.safeParse({
      fecha: formData.get('fecha'),
      proveedorId: formData.get('proveedorId'),
      banco: formData.get('banco'),
      material: formData.get('material'),
      medida: formData.get('medida'),
      pesoKg: formData.get('pesoKg'),
    })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const { fecha: fechaStr, pesoKg, ...rest } = parsed.data
    const fecha = new Date(fechaStr + 'T00:00:00')
    const semana = getWeek(fecha)

    await prisma.entrada.create({
      data: { ...rest, fecha, semana, pesoKg },
    })

    await logAudit({ userId: session.user.id, action: 'CREAR', entity: 'Entrada', details: { banco: rest.banco, material: rest.material } })
    revalidateEntradas()
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear entrada'
    return { success: false, error: message }
  }
}

export async function eliminarEntrada(id: string): Promise<ActionResult> {
  try {
    const session = await checkAuth()
    const entrada = await prisma.entrada.findUnique({ where: { id } })
    if (!entrada) return { success: false, error: 'Entrada no encontrada' }
    if (entrada.estatus === 'Entregado') {
      return { success: false, error: 'No se puede eliminar una entrada entregada' }
    }
    await prisma.entrada.delete({ where: { id } })
    await logAudit({ userId: session.user.id, action: 'ELIMINAR', entity: 'Entrada', entityId: id })
    revalidateEntradas()
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

    const parsed = actualizarEntradaSchema.safeParse({
      fecha: formData.get('fecha'),
      proveedorId: formData.get('proveedorId'),
      banco: formData.get('banco'),
      material: formData.get('material'),
      medida: formData.get('medida'),
      pesoKg: formData.get('pesoKg'),
    })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const { fecha: fechaStr, pesoKg, ...rest } = parsed.data
    const fecha = new Date(fechaStr + 'T00:00:00')
    const semana = getWeek(fecha)

    await prisma.entrada.update({
      where: { id },
      data: { ...rest, fecha, semana, pesoKg },
    })

    revalidateEntradas()
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

    revalidateAll()
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al cambiar estatus'
    return { success: false, error: message }
  }
}

export async function obtenerEntradasDisponibles() {
  await checkAuth()

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
    const session = await checkAuth()
    const entradaIds = formData.getAll('entradaIds').map((v) => String(v))

    const parsed = crearSalidaSchema.safeParse({
      fecha: formData.get('fecha'),
      numero: formData.get('numero'),
      entradaIds,
    })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const fecha = new Date(parsed.data.fecha + 'T00:00:00')

    const numeroParsed = parseNumeroSalidaOptional(parsed.data.numero ?? null)
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

    await logAudit({ userId: session.user.id, action: 'CREAR', entity: 'Salida', details: { entradaIds } })
    revalidateSalidas()
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear salida'
    return { success: false, error: message }
  }
}

export async function actualizarSalida(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await checkAuth()
    const entradaIds = formData.getAll('entradaIds').map((v) => String(v))

    const parsed = crearSalidaSchema.safeParse({
      fecha: formData.get('fecha'),
      numero: formData.get('numero'),
      entradaIds,
    })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const fecha = new Date(parsed.data.fecha + 'T00:00:00')

    const numeroParsed = parseNumeroSalidaOptional(parsed.data.numero ?? null)
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

      await tx.entrada.updateMany({
        where: { salidaId: id },
        data: { estatus: 'EnInventario', salidaId: null },
      })

      const disponibles = await tx.entrada.findMany({
        where: { id: { in: entradaIds }, estatus: { in: ESTATUS_INVENTARIO } },
        select: { id: true },
      })

      if (disponibles.length !== entradaIds.length) {
        throw new Error('Una o más entradas ya no están disponibles')
      }

      await tx.entrada.updateMany({
        where: { id: { in: entradaIds } },
        data: { estatus: 'Entregado', salidaId: salida.id },
      })
    })

    revalidateSalidas()
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar salida'
    return { success: false, error: message }
  }
}

export async function eliminarSalida(id: string): Promise<ActionResult> {
  try {
    const session = await checkAuth()
    await prisma.$transaction(async (tx) => {
      await tx.entrada.updateMany({
        where: { salidaId: id },
        data: { estatus: 'EnInventario', salidaId: null },
      })
      await tx.salida.delete({ where: { id } })
    })

    await logAudit({ userId: session.user.id, action: 'ELIMINAR', entity: 'Salida', entityId: id })
    revalidateSalidas()
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

    revalidateSalidas()
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al quitar banco'
    return { success: false, error: message }
  }
}

export async function moverBancoASalida(
  entradaId: string,
  salidaId: string
): Promise<ActionResult> {
  try {
    const session = await checkAuth()

    await prisma.$transaction(async (tx) => {
      const entrada = await tx.entrada.findUnique({ where: { id: entradaId } })
      if (!entrada) throw new Error('Entrada no encontrada')
      if (!ESTATUS_INVENTARIO.includes(entrada.estatus)) {
        throw new Error('El banco no está disponible')
      }

      await tx.entrada.update({
        where: { id: entradaId },
        data: { estatus: 'Entregado', salidaId },
      })
    })

    await logAudit({ userId: session.user.id, action: 'MOVER', entity: 'Entrada', entityId: entradaId, details: { destino: salidaId } })
    revalidateSalidas()
    revalidateEntradas()
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al mover banco'
    return { success: false, error: message }
  }
}

export async function moverBancoEntreSalidas(
  entradaId: string,
  salidaOrigenId: string,
  salidaDestinoId: string
): Promise<ActionResult> {
  try {
    const session = await checkAuth()

    await prisma.$transaction(async (tx) => {
      const entrada = await tx.entrada.findFirst({
        where: { id: entradaId, salidaId: salidaOrigenId },
      })
      if (!entrada) throw new Error('El banco no pertenece a la salida origen')

      await tx.entrada.update({
        where: { id: entradaId },
        data: { salidaId: salidaDestinoId },
      })

      const restantesOrigen = await tx.entrada.count({ where: { salidaId: salidaOrigenId } })
      if (restantesOrigen === 0) {
        await tx.salida.delete({ where: { id: salidaOrigenId } })
      }
    })

    await logAudit({ userId: session.user.id, action: 'MOVER', entity: 'Entrada', entityId: entradaId, details: { origen: salidaOrigenId, destino: salidaDestinoId } })
    revalidateSalidas()
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al mover banco entre salidas'
    return { success: false, error: message }
  }
}

export async function crearSalidaRapida(
  entradaIds: string[]
): Promise<ActionResult> {
  try {
    const session = await checkAuth()

    if (entradaIds.length === 0) {
      return { success: false, error: 'Selecciona al menos un banco' }
    }

    const disponibles = await prisma.entrada.findMany({
      where: { id: { in: entradaIds }, estatus: { in: ESTATUS_INVENTARIO } },
      select: { id: true },
    })

    if (disponibles.length !== entradaIds.length) {
      return { success: false, error: 'Uno o más bancos ya no están disponibles' }
    }

    const salida = await prisma.$transaction(async (tx) => {
      const s = await tx.salida.create({
        data: {
          entradas: { connect: entradaIds.map((id) => ({ id })) },
        },
      })
      await tx.entrada.updateMany({
        where: { id: { in: entradaIds } },
        data: { estatus: 'Entregado', salidaId: s.id },
      })
      return s
    })

    await logAudit({ userId: session.user.id, action: 'CREAR', entity: 'Salida', entityId: salida.id, details: { entradaIds } })
    revalidateSalidas()
    revalidateEntradas()
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear salida'
    return { success: false, error: message }
  }
}

export type ArmadoData = {
  disponibles: {
    id: string
    banco: string
    material: string
    medida: string
    pesoKg: number
    proveedor: { nombre: string }
  }[]
  salidas: {
    id: string
    numero: number
    fecha: string
    entradas: {
      id: string
      banco: string
      material: string
      medida: string
      pesoKg: number
      proveedor: { nombre: string }
    }[]
  }[]
}

export async function obtenerArmado(): Promise<ArmadoData> {
  await checkAuth()
  const [entradas, salidas] = await Promise.all([
    prisma.entrada.findMany({
      where: { estatus: { in: ESTATUS_INVENTARIO } },
      include: { proveedor: true },
      orderBy: [{ material: 'asc' }, { medida: 'asc' }, { fecha: 'asc' }],
    }),
    prisma.salida.findMany({
      include: {
        entradas: {
          where: { estatus: { in: ['Entregado', 'EnPreparacion'] } },
          include: { proveedor: true },
        },
      },
      orderBy: { numero: 'desc' },
    }),
  ])

  return {
    disponibles: entradas.map((e) => ({
      id: e.id,
      banco: e.banco,
      material: e.material,
      medida: e.medida,
      pesoKg: e.pesoKg,
      proveedor: { nombre: e.proveedor.nombre },
    })),
    salidas: salidas.map((s) => ({
      id: s.id,
      numero: s.numero,
      fecha: s.fecha.toISOString().split('T')[0],
      entradas: s.entradas.map((e) => ({
        id: e.id,
        banco: e.banco,
        material: e.material,
        medida: e.medida,
        pesoKg: e.pesoKg,
        proveedor: { nombre: e.proveedor.nombre },
      })),
    })),
  }
}
