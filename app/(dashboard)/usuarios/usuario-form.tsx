'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { crearUsuario } from '@/app/actions/usuarios'
import { toast } from 'sonner'

export function UsuarioForm() {
  const [isPending, startTransition] = useTransition()
  const [role, setRole] = useState('OPERADOR')

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await crearUsuario(formData)
      if (result.success) {
        toast.success('Usuario creado')
        const form = document.getElementById('usuario-form') as HTMLFormElement
        form?.reset()
        setRole('OPERADOR')
      } else {
        toast.error(result.error || 'Error al crear usuario')
      }
    })
  }

  return (
    <form id="usuario-form" action={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" type="text" placeholder="Juan Pérez" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Correo</Label>
        <Input id="email" name="email" type="email" required placeholder="usuario@ejemplo.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" required minLength={6} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <Select name="role" value={role} onValueChange={(value) => setRole(value ?? 'OPERADOR')} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
            <SelectItem value="OPERADOR">OPERADOR</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Crear usuario'}
        </Button>
      </div>
    </form>
  )
}
