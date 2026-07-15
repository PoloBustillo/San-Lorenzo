'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function ArmadoFilters({
  proveedores,
  materiales,
}: {
  proveedores: { id: string; nombre: string }[]
  materiales: readonly string[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const medidasPorMaterial: Record<string, string[]> = {
    TABLILLA: ['0.7', '0.8', '0.9', '1', '1.1', '1.2', '1.4', '1.5'],
    BARROTE: ['0.7', '0.8', '0.9', '1', '1.1', '1.2', '1.4', '1.5'],
    'BARROTE C/S': ['0.7', '0.8', '0.9', '1', '1.1', '1.2', '1.4', '1.5'],
    DUELA: ['NA'],
    TACON: ['NA'],
    'TACON LEÑA': ['NA'],
    'TACON RECUPERABLE': ['NA'],
    'TACON RECUPERACION': ['NA'],
    LEÑA: ['NA'],
  }

  const material = searchParams.get('material') ?? ''
  const medidas = material ? medidasPorMaterial[material] ?? [] : []

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key === 'material') {
      params.delete('medida')
    }
    router.push(`?${params.toString()}`)
  }

  function clearFilters() {
    router.push('?')
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-2">
        <Label htmlFor="proveedor">Origen</Label>
        <Select
          value={searchParams.get('proveedor') ?? ''}
          onValueChange={(value) => updateParam('proveedor', value ?? '')}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos">
              {(value: string | null) =>
                value
                  ? proveedores.find((p) => p.id === value)?.nombre ?? 'Todos'
                  : 'Todos'
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {proveedores.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="material">Material</Label>
        <Select
          value={material}
          onValueChange={(value) => updateParam('material', value ?? '')}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {materiales.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="medida">Medida</Label>
        <Select
          value={searchParams.get('medida') ?? ''}
          onValueChange={(value) => updateParam('medida', value ?? '')}
          disabled={!material}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            {medidas.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" onClick={clearFilters}>
        Limpiar
      </Button>
    </div>
  )
}
