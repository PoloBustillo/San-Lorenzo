import { auth } from '@/auth'
import { Role } from '@prisma/client'

export async function checkAuth() {
  const session = await auth()
  if (!session) throw new Error('No autorizado')
  return session
}

export async function checkAdmin() {
  const session = await auth()
  if (!session) throw new Error('No autorizado')
  if (session.user.role !== Role.ADMIN) throw new Error('Solo administradores')
  return session
}
