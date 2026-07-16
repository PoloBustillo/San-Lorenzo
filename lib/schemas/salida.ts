import { z } from 'zod'

export const crearSalidaSchema = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
  numero: z.string().optional(),
  entradaIds: z.array(z.string()).min(1, 'Selecciona al menos una entrada'),
})

export type CrearSalidaInput = z.infer<typeof crearSalidaSchema>

export const actualizarSalidaSchema = crearSalidaSchema
