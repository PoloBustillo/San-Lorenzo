import { z } from 'zod'

export const crearProveedorSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').trim(),
  tipo: z.enum(['CLIENTE', 'PROVEEDOR'], { error: 'Tipo de proveedor inválido' }),
})

export const actualizarProveedorSchema = crearProveedorSchema
