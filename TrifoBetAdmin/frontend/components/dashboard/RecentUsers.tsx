'use client'

interface User {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive'
  joinDate: string
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Juan García',
    email: 'juan@example.com',
    status: 'active',
    joinDate: '2024-05-15',
  },
  {
    id: '2',
    name: 'María López',
    email: 'maria@example.com',
    status: 'active',
    joinDate: '2024-05-20',
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    email: 'carlos@example.com',
    status: 'inactive',
    joinDate: '2024-04-10',
  },
  {
    id: '4',
    name: 'Ana Martínez',
    email: 'ana@example.com',
    status: 'active',
    joinDate: '2024-06-01',
  },
]

export default function RecentUsers() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-bold text-foreground mb-6">Usuarios Recientes</h2>

      <div className="space-y-4">
        {mockUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                {user.name.split(' ')[0][0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                user.status === 'active'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {user.status === 'active' ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <a
          href="/dashboard/usuarios"
          className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
        >
          Ver todos los usuarios →
        </a>
      </div>
    </div>
  )
}
