'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import UserModal from '@/components/dashboard/modals/UserModal'

interface User {
  id: string
  nombre: string
  email: string
  telefono: string
  ciudad: string
  estado: 'activo' | 'inactivo'
  habilitado: boolean
  saldo: number
  fechaRegistro: string
}

const mockUsers: User[] = [
  {
    id: '1',
    nombre: 'Juan García',
    email: 'juan@example.com',
    telefono: '+591 71234567',
    ciudad: 'La Paz',
    estado: 'activo',
    habilitado: true,
    saldo: 15000,
    fechaRegistro: '2024-05-15',
  },
  {
    id: '2',
    nombre: 'María López',
    email: 'maria@example.com',
    telefono: '+591 72345678',
    ciudad: 'Cochabamba',
    estado: 'activo',
    habilitado: true,
    saldo: 8500,
    fechaRegistro: '2024-05-20',
  },
  {
    id: '3',
    nombre: 'Carlos Rodríguez',
    email: 'carlos@example.com',
    telefono: '+591 73456789',
    ciudad: 'Santa Cruz',
    estado: 'inactivo',
    habilitado: false,
    saldo: 0,
    fechaRegistro: '2024-04-10',
  },
]

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'todos' | 'activo' | 'inactivo'>('todos')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.ciudad.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      filterStatus === 'todos' || user.estado === filterStatus

    return matchesSearch && matchesStatus
  })

  const handleAddUser = () => {
    setSelectedUser(null)
    setIsModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleSaveUser = (userData: Partial<User>) => {
    if (selectedUser) {
      // Edit
      setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, ...userData } : u)))
    } else {
      // Add
      setUsers([
        ...users,
        {
          id: Date.now().toString(),
          ...userData,
          fechaRegistro: new Date().toISOString().split('T')[0],
        } as User,
      ])
    }
    setIsModalOpen(false)
  }

  const handleDeleteUser = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      setUsers(users.filter((u) => u.id !== id))
    }
  }

  const toggleUserStatus = (id: string) => {
    setUsers(
      users.map((u) =>
        u.id === id
          ? { ...u, estado: u.estado === 'activo' ? 'inactivo' : 'activo' }
          : u
      )
    )
  }

  const toggleUserEnabled = (id: string) => {
    setUsers(
      users.map((u) =>
        u.id === id
          ? { ...u, habilitado: !u.habilitado }
          : u
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra y controla todos los usuarios del sistema</p>
        </div>
        <button
          onClick={handleAddUser}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Ciudad</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Saldo</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Estado</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Habilitado</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{user.nombre}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{user.ciudad}</td>
                  <td className="px-6 py-4 text-sm text-right text-foreground font-medium">
                    Bs {user.saldo.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        user.estado === 'activo'
                          ? 'bg-primary/10 text-primary hover:bg-primary/20'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {user.estado === 'activo' ? (
                        <>
                          <Eye size={14} className="mr-1" />
                          Activo
                        </>
                      ) : (
                        <>
                          <EyeOff size={14} className="mr-1" />
                          Inactivo
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleUserEnabled(user.id)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        user.habilitado
                          ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                          : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                      }`}
                    >
                      {user.habilitado ? 'Habilitado' : 'Deshabilitado'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No se encontraron usuarios que coincidan con tu búsqueda
          </div>
        )}
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser || undefined}
      />
    </div>
  )
}
