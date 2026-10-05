import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText } from 'lucide-react';
import { exportToPDF, exportToExcelWithChart } from '@/lib/reportes-export';

const COLORS = ['#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#AF19FF'];

export function TabFinanzas({ ggr, cashflow, depositosMetodo, startDate, endDate }: any) {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">GGR (Gross Gaming Revenue)</p>
          <h3 className="text-2xl font-bold text-green-500">Bs. {ggr.ggr.toFixed(2)}</h3>
          <p className="text-xs text-muted-foreground mt-2">Apostado: Bs.{ggr.totalApostado.toFixed(2)} | Pagado: Bs.{ggr.totalPagado.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Flujo de Caja Real</p>
          <h3 className={`text-2xl font-bold ${cashflow.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            Bs. {cashflow.balance.toFixed(2)}
          </h3>
          <p className="text-xs text-muted-foreground mt-2">Ingresos: Bs.{cashflow.totalDepositos.toFixed(2)} | Egresos: Bs.{cashflow.totalRetiros.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Margen (GGR / Apostado)</p>
          <h3 className="text-2xl font-bold text-blue-500">
            {ggr.totalApostado > 0 ? ((ggr.ggr / ggr.totalApostado) * 100).toFixed(1) : 0}%
          </h3>
        </div>
      </div>

      {/* Graficos Financieros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-4">Ingresos y Egresos (Cashflow)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Depósitos Entrantes', monto: cashflow.totalDepositos, fill: '#00C49F' },
                { name: 'Retiros Pagados', monto: cashflow.totalRetiros, fill: '#FF8042' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(val) => `Bs. ${val}`} />
                <Bar dataKey="monto" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Depósitos por Método de Pago</h3>
            <div className="flex gap-2">
              <button onClick={() => exportToExcelWithChart('Depositos por Metodo', 'table-metodos', 'chart-metodos', startDate, endDate)} className="p-2 bg-green-600/20 text-green-500 rounded hover:bg-green-600/40" title="Excel"><Download size={16} /></button>
              <button onClick={() => exportToPDF('Depositos por Metodo', 'table-metodos', startDate, endDate)} className="p-2 bg-red-600/20 text-red-500 rounded hover:bg-red-600/40" title="PDF"><FileText size={16} /></button>
            </div>
          </div>
          <div id="chart-metodos" className="h-64 flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie data={depositosMetodo} dataKey="total" nameKey="metodo" cx="50%" cy="50%" outerRadius={80} label>
                  {depositosMetodo.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `Bs. ${val}`} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="w-1/2 overflow-y-auto max-h-64 pl-4">
              <table id="table-metodos" className="w-full text-sm">
                <thead className="bg-muted">
                  <tr><th className="text-left p-2">Método</th><th className="text-right p-2">Total (Bs)</th></tr>
                </thead>
                <tbody>
                  {depositosMetodo.map((m: any, i: number) => (
                    <tr key={i} className="border-b border-border">
                      <td className="p-2">{m.metodo}</td>
                      <td className="p-2 text-right font-medium">{Number(m.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
