'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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
  crearProducto,
  actualizarProducto,
  toggleProducto,
} from '@/app/actions/catalogo'

type Producto = {
  id: string
  nombre: string
  medida: string
  codigo: string
  descripcion: string | null
  categoria: string | null
  imagenUrl: string | null
  sku: string | null
  activo: boolean
}

function ProductoDialog({
  open,
  onOpenChange,
  producto,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  producto?: Producto
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const [nombre, setNombre] = useState(producto?.nombre ?? '')
  const [medida, setMedida] = useState(producto?.medida ?? '')
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? '')
  const [categoria, setCategoria] = useState(producto?.categoria ?? '')
  const [imagenUrl, setImagenUrl] = useState<string | null>(producto?.imagenUrl ?? null)
  const [sku, setSku] = useState(producto?.sku ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        if (producto) {
          await actualizarProducto(producto.id, {
            nombre,
            medida,
            descripcion: descripcion || null,
            categoria: categoria || null,
            imagenUrl: imagenUrl || null,
            sku: sku || null,
          })
          toast.success('Producto actualizado')
          router.refresh()
        } else {
          await crearProducto({
            nombre,
            medida,
            descripcion: descripcion || null,
            categoria: categoria || null,
            imagenUrl: imagenUrl || null,
            sku: sku || null,
          })
          toast.success('Producto creado')
          router.refresh()
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
          <DialogTitle>{producto ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="nombre">Material *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="ej: TABLILLA, TACON, LENA"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="medida">Medida *</Label>
            <Input
              id="medida"
              value={medida}
              onChange={(e) => setMedida(e.target.value)}
              placeholder="ej: 0.7, 1.2, NA"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Opcional"
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
              {isPending ? 'Guardando...' : producto ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CatalogoClient({
  productos,
}: {
  productos: Producto[]
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Producto | undefined>()
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const [filter, setFilter] = useState('')

  const filtered = productos.filter(
    (p) =>
      p.codigo.toLowerCase().includes(filter.toLowerCase()) ||
      p.nombre.toLowerCase().includes(filter.toLowerCase()) ||
      p.medida.toLowerCase().includes(filter.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(filter.toLowerCase())) ||
      (p.categoria && p.categoria.toLowerCase().includes(filter.toLowerCase()))
  )

  function handleToggle(id: string) {
    startTransition(async () => {
      try {
        await toggleProducto(id)
        router.refresh()
        toast.success('Producto actualizado')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error')
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Productos</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-40"
            />
            <Button
              size="sm"
              onClick={() => {
                setEditing(undefined)
                setDialogOpen(true)
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
                  <TableHead>Código</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Medida</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-24 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No hay productos.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {p.imagenUrl ? (
                        <img src={p.imagenUrl} alt="" className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm font-medium">{p.codigo}</TableCell>
                    <TableCell className="font-medium">{p.nombre}</TableCell>
                    <TableCell>{p.medida}</TableCell>
                    <TableCell className="font-mono text-xs">{p.sku ?? '—'}</TableCell>
                    <TableCell>{p.categoria ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={p.activo ? 'default' : 'secondary'}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditing(p)
                            setDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleToggle(p.id)}
                          disabled={isPending}
                        >
                          {p.activo ? (
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

      <ProductoDialog
        key={editing?.id ?? 'new-producto'}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        producto={editing}
      />
    </div>
  )
}
