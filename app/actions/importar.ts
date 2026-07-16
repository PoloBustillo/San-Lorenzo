'use server'

import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import { MEDIDAS_POR_MATERIAL } from '@/lib/constants'
import { getWeek } from '@/lib/utils'
import { checkAuth } from '@/lib/auth-helpers'
import { revalidateEntradas } from '@/lib/revalidate'
import type { ActionResult } from '@/lib/types'

export type PreviewRow = {
  fecha?: string
  semana?: number
  origen?: string
  banco?: string
  material?: string
  medida?: string
  pesoKg?: number
  valido: boolean
  errores: string[]
}

type NonNullablePreviewRow = PreviewRow & {
  fecha: string
  material: string
  medida: string
  pesoKg: number
  banco: string
}

function parseFecha(value: unknown): Date | null {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value
  if (typeof value === 'number') {
    // Fechas de Excel son números serializados
    const date = XLSX.SSF.parse_date_code(value)
    if (!date) return null
    return new Date(Date.UTC(date.y, date.m - 1, date.d))
  }
  if (typeof value === 'string') {
    const parsed = new Date(value)
    return isNaN(parsed.getTime()) ? null : parsed
  }
  return null
}

function normalizeMaterial(value: string): string | null {
  return value.toUpperCase().trim() || null
}

function normalizeMedida(material: string, value: string): string | null {
  const upper = value.toUpperCase().trim()
  const permitidas = MEDIDAS_POR_MATERIAL[material as keyof typeof MEDIDAS_POR_MATERIAL]
  if (!permitidas) return null
  const medida = (permitidas as readonly string[]).find((m) => m === upper || m === value.trim())
  return medida || null
}

export async function previewExcel(formData: FormData): Promise<ActionResult<PreviewRow[]>> {
  try {
    await checkAuth()

    const file = formData.get('file') as File | null
    if (!file) return { success: false, error: 'No se recibió archivo' }

    const bytes = await file.arrayBuffer()
    const workbook = XLSX.read(bytes, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][]

    if (json.length < 2) {
      return { success: false, error: 'El archivo no tiene datos' }
    }

    const headers = (json[0] as unknown[]).map((h) => String(h).toLowerCase().trim())
    const rows = json.slice(1)

    const idxFecha = headers.findIndex((h) => h.includes('fecha'))
    const idxSemana = headers.findIndex((h) => h.includes('semana'))
    const idxOrigen = headers.findIndex((h) => h.includes('origen') || h.includes('proveedor') || h.includes('cliente'))
    const idxBanco = headers.findIndex((h) => h.includes('banco') || h.includes('folio') || h.includes('lote'))
    const idxMaterial = headers.findIndex((h) => h.includes('material') || h.includes('tipo'))
    const idxMedida = headers.findIndex((h) => h.includes('medida') || h.includes('grosor'))
    const idxPeso = headers.findIndex((h) => h.includes('peso') || h.includes('kg') || h.includes('kilos'))

    const preview: PreviewRow[] = rows.map((row) => {
      const fecha = parseFecha(row[idxFecha])
      const pesoRaw = row[idxPeso]
      const pesoKg = typeof pesoRaw === 'number' ? pesoRaw : parseFloat(String(pesoRaw).replace(/,/g, ''))
      const materialRaw = String(row[idxMaterial] ?? '')
      const material = normalizeMaterial(materialRaw) || undefined
      const medidaRaw = String(row[idxMedida] ?? '')
      const medida = material ? normalizeMedida(material, medidaRaw) || undefined : undefined
      const semanaRaw = row[idxSemana]
      const semanaNum =
        typeof semanaRaw === 'number'
          ? semanaRaw
          : parseInt(String(semanaRaw).trim(), 10)
      const semana = isNaN(semanaNum) ? undefined : semanaNum

      const errores: string[] = []
      if (!fecha) errores.push('Fecha inválida')
      if (!material) errores.push(`Material inválido: ${materialRaw}`)
      if (material && !medida) errores.push(`Medida inválida para ${material}: ${medidaRaw}`)
      if (isNaN(pesoKg) || pesoKg <= 0) errores.push('Peso inválido')

      return {
        fecha: fecha?.toISOString().split('T')[0],
        semana: semana ?? (fecha ? getWeek(fecha) : undefined),
        origen: String(row[idxOrigen] ?? '').trim() || undefined,
        banco: String(row[idxBanco] ?? '').trim() || undefined,
        material,
        medida,
        pesoKg,
        valido: errores.length === 0,
        errores,
      }
    })

    return { success: true, data: preview }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al procesar Excel'
    return { success: false, error: message }
  }
}

export async function importarEntradas(rows: PreviewRow[]): Promise<ActionResult<{ creadas: number; errores: string[] }>> {
  try {
    await checkAuth()

    const validas = rows.filter(
      (r): r is NonNullablePreviewRow =>
        r.valido && Boolean(r.fecha) && Boolean(r.material) && Boolean(r.medida) && Boolean(r.pesoKg) && Boolean(r.banco)
    )
    if (validas.length === 0) {
      return { success: false, error: 'No hay filas válidas para importar' }
    }

    // Buscar o crear proveedores
    const nombresProveedores = Array.from(new Set(validas.map((r) => r.origen).filter(Boolean)))
    const proveedoresExistentes = await prisma.proveedor.findMany({
      where: { nombre: { in: nombresProveedores as string[] } },
    })

    const proveedorMap = new Map(proveedoresExistentes.map((p) => [p.nombre, p.id]))

    for (const nombre of nombresProveedores) {
      if (!proveedorMap.has(nombre as string)) {
        const creado = await prisma.proveedor.create({
          data: { nombre: nombre as string, tipo: 'PROVEEDOR' },
        })
        proveedorMap.set(creado.nombre, creado.id)
      }
    }

    const defaultProveedorId = proveedorMap.values().next().value as string

    const creadas = await prisma.$transaction(async (tx) => {
      for (const row of validas) {
        const fecha = new Date(row.fecha + 'T00:00:00')
        await tx.entrada.create({
          data: {
            fecha,
            semana: row.semana ?? getWeek(fecha),
            proveedorId: row.origen ? proveedorMap.get(row.origen)! : defaultProveedorId,
            banco: row.banco,
            material: row.material,
            medida: row.medida,
            pesoKg: row.pesoKg,
          },
        })
      }
      return validas.length
    })

    revalidateEntradas()

    return {
      success: true,
      data: {
        creadas,
        errores: rows.filter((r) => !r.valido).map((r) => `${r.banco || 'sin banco'}: ${r.errores.join(', ')}`),
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al importar'
    return { success: false, error: message }
  }
}
