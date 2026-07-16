import { revalidatePath } from 'next/cache'

const ENTRADAS_PATHS = [
  '/entradas',
  '/inventario',
  '/salidas',
  '/reportes/tacon',
  '/reportes/lena',
] as const

const SALIDAS_PATHS = [
  '/salidas',
  '/entradas',
  '/inventario',
  '/reportes/tacon',
  '/reportes/lena',
] as const

export function revalidateEntradas() {
  for (const p of ENTRADAS_PATHS) revalidatePath(p)
}

export function revalidateSalidas() {
  for (const p of SALIDAS_PATHS) revalidatePath(p)
}

export function revalidateAll() {
  revalidateEntradas()
  revalidatePath('/reportes/armado')
}

export function revalidateProveedores() {
  revalidatePath('/proveedores')
}
