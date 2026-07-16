'use client'

import { useEffect, useState, useTransition } from 'react'
import { crearSalida, actualizarSalida, obtenerEntradasDisponibles } from '@/app/actions/inventario'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ResponsiveTable } from '@/components/responsive-table'
import { toast } from 'sonner'
import { CheckSquare, Square } from 'lucide-react'

type EntradaDisponible = Awaited<ReturnType<typeof obtenerEntradasDisponibles>>[number]

type SalidaEdit = {
  id: string
  numero: number
  fecha: Date
  entradas: { id: string; banco: string; material: string; medida: string; pesoKg: number; proveedor: { nombre: string } }[]
}

export function SalidaForm({ salida, trigger }: { salida?: SalidaEdit; trigger?: React.ReactElement }) {
  const [open, setOpen] = useState(false)
  const [entradas, setEntradas] = useState<EntradaDisponible[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()
  const isEditing = Boolean(salida)

  useEffect(() => {
    if (!open) return
    obtenerEntradasDisponibles()
      .then((data) => {
        setEntradas(data)
        if (salida) {
          const seleccionadas = new Set(salida.entradas.map((e) => e.id))
          setSelected(seleccionadas)
        } else {
          setSelected(new Set())
        }
        setSearch('')
      })
      .catch(() => toast.error('Error al cargar entradas disponibles'))
  }, [open, salida])

  const todasLasEntradas = isEditing
    ? [
        ...entradas,
        ...salida!.entradas.filter((se) => !entradas.some((e) => e.id === se.id)),
      ]
    : entradas

  const filtered = todasLasEntradas.filter(
    (e) =>
      e.banco.toLowerCase().includes(search.toLowerCase()) ||
      e.material.toLowerCase().includes(search.toLowerCase()) ||
      e.proveedor.nombre.toLowerCase().includes(search.toLowerCase())
  )

  function toggle(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  function selectAll() {
    setSelected(new Set(filtered.map((e) => e.id)))
  }

  function clearSelection() {
    setSelected(new Set())
  }

  function handleSubmit() {
    if (selected.size === 0) return
    const formData = new FormData()
    formData.set('fecha', (document.getElementById('fecha-salida') as HTMLInputElement).value)
    const numeroInput = document.getElementById('numero-salida') as HTMLInputElement
    if (numeroInput?.value) formData.set('numero', numeroInput.value)
    selected.forEach((id) => formData.append('entradaIds', id))

    startTransition(async () => {
      const result = isEditing
        ? await actualizarSalida(salida!.id, formData)
        : await crearSalida(formData)
      if (result.success) {
        toast.success(isEditing ? 'Salida actualizada' : 'Salida registrada')
        setOpen(false)
      } else {
        toast.error(result.error || 'Error al guardar salida')
      }
    })
  }

  const pesoTotal = todasLasEntradas
    .filter((e) => selected.has(e.id))
    .reduce((sum, e) => sum + e.pesoKg, 0)

  const allFilteredSelected = filtered.length > 0 && filtered.every((e) => selected.has(e.id))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ?? <Button>{isEditing ? 'Editar' : 'Nueva salida'}</Button>} />
      <DialogContent className="fixed inset-0 top-0 left-0 h-[100dvh] w-screen max-h-none max-w-none translate-x-0 translate-y-0 rounded-none border-0 p-0 sm:max-w-none flex flex-col">
        {/* Fixed header */}
        <div className="shrink-0 border-b px-4 py-3 sm:px-6">
          <DialogHeader className="mb-0">
            <DialogTitle>{isEditing ? 'Editar salida' : 'Nueva salida'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica el numero, la fecha y los bancos de la salida.'
                : 'Selecciona las entradas en inventario que se entregaran.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Fixed form fields */}
        <div className="shrink-0 space-y-3 border-b px-4 py-3 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="numero-salida" className="text-xs">Numero de salida (opcional)</Label>
              <Input
                id="numero-salida"
                name="numero"
                type="number"
                min="1"
                step="1"
                placeholder="Automatico si se deja vacio"
                defaultValue={salida?.numero ?? ''}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fecha-salida" className="text-xs">Fecha</Label>
              <Input
                id="fecha-salida"
                name="fecha"
                type="date"
                defaultValue={
                  salida
                    ? salida.fecha.toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0]
                }
                required
                className="h-9"
              />
            </div>
          </div>

          {/* Search + select all */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar banco, material o proveedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 h-9"
              onClick={allFilteredSelected ? clearSelection : selectAll}
            >
              {allFilteredSelected ? 'Limpiar' : `Seleccionar (${filtered.length})`}
            </Button>
          </div>
        </div>

        {/* Scrollable table */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6">
          <ResponsiveTable>
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead className="w-10">
                    <button
                      type="button"
                      onClick={allFilteredSelected ? clearSelection : selectAll}
                      className="cursor-pointer"
                    >
                      {allFilteredSelected ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Banco</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Medida</TableHead>
                  <TableHead>Peso KG</TableHead>
                  <TableHead>Proveedor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No hay entradas disponibles.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((e) => (
                  <TableRow
                    key={e.id}
                    onClick={() => toggle(e.id)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.has(e.id)}
                        onChange={() => toggle(e.id)}
                        className="size-4"
                      />
                    </TableCell>
                    <TableCell>{e.banco}</TableCell>
                    <TableCell>{e.material}</TableCell>
                    <TableCell>{e.medida}</TableCell>
                    <TableCell>{e.pesoKg.toFixed(2)}</TableCell>
                    <TableCell>{e.proveedor.nombre}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ResponsiveTable>
        </div>

        {/* Fixed bottom bar — always visible */}
        <div className="shrink-0 border-t bg-background px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{selected.size}</span> bancos seleccionados
              {' '}&mdash;{' '}
              <span className="font-medium text-foreground">{pesoTotal.toFixed(2)} KG</span>
            </div>
            <div className="flex items-center gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending || selected.size === 0}
                className="flex-1 sm:flex-none"
              >
                {isPending ? 'Guardando...' : isEditing ? 'Actualizar salida' : 'Guardar salida'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
