import { z } from 'zod'
import { MATERIALES, MEDIDAS_POR_MATERIAL } from '@/lib/constants'

export const crearEntradaSchema = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
  proveedorId: z.string().min(1, 'El proveedor es requerido'),
  banco: z.string().min(1, 'El banco es requerido').trim(),
  material: z.string().min(1, 'Material inválido'),
  medida: z.string().min(1, 'La medida es requerida'),
  pesoKg: z.coerce.number({ error: 'Peso inválido' }).positive('El peso debe ser mayor a 0'),
}).refine(
  (data) => {
    if (!(MATERIALES as readonly string[]).includes(data.material)) return false
    const medidasPermitidas = MEDIDAS_POR_MATERIAL[data.material as keyof typeof MEDIDAS_POR_MATERIAL]
    if (!medidasPermitidas) return false
    return (medidasPermitidas as readonly string[]).includes(data.medida)
  },
  { message: 'Material o medida inválida', path: ['material'] }
)

export type CrearEntradaInput = z.infer<typeof crearEntradaSchema>

export const actualizarEntradaSchema = crearEntradaSchema
