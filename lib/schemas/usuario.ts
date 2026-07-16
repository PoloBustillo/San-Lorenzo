import { z } from 'zod'
import { Role } from '@prisma/client'

export const crearUsuarioSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido').trim().toLowerCase(),
  name: z.string().trim().optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.nativeEnum(Role, { error: 'Rol inválido' }),
})

export const actualizarUsuarioSchema = z.object({
  name: z.string().trim().optional(),
  role: z.nativeEnum(Role, { error: 'Rol inválido' }),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')),
})
