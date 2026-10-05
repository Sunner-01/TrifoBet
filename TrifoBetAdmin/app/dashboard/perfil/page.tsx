'use client'

import { useAuth } from '@/hooks/useAuth'
import { User, Mail, Shield, UserCircle, Settings, Camera, ShieldCheck, Key } from 'lucide-react'

export default function PerfilPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No se pudo cargar la información del perfil.
      </div>
    )
  }

  const roleName = user.rol_id === 1 ? 'Super Administrador' : user.rol_id === 2 ? 'Soporte' : 'Moderador'

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Basic Info */}
        <div className="col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center shadow-sm">
            <div className="relative mb-4 group cursor-pointer">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden border-4 border-background shadow-md">
                <UserCircle className="w-20 h-20 text-primary opacity-80" strokeWidth={1} />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-foreground">{user.nombre}</h2>
            <p className="text-muted-foreground text-sm mb-3">@{user.nombre_usuario}</p>
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-3 h-3" />
              {roleName}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              Opciones
            </h3>
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-sm font-medium text-foreground text-left">
              <span className="flex items-center gap-2"><Key className="w-4 h-4 text-muted-foreground" /> Cambiar Contraseña</span>
            </button>
          </div>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Información Personal</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    Nombre Completo
                  </label>
                  <p className="text-foreground font-medium bg-muted/50 p-2.5 rounded-lg border border-border/50">{user.nombre}</p>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <UserCircle className="w-3 h-3" />
                    Nombre de Usuario
                  </label>
                  <p className="text-foreground font-medium bg-muted/50 p-2.5 rounded-lg border border-border/50">@{user.nombre_usuario}</p>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3 h-3" />
                    Correo Electrónico
                  </label>
                  <p className="text-foreground font-medium bg-muted/50 p-2.5 rounded-lg border border-border/50">{user.correo}</p>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3 h-3" />
                    Rol del Sistema
                  </label>
                  <div className="bg-muted/50 p-2.5 rounded-lg border border-border/50 flex items-center justify-between">
                    <div>
                      <p className="text-foreground font-medium">{roleName}</p>
                      <p className="text-xs text-muted-foreground">Nivel de acceso: ID {user.rol_id}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
