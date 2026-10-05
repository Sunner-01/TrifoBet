'use client'

import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  change: string
  icon: LucideIcon
  color?: 'primary' | 'secondary' | 'accent'
}

export default function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'primary',
}: StatsCardProps) {
  const colorClasses = {
    primary: 'bg-emerald-500/10 text-emerald-500',
    secondary: 'bg-blue-500/10 text-blue-500',
    accent: 'bg-purple-500/10 text-purple-500',
  }

  return (
    <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300 shadow-lg hover:shadow-emerald-500/10 group relative overflow-hidden h-full">
      <div className="absolute -top-4 -right-4 p-6 opacity-5 transform group-hover:scale-110 transition-transform duration-500 pointer-events-none">
        <Icon size={80} />
      </div>
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground mb-2 tracking-wide uppercase">{title}</p>
          <div className="flex flex-wrap items-end gap-2">
            <h3 className="text-3xl font-black text-foreground/90 tracking-tight truncate max-w-full">{value}</h3>
            {change && <span className="text-xs text-emerald-500 font-bold mb-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">{change}</span>}
          </div>
        </div>
        <div className={`p-3 rounded-lg flex-shrink-0 ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}
