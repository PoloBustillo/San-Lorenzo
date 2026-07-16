'use client'

import { useTransition } from 'react'
import { actualizarConfiguracion } from '@/app/actions/configuracion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const CAMPOS = [
  { clave: 'EMPRESA_NOMBRE', label: 'Nombre de la empresa', type: 'text' },
  { clave: 'EMPRESA_DIRECCION', label: 'Dirección', type: 'text' },
  { clave: 'EMPRESA_TELEFONO', label: 'Teléfono', type: 'text' },
  { clave: 'EMPRESA_RFC', label: 'RFC', type: 'text' },
  { clave: 'EMPRESA_LOGO', label: 'URL del logo (opcional)', type: 'text' },
  { clave: 'IVA_PORCENTAJE', label: 'IVA (%)', type: 'number' },
] as const

export function ConfigEmpresaForm({ config }: { config: Record<string, string> }) {
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const updates = CAMPOS.map(async (campo) => {
        const valor = String(formData.get(campo.clave) ?? '').trim()
        return actualizarConfiguracion(campo.clave, valor)
      })

      const results = await Promise.all(updates)
      const failed = results.find((r) => !r.success)

      if (failed) {
        toast.error(failed.error || 'Error al guardar configuración')
      } else {
        toast.success('Configuración guardada')
      }
    })
  }

  return (
    <form action={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      {CAMPOS.map((campo) => (
        <div key={campo.clave} className="space-y-2">
          <Label htmlFor={campo.clave}>{campo.label}</Label>
          <Input
            id={campo.clave}
            name={campo.clave}
            type={campo.type}
            step={campo.type === 'number' ? '0.01' : undefined}
            min={campo.type === 'number' ? '0' : undefined}
            defaultValue={config[campo.clave] ?? ''}
            required={campo.clave !== 'EMPRESA_LOGO'}
          />
        </div>
      ))}
      <div className="flex justify-end sm:col-span-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar datos de empresa'}
        </Button>
      </div>
    </form>
  )
}
