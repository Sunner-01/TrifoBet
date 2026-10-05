'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Gamepad2,
  TrendingUp,
  BarChart3,
  LogOut,
  Menu,
  MessageCircle,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
}

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/usuarios', label: 'Usuarios', icon: Users },
  { href: '/dashboard/transacciones', label: 'Transacciones', icon: DollarSign },
  { href: '/dashboard/juegos', label: 'Juegos', icon: Gamepad2 },
  { href: '/dashboard/apuestas', label: 'Apuestas Deportivas', icon: TrendingUp },
  { href: '/dashboard/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/dashboard/soporte', label: 'Soporte', icon: MessageCircle },
]

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname()

  const handleLogout = () => {
    sessionStorage.clear()
    window.location.href = '/'
  }

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 flex flex-col`}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-center border-b border-sidebar-border">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
          TB
        </div>
        {isOpen && <span className="ml-3 font-bold text-lg">TrifoBet</span>}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!isOpen ? item.label : ''}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon size={20} />
              {isOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <LogOut size={20} />
          {isOpen && <span className="text-sm font-medium">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  )
}
