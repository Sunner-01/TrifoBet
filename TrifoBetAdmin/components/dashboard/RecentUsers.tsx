'use client'

import { User } from 'lucide-react'
import Link from 'next/link'

export default function RecentUsers({ users = [] }: { users?: any[] }) {
  return (
    <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500/10 rounded-xl">
          <User size={20} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Usuarios Recientes</h2>
      </div>

      <div className="space-y-4 flex-1">
        {users.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">No hay usuarios recientes</div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 bg-background/40 border border-border/50 rounded-xl hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 flex-1">
                {user.foto_perfil_url ? (
                  <img src={user.foto_perfil_url} alt="Perfil" className="w-12 h-12 rounded-xl object-cover shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform" />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    {user.nombre_usuario ? user.nombre_usuario.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground/90 truncate group-hover:text-emerald-500 transition-colors">{user.nombre_usuario}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.correo}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full whitespace-nowrap">
                  Bs. {Number(user.saldo || 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border/50">
        <Link
          href="/dashboard/usuarios"
          className="text-emerald-500 hover:text-emerald-400 text-sm font-bold transition-colors flex items-center gap-1"
        >
          Ver todos los usuarios &rarr;
        </Link>
      </div>
    </div>
  )
}
