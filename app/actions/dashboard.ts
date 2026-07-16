'use server'

import { prisma } from '@/lib/prisma'
import { ESTATUS_INVENTARIO } from '@/lib/utils'
import { checkAuth } from '@/lib/auth-helpers'

export async function obtenerDatosDashboard() {
  await checkAuth()

  const now = new Date()
  const hace30Dias = new Date(now)
  hace30Dias.setDate(hace30Dias.getDate() - 30)

  const [
    totalEntradas,
    totalSalidas,
    enInventario,
    totalProveedores,
    entradasRecientes,
    salidasRecientes,
    entradasPorMaterial,
    entradasUltimos30,
    salidasUltimos30,
    umbrales,
    inventarioPorMaterial,
  ] = await Promise.all([
    prisma.entrada.count(),
    prisma.salida.count(),
    prisma.entrada.count({ where: { estatus: { in: ESTATUS_INVENTARIO } } }),
    prisma.proveedor.count(),
    prisma.entrada.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { proveedor: true },
    }),
    prisma.salida.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { entradas: true },
    }),
    prisma.entrada.groupBy({
      by: ['material'],
      where: { estatus: { in: ESTATUS_INVENTARIO } },
      _count: { id: true },
      _sum: { pesoKg: true },
    }),
    prisma.entrada.findMany({
      where: { fecha: { gte: hace30Dias } },
      select: { fecha: true, pesoKg: true },
    }),
    prisma.salida.findMany({
      where: { fecha: { gte: hace30Dias } },
      include: { entradas: { select: { pesoKg: true } } },
    }),
    prisma.umbralMaterial.findMany(),
    prisma.entrada.groupBy({
      by: ['material'],
      where: { estatus: { in: ESTATUS_INVENTARIO } },
      _count: { id: true },
      _sum: { pesoKg: true },
    }),
  ])

  const umbralesMap = new Map(umbrales.map((u) => [u.material, u]))
  const alertas = inventarioPorMaterial.flatMap((inv) => {
    const umbral = umbralesMap.get(inv.material)
    if (!umbral) return []

    const bancos = inv._count.id
    const kg = inv._sum.pesoKg ?? 0
    const issues: { material: string; mensaje: string; tipo: 'bancos' | 'kg' }[] = []

    if (umbral.minBancos != null && umbral.minBancos > 0 && bancos < umbral.minBancos) {
      issues.push({
        material: inv.material,
        mensaje: `${inv.material}: ${bancos} bancos (mín. ${umbral.minBancos})`,
        tipo: 'bancos',
      })
    }
    if (umbral.minKg != null && umbral.minKg > 0 && kg < umbral.minKg) {
      issues.push({
        material: inv.material,
        mensaje: `${inv.material}: ${kg.toFixed(2)} KG (mín. ${umbral.minKg})`,
        tipo: 'kg',
      })
    }
    return issues
  })

  const diasMap = new Map<string, { entradas: number; salidas: number }>()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    diasMap.set(key, { entradas: 0, salidas: 0 })
  }

  for (const e of entradasUltimos30) {
    const key = e.fecha.toISOString().split('T')[0]
    const entry = diasMap.get(key)
    if (entry) entry.entradas += e.pesoKg
  }

  for (const s of salidasUltimos30) {
    const key = s.fecha.toISOString().split('T')[0]
    const entry = diasMap.get(key)
    if (entry) {
      entry.salidas += s.entradas.reduce((sum, e) => sum + e.pesoKg, 0)
    }
  }

  const actividadDiaria = Array.from(diasMap.entries()).map(([fecha, data]) => ({
    fecha,
    entradasKg: Math.round(data.entradas * 100) / 100,
    salidasKg: Math.round(data.salidas * 100) / 100,
  }))

  const inventarioMaterial = entradasPorMaterial
    .map((g) => ({
      material: g.material,
      bancos: g._count.id,
      kg: Math.round((g._sum.pesoKg ?? 0) * 100) / 100,
    }))
    .sort((a, b) => b.kg - a.kg)

  return {
    stats: { totalEntradas, totalSalidas, enInventario, totalProveedores },
    actividadDiaria,
    inventarioMaterial,
    alertas,
    actividadReciente: {
      entradas: entradasRecientes.map((e) => ({
        id: e.id,
        banco: e.banco,
        material: e.material,
        pesoKg: e.pesoKg,
        proveedor: e.proveedor.nombre,
        fecha: e.fecha.toISOString(),
      })),
      salidas: salidasRecientes.map((s) => ({
        id: s.id,
        numero: s.numero,
        bancos: s.entradas.length,
        pesoKg: s.entradas.reduce((sum, e) => sum + e.pesoKg, 0),
        fecha: s.fecha.toISOString(),
      })),
    },
  }
}
