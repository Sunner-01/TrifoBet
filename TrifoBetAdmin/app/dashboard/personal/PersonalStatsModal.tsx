'use client'

import { useState, useEffect } from 'react'
import { X, BarChart3, TrendingUp, CheckCircle, XCircle } from 'lucide-react'
import { getPersonalStats } from '@/lib/api'

export default function PersonalStatsModal({ userId, onClose }: { userId: number, onClose: () => void }) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPersonalStats(userId)
        setStats(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [userId])

  return (
    <div className="fixed inset-0 z-500 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
          <h2 className="font-bold text-xl flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <BarChart3 size={22} className="text-emerald-500" />
            </div>
            Rendimiento del Trabajador
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 ">
          {loading ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">Cargando métricas...</div>
          ) : error ? (
            <div className="h-48 flex items-center  justify-center text-red-400">{error}</div>
          ) : stats && (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-card/40 backdrop-blur-md border border-emerald-500/10 p-5 rounded-2xl shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <TrendingUp size={64} />
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2 font-medium">
                    <TrendingUp size={16} className="text-emerald-500"/> Total Procesado
                  </p>
                  <p className="text-4xl font-black font-mono tracking-tight text-foreground/90">{stats.total}</p>
                </div>
                <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-2xl">
                  <p className="text-sm text-green-400/80 flex items-center gap-2 mb-1">
                    <CheckCircle size={14} /> Aprobadas
                  </p>
                  <p className="text-3xl font-bold font-mono text-green-400">{stats.totalAprobadas}</p>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl">
                  <p className="text-sm text-red-400/80 flex items-center gap-2 mb-1">
                    <XCircle size={14} /> Rechazadas
                  </p>
                  <p className="text-3xl font-bold font-mono text-red-400">{stats.totalRechazadas}</p>
                </div>
              </div>

              {/* Tasa de aprobación */}
              <div className="bg-muted/30 border border-border rounded-2xl p-4">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-sm font-medium">Tasa de Aprobación Global</p>
                  <p className="text-xl font-bold font-mono">{stats.tasaAprobacion}%</p>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                  <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${stats.tasaAprobacion}%` }}></div>
                  <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${100 - stats.tasaAprobacion}%` }}></div>
                </div>
              </div>

              {/* Gráfico de los últimos 7 días */}
              <div className="bg-muted/30 border border-border rounded-2xl p-5">
                <p className="text-sm font-medium mb-6">Actividad (Últimos 7 días)</p>
                
                <div className="h-40 flex items-end justify-between gap-2">
                  {stats.historial.map((dia: any, i: number) => {
                    const maxCount = Math.max(...stats.historial.map((d: any) => d.aprobadas + d.rechazadas), 1)
                    const totalDia = dia.aprobadas + dia.rechazadas
                    const heightPercent = (totalDia / maxCount) * 100
                    const aprobadasPercent = totalDia > 0 ? (dia.aprobadas / totalDia) * 100 : 0
                    const rechazadasPercent = totalDia > 0 ? (dia.rechazadas / totalDia) * 100 : 0
                    
                    const dateObj = new Date(dia.fecha)
                    const dayName = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][dateObj.getUTCDay()]

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                        {/* Tooltip */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 bg-card border border-border p-2 rounded-lg text-xs whitespace-nowrap z-10 transition-opacity shadow-xl pointer-events-none">
                          <p className="font-bold mb-1">{dia.fecha}</p>
                          <p className="text-green-400">Aprobadas: {dia.aprobadas}</p>
                          <p className="text-red-400">Rechazadas: {dia.rechazadas}</p>
                        </div>

                        {/* Barra */}
                        <div className="w-full max-w-[40px] bg-muted/50 rounded-t-sm flex flex-col justify-end overflow-hidden" style={{ height: '100%' }}>
                          <div className="w-full flex flex-col justify-end transition-all duration-700" style={{ height: `${heightPercent}%` }}>
                            <div className="w-full bg-red-500/80" style={{ height: `${rechazadasPercent}%` }}></div>
                            <div className="w-full bg-green-500/80" style={{ height: `${aprobadasPercent}%` }}></div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{dayName}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
