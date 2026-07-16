import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Role } from '@prisma/client'
import { obtenerTodosMateriales, obtenerCatalogoMedidas } from '@/app/actions/catalogo'
import { CatalogoClient } from './catalogo-client'

export default async function CatalogoPage() {
  const session = await auth()
  if (session?.user.role !== Role.ADMIN) redirect('/')

  const [materiales, medidas] = await Promise.all([
    obtenerTodosMateriales(),
    obtenerCatalogoMedidas(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Catálogo</h1>
        <p className="text-muted-foreground">Gestiona materiales, medidas y productos.</p>
      </div>
      <CatalogoClient materiales={materiales} medidas={medidas} />
    </div>
  )
}
