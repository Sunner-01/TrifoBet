'use client'

import { ArrowDownRight, ArrowUpLeft } from 'lucide-react'

interface Transaction {
  id: string
  user: string
  type: 'deposit' | 'withdrawal'
  amount: string
  date: string
  status: 'completed' | 'pending' | 'failed'
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    user: 'Juan García',
    type: 'deposit',
    amount: 'Bs 5,000.00',
    date: '2024-06-08 14:30',
    status: 'completed',
  },
  {
    id: '2',
    user: 'María López',
    type: 'withdrawal',
    amount: 'Bs 2,500.00',
    date: '2024-06-08 13:15',
    status: 'completed',
  },
  {
    id: '3',
    user: 'Carlos Rodríguez',
    type: 'deposit',
    amount: 'Bs 10,000.00',
    date: '2024-06-08 12:45',
    status: 'pending',
  },
  {
    id: '4',
    user: 'Ana Martínez',
    type: 'withdrawal',
    amount: 'Bs 3,200.00',
    date: '2024-06-08 11:20',
    status: 'completed',
  },
  {
    id: '5',
    user: 'Pedro Sánchez',
    type: 'deposit',
    amount: 'Bs 7,500.00',
    date: '2024-06-08 10:00',
    status: 'completed',
  },
]

const statusStyles = {
  completed: 'bg-primary/10 text-primary',
  pending: 'bg-yellow-500/10 text-yellow-600',
  failed: 'bg-destructive/10 text-destructive',
}

export default function RecentTransactions() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-bold text-foreground mb-6">Transacciones Recientes</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Usuario</th>
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Tipo</th>
              <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Monto</th>
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Fecha</th>
              <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Estado</th>
            </tr>
          </thead>
          <tbody>
            {mockTransactions.map((transaction) => (
              <tr key={transaction.id} className="border-b border-border hover:bg-muted/50">
                <td className="py-4 px-4 text-foreground font-medium">{transaction.user}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {transaction.type === 'deposit' ? (
                      <ArrowDownRight className="text-primary" size={16} />
                    ) : (
                      <ArrowUpLeft className="text-muted-foreground" size={16} />
                    )}
                    <span className="text-foreground">
                      {transaction.type === 'deposit' ? 'Depósito' : 'Retiro'}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right text-foreground font-semibold">
                  {transaction.amount}
                </td>
                <td className="py-4 px-4 text-muted-foreground">{transaction.date}</td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
                      statusStyles[transaction.status]
                    }`}
                  >
                    {transaction.status === 'completed' && 'Completada'}
                    {transaction.status === 'pending' && 'Pendiente'}
                    {transaction.status === 'failed' && 'Fallida'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <a
          href="/dashboard/transacciones"
          className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
        >
          Ver todas las transacciones →
        </a>
      </div>
    </div>
  )
}
