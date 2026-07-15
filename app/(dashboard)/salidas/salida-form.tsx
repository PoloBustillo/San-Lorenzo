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
  DialogFooter,
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
import { toast } from 'sonner'

type EntradaDisponible = Awaited<ReturnType<typeof obtenerEntradasDisponibles>>[number]

type SalidaEdit = {
  id: string
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

  async function handleSubmit(formData: FormData) {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ?? <Button>{isEditing ? 'Editar' : 'Nueva salida'}</Button>} />
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar salida' : 'Nueva salida'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica la fecha y los bancos de la salida.'
                : 'Selecciona las entradas en inventario que se entregarán.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fecha-salida">Fecha</Label>
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buscar">Buscar</Label>
              <Input
                id="buscar"
                placeholder="Banco, material o proveedor"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
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
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
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
            </div>

            <p className="text-sm text-muted-foreground">
              Seleccionados: {selected.size} bancos — {pesoTotal.toFixed(2)} KG
            </p>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending || selected.size === 0}
            >
              {isPending ? 'Guardando...' : isEditing ? 'Actualizar salida' : 'Guardar salida'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
