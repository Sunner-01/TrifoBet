'use client'

import { useState } from 'react'
import { Menu, Bell, Settings, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

interface NavbarProps {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export default function Navbar({ onToggleSidebar, isSidebarOpen }: NavbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Left Section - Menu Toggle */}
      <button
        onClick={onToggleSidebar}
        className="p-2 hover:bg-muted rounded-lg transition-colors"
        title={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        <Menu size={20} className="text-foreground" />
      </button>

      {/* Right Section - User Menu and Notifications */}
      <div className="flex items-center gap-4">
        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
              A
            </div>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">{user?.nombre || 'Admin'}</p>
                <p className="text-xs text-muted-foreground">{user?.correo || 'admin@trifobet.com'}</p>
              </div>

              <div className="p-2 space-y-1">
                <Link
                  href="/dashboard/perfil"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <User size={16} />
                  Mi Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
