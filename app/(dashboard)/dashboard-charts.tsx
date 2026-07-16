'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardChart({
  data,
}: {
  data: { fecha: string; entradasKg: number; salidasKg: number }[]
}) {
  const maxVal = Math.max(...data.flatMap((d) => [d.entradasKg, d.salidasKg]), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimiento últimos 30 días (KG)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-48 items-end gap-0.5 overflow-x-auto pb-2">
          {data.map((d) => {
            const entHeight = (d.entradasKg / maxVal) * 100
            const salHeight = (d.salidasKg / maxVal) * 100
            const label = d.fecha.slice(5)
            return (
              <div
                key={d.fecha}
                className="flex min-w-3 flex-1 flex-col items-center gap-0.5"
                title={`${d.fecha}: Ent ${d.entradasKg} KG / Sal ${d.salidasKg} KG`}
              >
                <div className="flex h-36 w-full items-end justify-center gap-px">
                  <div
                    className="w-1.5 rounded-t bg-emerald-500"
                    style={{ height: `${entHeight}%`, minHeight: d.entradasKg > 0 ? '2px' : '0' }}
                  />
                  <div
                    className="w-1.5 rounded-t bg-orange-500"
                    style={{ height: `${salHeight}%`, minHeight: d.salidasKg > 0 ? '2px' : '0' }}
                  />
                </div>
                {data.length <= 15 && (
                  <span className="text-[9px] text-muted-foreground">{label}</span>
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500" />
            Entradas
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-orange-500" />
            Salidas
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function InventarioChart({
  data,
}: {
  data: { material: string; bancos: number; kg: number }[]
}) {
  const maxKg = Math.max(...data.map((d) => d.kg), 1)
  const top = data.slice(0, 8)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventario por material (KG)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {top.length === 0 && (
          <p className="text-sm text-muted-foreground">Sin inventario disponible.</p>
        )}
        {top.map((item) => (
          <div key={item.material} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="truncate font-medium">{item.material}</span>
              <span className="text-muted-foreground">
                {item.kg.toFixed(2)} KG · {item.bancos} bancos
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(item.kg / maxKg) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
