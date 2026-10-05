'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
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
  Wallet,
  ShieldCheck
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
}

// Roles: 1 (Admin), 3 (Soporte), 5 (Verificador), 6 (Cajero)
const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [1, 3, 5, 6] },
  { href: '/dashboard/usuarios', label: 'Usuarios', icon: Users, roles: [1, 3, 5, 6] },
  { href: '/dashboard/recargas', label: 'Recargas', icon: Wallet, roles: [1, 6] },
  { href: '/dashboard/retiros', label: 'Retiros', icon: DollarSign, roles: [1, 6] },
  { href: '/dashboard/transacciones', label: 'Transacciones', icon: DollarSign, roles: [1, 6] },
  { href: '/dashboard/juegos', label: 'Juegos', icon: Gamepad2, roles: [1] },
  { href: '/dashboard/apuestas', label: 'Apuestas Deportivas', icon: TrendingUp, roles: [1] },
  { href: '/dashboard/reportes', label: 'Reportes', icon: BarChart3, roles: [1] },
  { href: '/dashboard/verificaciones', label: 'Verificaciones', icon: ShieldCheck, roles: [1, 5] },
  { href: '/dashboard/soporte', label: 'Soporte', icon: MessageCircle, roles: [1, 3] },
  { href: '/dashboard/personal', label: 'Personal', icon: Users, roles: [1] },
]

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  
  const allowedItems = menuItems.filter(item => user && item.roles.includes(user.rol_id))

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 flex flex-col`}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-center border-b border-sidebar-border">
        <img src="/icon.png" alt="TrifoBet Logo" className="w-10 h-10 rounded-lg" />
        {isOpen && <span className="ml-3 font-bold text-lg">TrifoBet</span>}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {allowedItems.map((item) => {
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

    </aside>
  )
}
