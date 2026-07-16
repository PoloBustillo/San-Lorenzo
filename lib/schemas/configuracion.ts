import { z } from 'zod'

export const actualizarConfiguracionSchema = z.object({
  clave: z.string().min(1),
  valor: z.string(),
})

export const actualizarUmbralSchema = z.object({
  material: z.string().min(1),
  minBancos: z.coerce.number().int().min(0).nullable().optional(),
  minKg: z.coerce.number().min(0).nullable().optional(),
  precioPorKg: z.coerce.number().min(0).nullable().optional(),
})
