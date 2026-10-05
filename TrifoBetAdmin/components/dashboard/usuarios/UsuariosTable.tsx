import { Edit2, UserX, UserCheck, RefreshCw, Users, Eye } from 'lucide-react'
import { UsuarioAdmin } from '@/lib/api'

const ROL_LABELS: Record<number, string> = {
  1: 'Administrador',
  2: 'Jugador',
  3: 'Soporte',
  4: 'Afiliado',
}

const ROL_COLORS: Record<number, string> = {
  1: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  2: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  3: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  4: 'bg-green-500/10 text-green-400 border border-green-500/20',
}

interface UsuariosTableProps {
  usuarios: UsuarioAdmin[];
  loading: boolean;
  togglingId: number | null;
  onEdit: (u: UsuarioAdmin) => void;
  onToggleHabilitar: (u: UsuarioAdmin) => void;
}

export default function UsuariosTable({ usuarios, loading, togglingId, onEdit, onToggleHabilitar }: UsuariosTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Usuario</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Correo</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">País</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saldo</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rol</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="px-4 py-4">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : usuarios.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-16 text-center">
                <Users size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">No se encontraron usuarios</p>
              </td>
            </tr>
          ) : (
            usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                {/* Usuario */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.foto_perfil_url || 'https://res.cloudinary.com/dyqepg2hy/image/upload/v1763771339/trifobet/avatars/default-avatar.png'}
                      alt={u.nombre_usuario}
                      className="w-9 h-9 rounded-full object-cover border border-border"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {u.nombre} {u.apellido1}
                      </p>
                      <p className="text-xs text-muted-foreground">@{u.nombre_usuario}</p>
                    </div>
                  </div>
                </td>
                {/* Correo */}
                <td className="px-4 py-3 text-sm text-muted-foreground">{u.correo}</td>
                {/* País */}
                <td className="px-4 py-3">
                  <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded text-foreground">
                    {u.pais_codigo}
                  </span>
                </td>
                {/* Saldo */}
                <td className="px-4 py-3 text-sm text-right font-medium text-foreground">
                  Bs. {Number(u.saldo).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                </td>
                {/* Rol */}
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ROL_COLORS[u.rol_id] || 'bg-muted text-muted-foreground'}`}>
                    {ROL_LABELS[u.rol_id] || `Rol ${u.rol_id}`}
                  </span>
                </td>
                {/* Estado */}
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.habilitado
                      ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                      : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.habilitado ? 'bg-green-500' : 'bg-red-500'}`} />
                    {u.habilitado ? 'Activo' : 'Suspendido'}
                  </span>
                </td>
                {/* Acciones */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onEdit(u)}
                      className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                      title="Editar usuario"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => onToggleHabilitar(u)}
                      disabled={togglingId === u.id}
                      className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                        u.habilitado
                          ? 'hover:bg-red-500/10 text-muted-foreground hover:text-red-500'
                          : 'hover:bg-green-500/10 text-muted-foreground hover:text-green-500'
                      }`}
                      title={u.habilitado ? 'Suspender usuario' : 'Reactivar usuario'}
                    >
                      {togglingId === u.id ? (
                        <RefreshCw size={15} className="animate-spin" />
                      ) : u.habilitado ? (
                        <UserX size={15} />
                      ) : (
                        <UserCheck size={15} />
                      )}
                    </button>
                    <button
                      onClick={() => onEdit(u)}
                      className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                      title="Ver detalle"
                    >
                      <Eye size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
