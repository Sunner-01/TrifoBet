'use client'

import { useState } from 'react'
import { Download, Calendar, TrendingUp, FileText } from 'lucide-react'

interface ReporteData {
  periodo: string
  usuariosNuevos: number
  usuariosActivos: number
  ingresos: number
  egresos: number
  gananciaNeta: number
  apuestasTotal: number
  juegosPropiosIngresos: number
  porcentajeRTP: number
}

const mockReportes: ReporteData[] = [
  {
    periodo: 'Junio 2024',
    usuariosNuevos: 245,
    usuariosActivos: 2543,
    ingresos: 85000,
    egresos: 45000,
    gananciaNeta: 40000,
    apuestasTotal: 125000,
    juegosPropiosIngresos: 55000,
    porcentajeRTP: 96.2,
  },
  {
    periodo: 'Mayo 2024',
    usuariosNuevos: 198,
    usuariosActivos: 2298,
    ingresos: 72000,
    egresos: 38000,
    gananciaNeta: 34000,
    apuestasTotal: 98000,
    juegosPropiosIngresos: 45000,
    porcentajeRTP: 96.8,
  },
  {
    periodo: 'Abril 2024',
    usuariosNuevos: 156,
    usuariosActivos: 2100,
    ingresos: 65000,
    egresos: 35000,
    gananciaNeta: 30000,
    apuestasTotal: 85000,
    juegosPropiosIngresos: 38000,
    porcentajeRTP: 97.1,
  },
]

export default function ReportesPage() {
  const [selectedPeriodo, setSelectedPeriodo] = useState('Junio 2024')
  const [tipoReporte, setTipoReporte] = useState<'todos' | 'transacciones' | 'depositos' | 'retiros'>('todos')
  const [rangoTiempo, setRangoTiempo] = useState<'5meses' | '1año'>('5meses')
  
  const currentReporte = mockReportes.find((r) => r.periodo === selectedPeriodo) || mockReportes[0]

  const generatePDF = () => {
    const reportData = {
      tipo: tipoReporte === 'todos' ? 'Reporte General' : tipoReporte.charAt(0).toUpperCase() + tipoReporte.slice(1),
      periodo: selectedPeriodo,
      rango: rangoTiempo === '5meses' ? 'Últimos 5 meses' : 'Último año',
      fechaGeneracion: new Date().toLocaleDateString('es-BO'),
      datos: currentReporte,
    }

    let contenido = `
TRIFOBET - REPORTE ADMINISTRATIVO
=====================================

TIPO DE REPORTE: ${reportData.tipo}
PERÍODO: ${reportData.periodo}
RANGO: ${reportData.rango}
FECHA DE GENERACIÓN: ${reportData.fechaGeneracion}

=====================================
MÉTRICAS PRINCIPALES
=====================================

1. USUARIOS
   • Usuarios Nuevos: ${currentReporte.usuariosNuevos}
   • Usuarios Activos: ${currentReporte.usuariosActivos}

2. ANÁLISIS FINANCIERO
   • Ingresos Totales: Bs ${currentReporte.ingresos.toLocaleString('es-BO', {minimumFractionDigits: 2})}
   • Egresos Totales: Bs ${currentReporte.egresos.toLocaleString('es-BO', {minimumFractionDigits: 2})}
   • Ganancia Neta: Bs ${currentReporte.gananciaNeta.toLocaleString('es-BO', {minimumFractionDigits: 2})}
   • Margen de Ganancia: ${((currentReporte.gananciaNeta / currentReporte.ingresos) * 100).toFixed(2)}%

3. APUESTAS DEPORTIVAS
   • Volumen Total: Bs ${currentReporte.apuestasTotal.toLocaleString('es-BO', {minimumFractionDigits: 2})}
   • Participación: ${((currentReporte.apuestasTotal / (currentReporte.apuestasTotal + currentReporte.juegosPropiosIngresos)) * 100).toFixed(1)}%
   • Eventos Activos: 127

4. JUEGOS PROPIOS
   • Ingresos Generados: Bs ${currentReporte.juegosPropiosIngresos.toLocaleString('es-BO', {minimumFractionDigits: 2})}
   • Participación: ${((currentReporte.juegosPropiosIngresos / (currentReporte.apuestasTotal + currentReporte.juegosPropiosIngresos)) * 100).toFixed(1)}%
   • RTP Promedio: ${currentReporte.porcentajeRTP}%
   • Juegos Activos: 18

=====================================
NOTAS FINALES
=====================================

Este reporte ha sido generado automáticamente por el sistema
administrativo de TrifoBet. Los datos presentados son válidos
para fines de análisis interno y presentación formal.

Para consultas adicionales, contactar con el equipo administrativo.

Documento oficial de TrifoBet - ${new Date().getFullYear()}
    `

    const element = document.createElement('a')
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })
    element.href = URL.createObjectURL(blob)
    element.download = `TrifoBet-Reporte-${tipoReporte}-${selectedPeriodo.replace(/ /g, '-')}.txt`
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    URL.revokeObjectURL(element.href)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
          <p className="text-muted-foreground">Análisis financiero y operativo de la plataforma</p>
        </div>
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
        >
          <Download size={20} />
          Descargar Reporte
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={18} className="text-primary" />
          <label className="text-sm font-medium text-foreground">Opciones de Reporte:</label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tipo de Reporte */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Tipo de Reporte</label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value as any)}
              className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="todos">Reporte General</option>
              <option value="transacciones">Transacciones</option>
              <option value="depositos">Depósitos</option>
              <option value="retiros">Retiros</option>
            </select>
          </div>

          {/* Período */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Período</label>
            <select
              value={selectedPeriodo}
              onChange={(e) => setSelectedPeriodo(e.target.value)}
              className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              {mockReportes.map((r) => (
                <option key={r.periodo} value={r.periodo}>
                  {r.periodo}
                </option>
              ))}
            </select>
          </div>

          {/* Rango de Tiempo */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Rango Temporal</label>
            <select
              value={rangoTiempo}
              onChange={(e) => setRangoTiempo(e.target.value as any)}
              className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="5meses">Últimos 5 Meses</option>
              <option value="1año">Último Año</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Usuarios Nuevos</p>
          <p className="text-3xl font-bold text-foreground">{currentReporte.usuariosNuevos}</p>
          <p className="text-xs text-primary mt-2">+12% respecto mes anterior</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Usuarios Activos</p>
          <p className="text-3xl font-bold text-foreground">{currentReporte.usuariosActivos}</p>
          <p className="text-xs text-primary mt-2">+10.6% respecto mes anterior</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Ingresos Totales</p>
          <p className="text-3xl font-bold text-primary">Bs {currentReporte.ingresos.toFixed(2)}</p>
          <p className="text-xs text-primary mt-2">+18% respecto mes anterior</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Egresos Totales</p>
          <p className="text-3xl font-bold text-foreground">Bs {currentReporte.egresos.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-2">+18.4% respecto mes anterior</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Ganancia Neta</p>
          <p className="text-3xl font-bold text-primary">Bs {currentReporte.gananciaNeta.toFixed(2)}</p>
          <p className="text-xs text-primary mt-2">+17.6% respecto mes anterior</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">RTP Promedio</p>
          <p className="text-3xl font-bold text-foreground">{currentReporte.porcentajeRTP}%</p>
          <p className="text-xs text-muted-foreground mt-2">Dentro de regulaciones</p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Apuestas Deportivas */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Apuestas Deportivas
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Volumen Total de Apuestas</p>
              <p className="text-2xl font-bold text-foreground">Bs {currentReporte.apuestasTotal.toFixed(2)}</p>
            </div>
            <div className="pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground mb-1">Participación en Ingresos</p>
              <p className="text-xl font-bold text-primary">
                {((currentReporte.apuestasTotal / (currentReporte.apuestasTotal + currentReporte.juegosPropiosIngresos)) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground mb-1">Eventos Activos</p>
              <p className="text-xl font-bold text-foreground">127</p>
            </div>
          </div>
        </div>

        {/* Juegos Propios */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Juegos Propios
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ingresos de Juegos</p>
              <p className="text-2xl font-bold text-foreground">Bs {currentReporte.juegosPropiosIngresos.toFixed(2)}</p>
            </div>
            <div className="pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground mb-1">Participación en Ingresos</p>
              <p className="text-xl font-bold text-primary">
                {((currentReporte.juegosPropiosIngresos / (currentReporte.apuestasTotal + currentReporte.juegosPropiosIngresos)) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground mb-1">Juegos Activos</p>
              <p className="text-xl font-bold text-foreground">18</p>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Comparison */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-6">Comparativa Histórica</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Período</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Usuarios Nuevos</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Usuarios Activos</th>
                <th className="text-right py-3 px-4 font-semibold text-foreground">Ingresos</th>
                <th className="text-right py-3 px-4 font-semibold text-foreground">Ganancia Neta</th>
              </tr>
            </thead>
            <tbody>
              {mockReportes.map((reporte) => (
                <tr key={reporte.periodo} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 text-foreground font-medium">{reporte.periodo}</td>
                  <td className="py-3 px-4 text-center text-foreground">{reporte.usuariosNuevos}</td>
                  <td className="py-3 px-4 text-center text-foreground">{reporte.usuariosActivos}</td>
                  <td className="py-3 px-4 text-right text-foreground font-semibold">
                    Bs {reporte.ingresos.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right text-primary font-semibold">
                    Bs {reporte.gananciaNeta.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
