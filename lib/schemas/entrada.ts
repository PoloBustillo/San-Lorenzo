import { z } from 'zod'

export const crearEntradaSchema = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
  proveedorId: z.string().min(1, 'El proveedor es requerido'),
  banco: z.string().min(1, 'El banco es requerido').trim(),
  material: z.string().min(1, 'Material inválido'),
  medida: z.string().min(1, 'La medida es requerida'),
  pesoKg: z.coerce.number({ error: 'Peso inválido' }).positive('El peso debe ser mayor a 0'),
})

export type CrearEntradaInput = z.infer<typeof crearEntradaSchema>

export const actualizarEntradaSchema = crearEntradaSchema
