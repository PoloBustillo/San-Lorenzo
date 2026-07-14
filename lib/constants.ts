export const MATERIALES = [
  'TABLILLA',
  'BARROTE',
  'BARROTE C/S',
  'DUELA',
  'TACON',
  'TACON LEÑA',
  'TACON RECUPERABLE',
  'TACON RECUPERACION',
  'LEÑA',
] as const

export type Material = (typeof MATERIALES)[number]

export const MEDIDAS = ['0.7', '0.8', '0.9', '1', '1.1', '1.2', '1.4', '1.5', 'NA'] as const

export type Medida = (typeof MEDIDAS)[number]

export const MEDIDAS_POR_MATERIAL: Record<Material, Medida[]> = {
  TABLILLA: ['0.7', '0.8', '0.9', '1', '1.1', '1.2', '1.4', '1.5'],
  BARROTE: ['0.7', '0.8', '0.9', '1', '1.1', '1.2', '1.4', '1.5'],
  'BARROTE C/S': ['0.7', '0.8', '0.9', '1', '1.1', '1.2', '1.4', '1.5'],
  DUELA: ['NA'],
  TACON: ['NA'],
  'TACON LEÑA': ['NA'],
  'TACON RECUPERABLE': ['NA'],
  'TACON RECUPERACION': ['NA'],
  LEÑA: ['NA'],
}

export function obtenerCodigoProducto(material: string, medida: string): string {
  return `${material}${medida}`
}

export const MATERIALES_TACON = [
  'TACON',
  'TACON RECUPERABLE',
  'TACON RECUPERACION',
]

export const MATERIALES_LENA = ['LEÑA', 'TACON LEÑA']
