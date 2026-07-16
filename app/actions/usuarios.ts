'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { checkAdmin } from '@/lib/auth-helpers'
import { crearUsuarioSchema, actualizarUsuarioSchema } from '@/lib/schemas/usuario'
import type { ActionResult } from '@/lib/types'

export async function crearUsuario(formData: FormData): Promise<ActionResult> {
  try {
    await checkAdmin()

    const parsed = crearUsuarioSchema.safeParse({
      email: formData.get('email'),
      name: formData.get('name'),
      password: formData.get('password'),
      role: formData.get('role'),
    })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const hashed = await bcrypt.hash(parsed.data.password, 10)

    await prisma.user.create({
      data: { ...parsed.data, password: hashed },
    })

    revalidatePath('/usuarios')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear usuario'
    if (message.includes('Unique constraint')) {
      return { success: false, error: 'Ya existe un usuario con ese correo' }
    }
    return { success: false, error: message }
  }
}

export async function eliminarUsuario(id: string): Promise<ActionResult> {
  try {
    await checkAdmin()

    const session = await import('@/auth').then((m) => m.auth())
    if (session?.user.id === id) {
      return { success: false, error: 'No puedes eliminar tu propio usuario' }
    }

    await prisma.user.delete({ where: { id } })
    revalidatePath('/usuarios')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar usuario'
    return { success: false, error: message }
  }
}

export async function actualizarUsuario(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await checkAdmin()

    const parsed = actualizarUsuarioSchema.safeParse({
      name: formData.get('name'),
      role: formData.get('role'),
      password: formData.get('password'),
    })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const { password, ...rest } = parsed.data
    const data: { name?: string; role?: import('@prisma/client').Role; password?: string } = rest

    if (password) {
      data.password = await bcrypt.hash(password, 10)
    }

    await prisma.user.update({ where: { id }, data })
    revalidatePath('/usuarios')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar usuario'
    return { success: false, error: message }
  }
}
