'use client'

import { X, User, Mail, Shield, Calendar, Phone, Hash, KeySquare } from 'lucide-react'

export default function PersonalViewModal({ worker, onClose }: { worker: any, onClose: () => void }) {
  if (!worker) return null

  const ROL_LABELS: Record<number, string> = {
    1: 'Administrador Principal',
    3: 'Soporte al Cliente',
    5: 'Verificador de Cuentas',
    6: 'Cajero / Finanzas',
  }

  const ROL_COLORS: Record<number, string> = {
    1: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    3: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    5: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    6: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  }

  const formatData = (value: any) => value || <span className="text-muted-foreground/50 italic">No especificado</span>

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-border/50 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden shadow-emerald-500/5">
        
        {/* Header con gradiente premium */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900/40 to-card border-b border-border p-6 flex items-start justify-between">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <User size={120} />
          </div>
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white text-2xl font-black border border-emerald-400/30">
              {worker.nombre ? worker.nombre.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <h2 className="font-bold text-2xl tracking-tight text-foreground/90">{worker.nombre} {worker.apellido1} {worker.apellido2}</h2>
              <div className="flex items-center gap-3 mt-1.5">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${ROL_COLORS[worker.rol_id] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                  <Shield size={12} className="mr-1.5" />
                  {ROL_LABELS[worker.rol_id] || worker.rol?.nombre || 'Desconocido'}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${worker.habilitado ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {worker.habilitado ? 'Cuenta Activa' : 'Cuenta Suspendida'}
                </span>
              </div>
            </div>
          </div>
          
          <button onClick={onClose} className="p-2 hover:bg-background/50 rounded-xl transition-all hover:scale-110 relative z-10 text-muted-foreground hover:text-foreground backdrop-blur-md">
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="bg-background/40 rounded-2xl p-4 border border-border/50 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
              <User size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Nombre de Usuario</span>
            </div>
            <p className="font-medium">{formatData(worker.nombre_usuario)}</p>
          </div>

          <div className="bg-background/40 rounded-2xl p-4 border border-border/50 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
              <Mail size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Correo Electrónico</span>
            </div>
            <p className="font-medium">{formatData(worker.correo)}</p>
          </div>

          <div className="bg-background/40 rounded-2xl p-4 border border-border/50 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
              <Hash size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Documento (CI)</span>
            </div>
            <p className="font-medium font-mono">{formatData(worker.ci)}</p>
          </div>

          <div className="bg-background/40 rounded-2xl p-4 border border-border/50 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
              <Phone size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Teléfono</span>
            </div>
            <p className="font-medium">{formatData(worker.telefono)}</p>
          </div>

          <div className="bg-background/40 rounded-2xl p-4 border border-border/50 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
              <Calendar size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Fecha de Nacimiento</span>
            </div>
            <p className="font-medium">{worker.fecha_nacimiento ? new Date(worker.fecha_nacimiento).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : <span className="text-muted-foreground/50 italic">No especificado</span>}</p>
          </div>

          <div className="bg-background/40 rounded-2xl p-4 border border-border/50 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
              <KeySquare size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Fecha de Contratación</span>
            </div>
            <p className="font-medium">{worker.created_at ? new Date(worker.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : <span className="text-muted-foreground/50 italic">Desconocido</span>}</p>
          </div>

        </div>

      </div>
    </div>
  )
}
