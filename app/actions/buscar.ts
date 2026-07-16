'use server'

import { prisma } from '@/lib/prisma'

export interface SearchResult {
  type: 'entrada' | 'salida' | 'proveedor' | 'inventario'
  title: string
  subtitle: string
  href: string
}

export async function buscarGlobal(query: string): Promise<SearchResult[]> {
  const q = query.trim()
  if (q.length < 2) return []

  const results: SearchResult[] = []

  const [entradas, salidas, proveedores, inventario] = await Promise.all([
    prisma.entrada.findMany({
      where: {
        OR: [
          { banco: { contains: q, mode: 'insensitive' } },
          { material: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: { proveedor: true },
      take: 10,
    }),
    prisma.salida.findMany({
      where: {},
      include: { entradas: true },
      orderBy: { numero: 'desc' },
      take: 10,
    }),
    prisma.proveedor.findMany({
      where: {
        OR: [{ nombre: { contains: q, mode: 'insensitive' } }],
      },
      take: 10,
    }),
    prisma.entrada.findMany({
      where: {
        estatus: { in: ['EnInventario', 'EnPreparacion'] },
        OR: [
          { material: { contains: q, mode: 'insensitive' } },
          { banco: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: { proveedor: true },
      take: 10,
    }),
  ])

  for (const e of entradas) {
    const params = new URLSearchParams({ material: e.material })
    results.push({
      type: 'entrada',
      title: `Entrada: ${e.banco}`,
      subtitle: `${e.material} · ${e.medida} · ${e.pesoKg.toFixed(2)} KG · ${e.proveedor.nombre}`,
      href: `/entradas?${params.toString()}`,
    })
  }

  const qNum = parseInt(q, 10)
  for (const s of salidas) {
    if (!isNaN(qNum) && s.numero !== qNum) continue
    const params = new URLSearchParams()
    if (!isNaN(qNum)) params.set('numero', String(s.numero))
    const href = params.toString() ? `/salidas?${params.toString()}` : '/salidas'
    results.push({
      type: 'salida',
      title: `Salida ${s.numero}`,
      subtitle: `${s.fecha.toISOString().split('T')[0]} · ${s.entradas.length} bancos`,
      href,
    })
  }

  for (const p of proveedores) {
    results.push({
      type: 'proveedor',
      title: p.nombre,
      subtitle: p.tipo,
      href: '/proveedores',
    })
  }

  for (const i of inventario) {
    const params = new URLSearchParams({ material: i.material })
    results.push({
      type: 'inventario',
      title: `Inventario: ${i.banco}`,
      subtitle: `${i.material} · ${i.medida} · ${i.pesoKg.toFixed(2)} KG`,
      href: `/inventario?${params.toString()}`,
    })
  }

  return results.slice(0, 20)
}
