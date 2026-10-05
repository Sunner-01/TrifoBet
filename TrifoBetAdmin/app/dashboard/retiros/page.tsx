'use client'

import { useState, useEffect } from 'react'
import { Check, X, Loader2, Image as ImageIcon, Search, Download, Clock, CreditCard } from 'lucide-react'

// Tab components
import { CuentasPendientes } from './components/cuentas-pendientes'
import { SolicitudesRetiro } from './components/solicitudes-retiro'

export default function RetirosAdminPage() {
  const [activeTab, setActiveTab] = useState<'cuentas' | 'retiros'>('retiros')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Retiros</h1>
          <p className="text-muted-foreground">Aprobación de cuentas y procesamiento de pagos</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border rounded-lg p-2 flex gap-2 w-full max-w-md">
        <button
          onClick={() => setActiveTab('retiros')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'retiros' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          }`}
        >
          Solicitudes de Retiro
        </button>
        <button
          onClick={() => setActiveTab('cuentas')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'cuentas' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          }`}
        >
          Gestión de Cuentas
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'cuentas' ? <CuentasPendientes /> : <SolicitudesRetiro />}
      </div>
    </div>
  )
}
