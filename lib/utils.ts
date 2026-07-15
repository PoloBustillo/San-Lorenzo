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
