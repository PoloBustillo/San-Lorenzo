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
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value, name) => [
                  `${Number(value).toFixed(2)} KG`,
                  name === 'entradasKg' ? 'Entradas' : 'Salidas',
                ]}
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
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value) => [`${Number(value).toFixed(2)} KG`, 'Peso']}
              />
              <Bar dataKey="kg" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
