'use client'

import { useState } from 'react'
import { Search, Download, ArrowDownRight, ArrowUpLeft } from 'lucide-react'

interface Transaction {
  id: string
  usuario: string
  tipo: 'deposito' | 'retiro' | 'apuesta' | 'premio'
  monto: number
  metodoPago: string
  fecha: string
  estado: 'completada' | 'pendiente' | 'fallida' | 'aprobada' | 'rechazada'
  concepto: string
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    usuario: 'Juan García',
    tipo: 'deposito',
    monto: 5000,
    metodoPago: 'Transferencia bancaria',
    fecha: '2024-06-08 14:30',
    estado: 'completada',
    concepto: 'Depósito inicial',
  },
  {
    id: '2',
    usuario: 'María López',
    tipo: 'retiro',
    monto: 2500,
    metodoPago: 'Billetera electrónica',
    fecha: '2024-06-08 13:15',
    estado: 'completada',
    concepto: 'Retiro de ganancias',
  },
  {
    id: '3',
    usuario: 'Carlos Rodríguez',
    tipo: 'apuesta',
    monto: 500,
    metodoPago: 'Saldo interno',
    fecha: '2024-06-08 12:45',
    estado: 'completada',
    concepto: 'Apuesta deportiva - Fútbol',
  },
  {
    id: '4',
    usuario: 'Ana Martínez',
    tipo: 'deposito',
    monto: 3000,
    metodoPago: 'Tarjeta de crédito',
    fecha: '2024-06-09 10:20',
    estado: 'pendiente',
    concepto: 'Depósito por transferencia',
  },
  {
    id: '5',
    usuario: 'Roberto Silva',
    tipo: 'premio',
    monto: 1200,
    metodoPago: 'Saldo interno',
    fecha: '2024-06-08 11:20',
    estado: 'completada',
    concepto: 'Premio - Juego de slots',
  },
  {
    id: '6',
    usuario: 'Pedro Sánchez',
    tipo: 'retiro',
    monto: 7500,
    metodoPago: 'Billetera electrónica',
    fecha: '2024-06-09 09:15',
    estado: 'pendiente',
    concepto: 'Retiro de fondos',
  },
]

const statusStyles = {
  completada: 'bg-primary/10 text-primary',
  aprobada: 'bg-green-500/10 text-green-600',
  rechazada: 'bg-red-500/10 text-red-600',
  pendiente: 'bg-yellow-500/10 text-yellow-600',
  fallida: 'bg-destructive/10 text-destructive',
}

const typeColors = {
  deposito: 'text-primary',
  retiro: 'text-muted-foreground',
  apuesta: 'text-blue-400',
  premio: 'text-green-400',
}

export default function TransaccionesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'todos' | Transaction['tipo']>('todos')
  const [filterStatus, setFilterStatus] = useState<'todos' | Transaction['estado']>('todos')

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.metodoPago.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'todos' || t.tipo === filterType
    const matchesStatus = filterStatus === 'todos' || t.estado === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const handleApproveTransaction = (id: string) => {
    setTransactions(
      transactions.map((t) =>
        t.id === id ? { ...t, estado: 'aprobada' as const } : t
      )
    )
  }

  const handleRejectTransaction = (id: string) => {
    setTransactions(
      transactions.map((t) =>
        t.id === id ? { ...t, estado: 'rechazada' as const } : t
      )
    )
  }

  const totalIngresos = transactions
    .filter((t) => (t.tipo === 'deposito' || t.tipo === 'premio') && (t.estado === 'completada' || t.estado === 'aprobada'))
    .reduce((sum, t) => sum + t.monto, 0)

  const totalEgresos = transactions
    .filter((t) => t.tipo === 'retiro' && (t.estado === 'completada' || t.estado === 'aprobada'))
    .reduce((sum, t) => sum + t.monto, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transacciones</h1>
          <p className="text-muted-foreground">Registro completo de movimientos financieros</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors">
          <Download size={20} />
          Exportar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Ingresos Completados</p>
          <p className="text-2xl font-bold text-primary">Bs {totalIngresos.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Egresos Completados</p>
          <p className="text-2xl font-bold text-muted-foreground">Bs {totalEgresos.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Buscar por usuario, concepto o método..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="flex-1 px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="todos">Todos los tipos</option>
            <option value="deposito">Depósitos</option>
            <option value="retiro">Retiros</option>
            <option value="apuesta">Apuestas</option>
            <option value="premio">Premios</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="flex-1 px-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="todos">Todos los estados</option>
            <option value="completada">Completadas</option>
            <option value="pendiente">Pendientes</option>
            <option value="fallida">Fallidas</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Usuario</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Tipo</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Monto</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Concepto</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Método</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Fecha</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Estado</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">
                    {transaction.usuario}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {transaction.tipo === 'deposito' || transaction.tipo === 'premio' ? (
                        <ArrowDownRight className={typeColors[transaction.tipo]} size={16} />
                      ) : (
                        <ArrowUpLeft className={typeColors[transaction.tipo]} size={16} />
                      )}
                      <span className={`capitalize ${typeColors[transaction.tipo]}`}>
                        {transaction.tipo === 'deposito'
                          ? 'Depósito'
                          : transaction.tipo === 'retiro'
                          ? 'Retiro'
                          : transaction.tipo === 'apuesta'
                          ? 'Apuesta'
                          : 'Premio'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-foreground font-semibold">
                    Bs {transaction.monto.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {transaction.concepto}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {transaction.metodoPago}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{transaction.fecha}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
                        statusStyles[transaction.estado]
                      }`}
                    >
                      {transaction.estado === 'completada' && 'Completada'}
                      {transaction.estado === 'aprobada' && 'Aprobada'}
                      {transaction.estado === 'rechazada' && 'Rechazada'}
                      {transaction.estado === 'pendiente' && 'Pendiente'}
                      {transaction.estado === 'fallida' && 'Fallida'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {transaction.estado === 'pendiente' && (transaction.tipo === 'deposito' || transaction.tipo === 'retiro') ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleApproveTransaction(transaction.id)}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleRejectTransaction(transaction.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          Rechazar
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No se encontraron transacciones que coincidan con tu búsqueda
          </div>
        )}
      </div>
    </div>
  )
}
