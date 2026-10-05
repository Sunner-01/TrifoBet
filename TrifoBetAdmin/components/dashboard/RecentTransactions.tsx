'use client'

import { ArrowUpRight, ArrowDownLeft, Activity } from 'lucide-react'

export default function RecentTransactions({ transactions = [] }: { transactions?: any[] }) {
  return (
    <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500/10 rounded-xl">
          <Activity size={20} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Flujo Reciente</h2>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border/50">
            <tr>
              <th className="px-4 py-3 rounded-tl-xl">Tipo</th>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 rounded-tr-xl text-right">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No hay transacciones recientes
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={`${tx.tipo}-${tx.id}`} className="border-b border-border/30 hover:bg-emerald-500/5 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${tx.tipo === 'Recarga' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {tx.tipo === 'Recarga' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <span className="font-medium text-foreground/90">{tx.tipo}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-muted-foreground group-hover:text-emerald-500 transition-colors">
                    {tx.usuario?.nombre_usuario || 'Desconocido'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold font-mono tracking-tight text-foreground/90">
                      Bs. {Number(tx.monto || 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500">
                      {tx.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
