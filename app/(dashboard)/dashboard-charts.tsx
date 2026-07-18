'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>
  label?: string
  labelFormatter?: (label: string) => string
  valueFormatter?: (value: number, name: string) => string
}) {
  if (!active || !payload?.length) return null

  return (
    <div
      style={{
        backgroundColor: 'hsl(var(--popover))',
        color: 'hsl(var(--popover-foreground))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        zIndex: 50,
      }}
    >
      {label && (
        <p style={{ color: 'hsl(var(--popover-foreground))', marginBottom: 4, fontWeight: 500 }}>
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: 'hsl(var(--popover-foreground))', margin: '2px 0' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color, marginRight: 6 }} />
          <span style={{ color: 'hsl(var(--muted-foreground))' }}>{entry.name === 'entradasKg' ? 'Entradas' : entry.name === 'salidasKg' ? 'Salidas' : entry.name}:</span>{' '}
          <span style={{ fontWeight: 600 }}>{valueFormatter ? valueFormatter(entry.value, entry.name) : `${entry.value.toFixed(2)} KG`}</span>
        </p>
      ))}
    </div>
  )
}

function InventarioTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div
      style={{
        backgroundColor: 'hsl(var(--popover))',
        color: 'hsl(var(--popover-foreground))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        zIndex: 50,
      }}
    >
      {label && (
        <p style={{ color: 'hsl(var(--popover-foreground))', marginBottom: 4, fontWeight: 500 }}>
          {label}
        </p>
      )}
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: 'hsl(var(--popover-foreground))', margin: '2px 0' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color, marginRight: 6 }} />
          <span style={{ color: 'hsl(var(--muted-foreground))' }}>Peso:</span>{' '}
          <span style={{ fontWeight: 600 }}>{entry.value.toFixed(2)} KG</span>
        </p>
      ))}
    </div>
  )
}

export function DashboardChart({
  data,
}: {
  data: { fecha: string; entradasKg: number; salidasKg: number }[]
}) {
  const chartData = data.map((d) => ({
    ...d,
    label: d.fecha.slice(5),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimiento últimos 30 días (KG)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin datos de movimiento.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                className="text-muted-foreground"
              />
              <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <Tooltip
                content={<ChartTooltipContent />}
              />
              <Legend
                formatter={(value: string) =>
                  value === 'entradasKg' ? 'Entradas' : 'Salidas'
                }
              />
              <Bar dataKey="entradasKg" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="salidasKg" fill="#f97316" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

export function InventarioChart({
  data,
}: {
  data: { material: string; bancos: number; kg: number }[]
}) {
  const top = data.slice(0, 8)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventario por material (KG)</CardTitle>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin inventario disponible.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={top} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <YAxis
                dataKey="material"
                type="category"
                width={120}
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <Tooltip
                content={<InventarioTooltipContent />}
              />
              <Bar dataKey="kg" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
