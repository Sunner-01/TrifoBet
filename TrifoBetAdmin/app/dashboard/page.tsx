'use client'

import StatsCard from '@/components/dashboard/StatsCard'
import RecentUsers from '@/components/dashboard/RecentUsers'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import RevenueChart from '@/components/dashboard/RevenueChart'
import DistributionChart from '@/components/dashboard/DistributionChart'
import { Users, DollarSign, TrendingUp, RefreshCw, BarChart2, PieChart as PieChartIcon, Calendar, Download, AlertCircle, Dice5, Goal, Banknote, Clock } from 'lucide-react'

// Hooks y Utils Extraídos (SRP)
import { useDashboard } from '@/hooks/useDashboard'
import { exportDashboardPDF } from '@/lib/pdf-exporter'

export default function DashboardPage() {
  const { data, loading, range, setRange, fetchData } = useDashboard();

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <RefreshCw className="animate-spin text-emerald-500" size={40} />
        <p className="text-muted-foreground animate-pulse font-medium">Cargando métricas en vivo...</p>
      </div>
    )
  }

  const { kpis, chartData, recientes, ultimosUsuarios, distribucionApuestas } = data

  const formatBs = (val: number) => {
    return `Bs. ${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val.toFixed(2)}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground/90">Centro de Mando TrifoBet</h1>
          <p className="text-muted-foreground mt-1">Supervisión integral de apuestas deportivas, casino y flujos financieros.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-background/50 backdrop-blur-md border border-border/50 px-2 py-1.5 rounded-xl">
            <Calendar size={16} className="text-muted-foreground ml-2" />
            <select 
              className="bg-transparent border-none text-sm font-bold text-foreground focus:ring-0 cursor-pointer"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="mes">Este Mes</option>
              <option value="all">Historico (30 pts)</option>
            </select>
          </div>

          <button 
            onClick={() => exportDashboardPDF(data, range)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all duration-300 font-bold text-sm shadow-lg shadow-emerald-500/20"
          >
            <Download size={16} />
            Exportar
          </button>

          <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-background/50 backdrop-blur-md border border-border/50 hover:bg-emerald-500/10 hover:text-emerald-500 text-muted-foreground rounded-xl transition-all duration-300 font-bold text-sm"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Alertas Pendientes (Acción Inmediata) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center gap-4 hover:bg-orange-500/20 transition-colors">
          <div className="p-3 bg-orange-500/20 text-orange-500 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-orange-500 font-bold text-xl">{kpis.recargasPendientes}</p>
            <p className="text-orange-500/80 text-xs uppercase tracking-wide font-medium">Recargas Pendientes</p>
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-4 hover:bg-red-500/20 transition-colors">
          <div className="p-3 bg-red-500/20 text-red-500 rounded-lg">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-red-500 font-bold text-xl">{kpis.retirosPendientes}</p>
            <p className="text-red-500/80 text-xs uppercase tracking-wide font-medium">Retiros Pendientes</p>
          </div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center gap-4 hover:bg-blue-500/20 transition-colors">
          <div className="p-3 bg-blue-500/20 text-blue-500 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-blue-500 font-bold text-xl">{kpis.kycPendientes}</p>
            <p className="text-blue-500/80 text-xs uppercase tracking-wide font-medium">KYC Pendientes</p>
          </div>
        </div>
      </div>

      {/* Stats Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Recargas" 
          value={formatBs(kpis.totalRecargas)} 
          change="Aprobadas" 
          icon={DollarSign} 
          color="primary" 
        />
        <StatsCard 
          title="Total Retiros" 
          value={formatBs(kpis.totalRetiros)} 
          change="Pagados" 
          icon={TrendingUp} 
          color="secondary" 
        />
        <StatsCard 
          title="GGR (Ganancia Neta)" 
          value={formatBs(kpis.ggr + kpis.casinoGGR)} 
          change="Beneficio de la casa" 
          icon={Banknote} 
          color="accent" 
        />
        <StatsCard 
          title="Usuarios" 
          value={kpis.usuariosTotales.toString()} 
          change={`+${kpis.usuariosNuevosHoy} hoy`} 
          icon={Users} 
          color="primary" 
        />
      </div>

      {/* División de Negocios: Deportes vs Casino */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deportes */}
        <div className="bg-card/30 border border-border/50 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Goal className="text-emerald-500" size={20}/>
            <h3 className="font-bold text-foreground">Apuestas Deportivas</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-background/50 p-3 rounded-lg">
              <span className="text-muted-foreground text-sm">Volumen Apostado</span>
              <span className="font-bold">{formatBs(kpis.totalApostado)}</span>
            </div>
            <div className="flex justify-between items-center bg-background/50 p-3 rounded-lg">
              <span className="text-muted-foreground text-sm">Apuestas Pendientes</span>
              <span className="font-bold">{kpis.apuestasActivas} tickets</span>
            </div>
            <div className="flex justify-between items-center bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
              <span className="text-emerald-500 text-sm font-medium">GGR Deportivo</span>
              <span className="font-black text-emerald-500">{formatBs(kpis.ggr)}</span>
            </div>
          </div>
        </div>

        {/* Casino */}
        <div className="bg-card/30 border border-border/50 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Dice5 className="text-purple-500" size={20}/>
            <h3 className="font-bold text-foreground">Casino en Línea</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-background/50 p-3 rounded-lg">
              <span className="text-muted-foreground text-sm">Volumen Jugado</span>
              <span className="font-bold">{formatBs(kpis.casinoVolumen || 0)}</span>
            </div>
            <div className="flex justify-between items-center bg-background/50 p-3 rounded-lg">
              <span className="text-muted-foreground text-sm">Premios Pagados</span>
              <span className="font-bold">{formatBs(kpis.casinoPagado || 0)}</span>
            </div>
            <div className="flex justify-between items-center bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
              <span className="text-purple-500 text-sm font-medium">GGR Casino</span>
              <span className="font-black text-purple-500">{formatBs(kpis.casinoGGR || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area Chart */}
        <div className="lg:col-span-2 bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg h-[400px] flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <BarChart2 size={20} className="text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Flujo Financiero</h2>
              <p className="text-sm text-muted-foreground">Recargas (Verde) vs Retiros (Rojo)</p>
            </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <RevenueChart data={chartData} />
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg h-[400px] flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <PieChartIcon size={20} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Estado de Apuestas</h2>
            </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <DistributionChart data={distribucionApuestas} />
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions transactions={recientes} />
        </div>
        <div>
          <RecentUsers users={ultimosUsuarios} />
        </div>
      </div>
    </div>
  )
}
