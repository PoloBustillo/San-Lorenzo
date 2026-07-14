'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

export type ActionResult = { success: boolean; error?: string }

async function checkAdmin() {
  const session = await auth()
  if (!session) throw new Error('No autorizado')
  if (session.user.role !== Role.ADMIN) throw new Error('Solo administradores')
  return session
}

export async function crearUsuario(formData: FormData): Promise<ActionResult> {
  try {
    await checkAdmin()

    const email = String(formData.get('email') ?? '').trim().toLowerCase()
    const name = String(formData.get('name') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const role = String(formData.get('role') ?? '') as Role

    if (!email || !password) {
      return { success: false, error: 'Correo y contraseña son requeridos' }
    }

    if (!Object.values(Role).includes(role)) {
      return { success: false, error: 'Rol inválido' }
    }

    if (password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' }
    }

    const hashed = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: { email, name, password: hashed, role },
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

    const session = await auth()
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

    const name = String(formData.get('name') ?? '').trim()
    const role = String(formData.get('role') ?? '') as Role
    const password = String(formData.get('password') ?? '')

    if (!Object.values(Role).includes(role)) {
      return { success: false, error: 'Rol inválido' }
    }

    const data: { name?: string; role?: Role; password?: string } = { name, role }
    if (password) {
      if (password.length < 6) {
        return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' }
      }
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
