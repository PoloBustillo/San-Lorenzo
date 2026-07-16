'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ResponsiveTable } from '@/components/responsive-table'
import { ImageUpload } from '@/components/image-upload'
import { Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  crearMaterial,
  actualizarMaterial,
  toggleMaterial,
  crearMedida,
  actualizarMedida,
  toggleMedida,
} from '@/app/actions/catalogo'

type Material = {
  id: string
  nombre: string
  descripcion: string | null
  categoria: string | null
  imagenUrl: string | null
  sku: string | null
  activo: boolean
}

type Medida = {
  id: string
  nombre: string
  activo: boolean
}

function MaterialDialog({
  open,
  onOpenChange,
  material,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  material?: Material
}) {
  const [isPending, startTransition] = useTransition()
  const [nombre, setNombre] = useState(material?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(material?.descripcion ?? '')
  const [categoria, setCategoria] = useState(material?.categoria ?? '')
  const [imagenUrl, setImagenUrl] = useState<string | null>(material?.imagenUrl ?? null)
  const [sku, setSku] = useState(material?.sku ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        if (material) {
          await actualizarMaterial(material.id, {
            nombre,
            descripcion: descripcion || null,
            categoria: categoria || null,
            imagenUrl: imagenUrl || null,
            sku: sku || null,
          })
          toast.success('Material actualizado')
        } else {
          await crearMaterial({
            nombre,
            descripcion: descripcion || null,
            categoria: categoria || null,
            imagenUrl: imagenUrl || null,
            sku: sku || null,
          })
          toast.success('Material creado')
        }
        onOpenChange(false)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{material ? 'Editar material' : 'Nuevo material'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Auto-generado si está vacío"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoría</Label>
          <Input
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            placeholder="ej: Madera, Tacon, Leña"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Input
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Imagen</Label>
          <ImageUpload value={imagenUrl} onChange={setImagenUrl} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando...' : material ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function MedidaDialog({
  open,
  onOpenChange,
  medida,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  medida?: Medida
}) {
  const [isPending, startTransition] = useTransition()
  const [nombre, setNombre] = useState(medida?.nombre ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        if (medida) {
          await actualizarMedida(medida.id, nombre)
          toast.success('Medida actualizada')
        } else {
          await crearMedida(nombre)
          toast.success('Medida creada')
        }
        onOpenChange(false)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{medida ? 'Editar medida' : 'Nueva medida'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="ej: 0.9, 1.2, NA"
            required
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando...' : medida ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CatalogoClient({
  materiales: initialMateriales,
  medidas: initialMedidas,
}: {
  materiales: Material[]
  medidas: Medida[]
}) {
  const [materiales] = useState(initialMateriales)
  const [medidas] = useState(initialMedidas)
  const [matDialogOpen, setMatDialogOpen] = useState(false)
  const [medDialogOpen, setMedDialogOpen] = useState(false)
  const [editingMat, setEditingMat] = useState<Material | undefined>()
  const [editingMed, setEditingMed] = useState<Medida | undefined>()
  const [isPending, startTransition] = useTransition()
  const [matFilter, setMatFilter] = useState('')
  const [medFilter, setMedFilter] = useState('')

  const filteredMateriales = materiales.filter((m) =>
    m.nombre.toLowerCase().includes(matFilter.toLowerCase())
  )
  const filteredMedidas = medidas.filter((m) =>
    m.nombre.toLowerCase().includes(medFilter.toLowerCase())
  )

  function handleToggleMaterial(id: string) {
    startTransition(async () => {
      try {
        await toggleMaterial(id)
        toast.success('Material actualizado')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error')
      }
    })
  }

  function handleToggleMedida(id: string) {
    startTransition(async () => {
      try {
        await toggleMedida(id)
        toast.success('Medida actualizada')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error')
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Materiales</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar..."
              value={matFilter}
              onChange={(e) => setMatFilter(e.target.value)}
              className="w-40"
            />
            <Button
              size="sm"
              onClick={() => {
                setEditingMat(undefined)
                setMatDialogOpen(true)
              }}
            >
              <Plus className="mr-1 h-3 w-3" />
              Nuevo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveTable>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-24 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMateriales.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No hay materiales.
                    </TableCell>
                  </TableRow>
                )}
                {filteredMateriales.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      {m.imagenUrl ? (
                        <img src={m.imagenUrl} alt="" className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{m.nombre}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {m.sku ?? `${m.nombre}*`}
                    </TableCell>
                    <TableCell>{m.categoria ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={m.activo ? 'default' : 'secondary'}>
                        {m.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditingMat(m)
                            setMatDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleToggleMaterial(m.id)}
                          disabled={isPending}
                        >
                          {m.activo ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ResponsiveTable>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Medidas</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar..."
              value={medFilter}
              onChange={(e) => setMedFilter(e.target.value)}
              className="w-40"
            />
            <Button
              size="sm"
              onClick={() => {
                setEditingMed(undefined)
                setMedDialogOpen(true)
              }}
            >
              <Plus className="mr-1 h-3 w-3" />
              Nueva
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveTable>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-24 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedidas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No hay medidas.
                    </TableCell>
                  </TableRow>
                )}
                {filteredMedidas.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.nombre}</TableCell>
                    <TableCell>
                      <Badge variant={m.activo ? 'default' : 'secondary'}>
                        {m.activo ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditingMed(m)
                            setMedDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleToggleMedida(m.id)}
                          disabled={isPending}
                        >
                          {m.activo ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ResponsiveTable>
        </CardContent>
      </Card>

      <MaterialDialog
        key={editingMat?.id ?? 'new-material'}
        open={matDialogOpen}
        onOpenChange={setMatDialogOpen}
        material={editingMat}
      />
      <MedidaDialog
        key={editingMed?.id ?? 'new-medida'}
        open={medDialogOpen}
        onOpenChange={setMedDialogOpen}
        medida={editingMed}
      />
    </div>
  )
}
