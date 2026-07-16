'use client'

import { useState, useTransition, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  Package,
  ArrowRight,
  Plus,
  GripVertical,
  Trash2,
  Search,
  Loader2,
} from 'lucide-react'
import {
  moverBancoASalida,
  moverBancoEntreSalidas,
  quitarEntradaDeSalida,
  crearSalidaRapida,
  obtenerArmado,
  type ArmadoData,
} from '@/app/actions/inventario'
import { obtenerCodigoProducto } from '@/lib/constants'

type Entrada = ArmadoData['disponibles'][number]
type Salida = ArmadoData['salidas'][number]
type BancoGroup = {
  key: string
  material: string
  medida: string
  bancos: Entrada[]
  totalKg: number
}

function DraggableBanco({ banco }: { banco: Entrada }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `banco-${banco.id}`,
    data: { type: 'banco', banco },
  })

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2 rounded-md border bg-card p-2 text-sm cursor-grab active:cursor-grabbing select-none transition-shadow ${
        isDragging ? 'opacity-40 shadow-lg z-50' : 'hover:bg-accent/50'
      }`}
    >
      <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="font-medium truncate">{banco.banco}</div>
        <div className="text-xs text-muted-foreground truncate">
          {banco.material} · {banco.medida} · {banco.pesoKg.toFixed(2)} KG
        </div>
      </div>
    </div>
  )
}

function SalidaColumn({
  salida,
  onRemove,
  isPending,
}: {
  salida: Salida
  onRemove: (entradaId: string) => void
  isPending: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `salida-${salida.id}`,
    data: { type: 'salida', salidaId: salida.id },
  })

  const pesoTotal = salida.entradas.reduce((sum, e) => sum + e.pesoKg, 0)

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border-2 transition-all ${
        isOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border'
      }`}
    >
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">SALIDA {salida.numero}</span>
          <Badge variant="secondary" className="text-[10px]">
            {salida.entradas.length} · {pesoTotal.toFixed(2)} KG
          </Badge>
        </div>
      </div>
      <div className="min-h-[60px] p-2 space-y-1">
        {salida.entradas.length === 0 && (
          <p className="py-3 text-center text-xs text-muted-foreground">
            Arrastra bancos aquí
          </p>
        )}
        {salida.entradas.map((e) => (
          <div
            key={e.id}
            className="flex items-center gap-2 rounded-md border bg-card p-1.5 text-xs"
          >
            <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{e.banco}</div>
              <div className="text-muted-foreground truncate">
                {e.material} · {e.pesoKg.toFixed(2)} KG
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0"
              disabled={isPending}
              onClick={() => onRemove(e.id)}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

function NewSalidaDropZone({ isPending }: { isPending: boolean }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'new-salida',
    data: { type: 'new-salida' },
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all ${
        isOver
          ? 'border-primary bg-primary/5 scale-[1.02]'
          : 'border-muted-foreground/30'
      }`}
    >
      {isPending ? (
        <Loader2 className="mb-2 h-6 w-6 text-muted-foreground animate-spin" />
      ) : (
        <Plus className="mb-2 h-6 w-6 text-muted-foreground" />
      )}
      <p className="text-sm text-muted-foreground text-center">
        {isOver
          ? 'Suelta para crear nueva salida'
          : 'Arrastra bancos aquí para crear nueva salida'}
      </p>
    </div>
  )
}

function BancoOverlay({ banco }: { banco: Entrada }) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-card p-2 text-sm shadow-2xl opacity-95 max-w-[250px] ring-2 ring-primary/20">
      <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="font-medium truncate">{banco.banco}</div>
        <div className="text-xs text-muted-foreground truncate">
          {banco.material} · {banco.pesoKg.toFixed(2)} KG
        </div>
      </div>
    </div>
  )
}

interface ArmadoDndProps {
  initialData: ArmadoData
}

export function ArmadoDnd({ initialData }: ArmadoDndProps) {
  const [disponibles, setDisponibles] = useState<Entrada[]>(initialData.disponibles)
  const [salidas, setSalidas] = useState<Salida[]>(initialData.salidas)
  const [search, setSearch] = useState('')
  const [activeBanco, setActiveBanco] = useState<Entrada | null>(null)
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const refreshData = useCallback(async () => {
    const data = await obtenerArmado()
    setDisponibles(data.disponibles)
    setSalidas(data.salidas)
  }, [])

  const grupos: BancoGroup[] = disponibles
    .reduce((acc, e) => {
      const key = obtenerCodigoProducto(e.material, e.medida)
      const existing = acc.find((g) => g.key === key)
      if (existing) {
        existing.bancos.push(e)
        existing.totalKg += e.pesoKg
      } else {
        acc.push({ key, material: e.material, medida: e.medida, bancos: [e], totalKg: e.pesoKg })
      }
      return acc
    }, [] as BancoGroup[])
    .map((g) => ({
      ...g,
      bancos: g.bancos.filter(
        (b) =>
          b.banco.toLowerCase().includes(search.toLowerCase()) ||
          b.material.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((g) => g.bancos.length > 0)

  const filteredSalidas = salidas.filter((s) =>
    search === '' ||
    s.numero.toString().includes(search) ||
    s.entradas.some(
      (e) =>
        e.banco.toLowerCase().includes(search.toLowerCase()) ||
        e.material.toLowerCase().includes(search.toLowerCase())
    )
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const data = active.data.current
    if (data?.type === 'banco') {
      setActiveBanco(data.banco)
    }
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveBanco(null)
      const { active, over } = event
      if (!over) return

      const bancoData = active.data.current
      const targetData = over.data.current
      if (!bancoData || bancoData.type !== 'banco' || !targetData) return

      const banco: Entrada = bancoData.banco
      const bancoSalidaId = salidas.find((s) =>
        s.entradas.some((e) => e.id === banco.id)
      )?.id

      startTransition(async () => {
        if (targetData.type === 'salida' && targetData.salidaId) {
          if (bancoSalidaId === targetData.salidaId) return
          let result
          if (bancoSalidaId) {
            result = await moverBancoEntreSalidas(banco.id, bancoSalidaId, targetData.salidaId)
          } else {
            result = await moverBancoASalida(banco.id, targetData.salidaId)
          }
          if (result.success) {
            toast.success('Banco movido')
            await refreshData()
          } else {
            toast.error(result.error || 'Error al mover banco')
          }
        } else if (targetData.type === 'new-salida' && !bancoSalidaId) {
          const result = await crearSalidaRapida([banco.id])
          if (result.success) {
            toast.success('Salida creada')
            await refreshData()
          } else {
            toast.error(result.error || 'Error al crear salida')
          }
        }
      })
    },
    [salidas, refreshData]
  )

  const handleRemove = useCallback(
    (salidaId: string, entradaId: string) => {
      startTransition(async () => {
        const result = await quitarEntradaDeSalida(salidaId, entradaId)
        if (result.success) {
          toast.success('Banco regresado a inventario')
          await refreshData()
        } else {
          toast.error(result.error || 'Error al quitar banco')
        }
      })
    },
    [refreshData]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* Left: Available bancos */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Bancos disponibles
                <Badge variant="secondary">{disponibles.length}</Badge>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-8 w-48"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
            {grupos.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {disponibles.length === 0
                  ? 'No hay bancos disponibles.'
                  : 'Sin resultados.'}
              </p>
            )}
            {grupos.map((grupo) => (
              <div key={grupo.key} className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground sticky top-0 bg-card py-1 z-10">
                  <span>{grupo.key}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {grupo.bancos.length} · {grupo.totalKg.toFixed(2)} KG
                  </Badge>
                </div>
                <div className="space-y-1">
                  {grupo.bancos.map((banco) => (
                    <DraggableBanco key={banco.id} banco={banco} />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right: Salidas */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowRight className="h-4 w-4" />
            <span>Arrastra bancos a una salida</span>
            <Badge variant="secondary" className="ml-auto">
              {filteredSalidas.length} salidas
            </Badge>
          </div>
          <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto">
            {filteredSalidas.map((salida) => (
              <SalidaColumn
                key={salida.id}
                salida={salida}
                onRemove={(entradaId) => handleRemove(salida.id, entradaId)}
                isPending={isPending}
              />
            ))}
          </div>
          <NewSalidaDropZone isPending={isPending} />
        </div>
      </div>

      <DragOverlay>
        {activeBanco ? <BancoOverlay banco={activeBanco} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
