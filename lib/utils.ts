import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const ESTATUS_ORDEN = [
  'EnInventario',
  'EnPreparacion',
  'Entregado',
] as const

export type Estatus = (typeof ESTATUS_ORDEN)[number]

export function getEstatusLabel(estatus: string) {
  switch (estatus) {
    case 'EnInventario':
      return 'En inventario'
    case 'EnPreparacion':
      return 'En preparación'
    case 'Entregado':
      return 'Entregado'
    default:
      return estatus
  }
}

export function getEstatusBadgeVariant(
  estatus: string
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (estatus) {
    case 'EnInventario':
      return 'default'
    case 'EnPreparacion':
      return 'outline'
    case 'Entregado':
      return 'secondary'
    default:
      return 'secondary'
  }
}

export const ESTATUS_INVENTARIO: Estatus[] = ['EnInventario', 'EnPreparacion']

export function getWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export function sanitizeBarcodeValue(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}
