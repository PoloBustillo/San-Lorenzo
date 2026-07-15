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
import { crearUsuario, actualizarUsuario } from '@/app/actions/usuarios'
import { toast } from 'sonner'

export function UsuarioForm({
  usuario,
  onSuccess,
}: {
  usuario?: { id: string; name: string | null; email: string; role: string }
  onSuccess?: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const isEditing = Boolean(usuario)
  const [role, setRole] = useState(usuario?.role ?? 'OPERADOR')

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEditing
        ? await actualizarUsuario(usuario!.id, formData)
        : await crearUsuario(formData)
      if (result.success) {
        toast.success(isEditing ? 'Usuario actualizado' : 'Usuario creado')
        onSuccess?.()
      } else {
        toast.error(result.error || 'Error al guardar usuario')
      }
    })
  }

  return (
    <form action={handleSubmit} className="grid gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Juan Pérez"
          defaultValue={usuario?.name ?? ''}
        />
      </div>
      {!isEditing && (
        <div className="space-y-2">
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required={!isEditing}
            placeholder="usuario@ejemplo.com"
            defaultValue={usuario?.email}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="password">
          Contraseña {isEditing && '(dejar en blanco para no cambiar)'}
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={6}
          required={!isEditing}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <Select
          name="role"
          value={role}
          onValueChange={(value) => setRole(value ?? 'OPERADOR')}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
            <SelectItem value="OPERADOR">OPERADOR</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : isEditing ? 'Actualizar usuario' : 'Crear usuario'}
        </Button>
      </div>
    </form>
  )
}
