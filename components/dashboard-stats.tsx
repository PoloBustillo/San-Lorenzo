'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
} from 'lucide-react'

const stats = [
  {
    title: 'Entradas',
    key: 'entradas',
    icon: ArrowDownLeft,
    tooltip: 'Total de bancos recibidos de proveedores',
  },
  {
    title: 'Salidas',
    key: 'salidas',
    icon: ArrowUpRight,
    tooltip: 'Total de remisiones de entrega generadas',
  },
  {
    title: 'En inventario',
    key: 'inventario',
    icon: Package,
    tooltip: 'Bancos actualmente disponibles (En inventario + En preparación)',
  },
  {
    title: 'Proveedores',
    key: 'proveedores',
    icon: Users,
    tooltip: 'Proveedores y clientes registrados en el sistema',
  },
] as const

export function DashboardStats({
  values,
}: {
  values: {
    totalEntradas: number
    totalSalidas: number
    enInventario: number
    totalProveedores: number
  }
}) {
  const valueMap = {
    entradas: values.totalEntradas,
    salidas: values.totalSalidas,
    inventario: values.enInventario,
    proveedores: values.totalProveedores,
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <TooltipProvider key={s.key}>
          <Tooltip>
            <TooltipTrigger
              render={
                <Card className="cursor-default hover:bg-accent/50 transition-colors" />
              }
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{valueMap[s.key]}</div>
              </CardContent>
            </TooltipTrigger>
            <TooltipContent>
              <p>{s.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  )
}
