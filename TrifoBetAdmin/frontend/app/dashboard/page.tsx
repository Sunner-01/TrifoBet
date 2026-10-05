'use client'

import StatsCard from '@/components/dashboard/StatsCard'
import RecentUsers from '@/components/dashboard/RecentUsers'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import { Users, DollarSign, Gamepad2, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    {
      title: 'Usuarios Totales',
      value: '2,543',
      change: '+12.5%',
      icon: Users,
      color: 'primary',
    },
    {
      title: 'Ingresos Hoy',
      value: 'Bs 45,230.50',
      change: '+8.2%',
      icon: DollarSign,
      color: 'primary',
    },
    {
      title: 'Juegos Activos',
      value: '18',
      change: '+2 nuevos',
      icon: Gamepad2,
      color: 'primary',
    },
    {
      title: 'Apuestas Deportivas',
      value: '1,245',
      change: '+5.4%',
      icon: TrendingUp,
      color: 'primary',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al panel administrativo de TrifoBet</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        <div>
          <RecentUsers />
        </div>
      </div>
    </div>
  )
}
