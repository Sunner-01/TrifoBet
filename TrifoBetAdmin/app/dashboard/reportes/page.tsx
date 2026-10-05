'use client'

import { FileText, TrendingUp, Users, DollarSign, Activity, Calendar } from 'lucide-react'
import { useReportesAdmin } from '@/hooks/useReportesAdmin'

// Dumb Components
import { TabFinanzas } from '@/components/dashboard/reportes/TabFinanzas'
import { TabJugadores } from '@/components/dashboard/reportes/TabJugadores'
import { TabJuegos } from '@/components/dashboard/reportes/TabJuegos'
import { TabSoporte } from '@/components/dashboard/reportes/TabSoporte'

export default function ReportesPage() {
  const {
    activeTab,
    setActiveTab,
    loading,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    cashflow,
    ggr,
    depositosMetodo,
    topJugadores,
    rentabilidadCasino,
    eficienciaSoporte,
    fetchAllData
  } = useReportesAdmin()

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Calculando Reportes...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes Avanzados</h1>
          <p className="text-muted-foreground">Sistema Integral de Analíticas y Tesorería</p>
        </div>
        
        {/* Filtros Globales de Fecha */}
        <div className="flex items-center gap-3 bg-card border border-border p-3 rounded-lg shadow-sm">
          <style dangerouslySetInnerHTML={{__html: `
            .date-input-wrapper { position: relative; display: inline-block; }
            .date-input-wrapper input[type="date"]::-webkit-calendar-picker-indicator {
              position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;
            }
          `}} />
          <Calendar size={20} className="text-primary" />
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground">Desde</label>
            <div className="date-input-wrapper">
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                className="bg-background text-sm border border-border rounded px-2 py-1 focus:outline-none w-32 cursor-pointer"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground">Hasta</label>
            <div className="date-input-wrapper">
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                className="bg-background text-sm border border-border rounded px-2 py-1 focus:outline-none w-32 cursor-pointer"
              />
            </div>
          </div>
          <button 
            onClick={fetchAllData}
            className="ml-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-max">
        {[
          { id: 'financieros', icon: DollarSign, label: 'Finanzas' },
          { id: 'jugadores', icon: Users, label: 'Jugadores' },
          { id: 'juegos', icon: Activity, label: 'Casino & Apuestas' },
          { id: 'soporte', icon: FileText, label: 'Soporte' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === tab.id 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:bg-background/50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO TABS */}
      <div className="space-y-6">
        {activeTab === 'financieros' && (
          <TabFinanzas 
            ggr={ggr} 
            cashflow={cashflow} 
            depositosMetodo={depositosMetodo} 
            startDate={startDate} 
            endDate={endDate} 
          />
        )}
        {activeTab === 'jugadores' && (
          <TabJugadores 
            topJugadores={topJugadores} 
            startDate={startDate} 
            endDate={endDate} 
          />
        )}
        {activeTab === 'juegos' && (
          <TabJuegos 
            rentabilidadCasino={rentabilidadCasino} 
            startDate={startDate} 
            endDate={endDate} 
          />
        )}
        {activeTab === 'soporte' && (
          <TabSoporte 
            eficienciaSoporte={eficienciaSoporte} 
            startDate={startDate} 
            endDate={endDate} 
          />
        )}
      </div>
    </div>
  )
}
