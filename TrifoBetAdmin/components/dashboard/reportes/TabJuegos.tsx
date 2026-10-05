import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileText } from 'lucide-react';
import { exportToPDF, exportToExcelWithChart } from '@/lib/reportes-export';

export function TabJuegos({ rentabilidadCasino, startDate, endDate }: any) {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-card border border-border p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Rentabilidad por Juego de Casino</h3>
          <div className="flex gap-2">
            <button onClick={() => exportToExcelWithChart('Rentabilidad Casino', 'table-rentabilidad', 'chart-rentabilidad', startDate, endDate)} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm"><Download size={14} /> Excel</button>
            <button onClick={() => exportToPDF('Rentabilidad Casino', 'table-rentabilidad', startDate, endDate)} className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm"><FileText size={14} /> PDF</button>
          </div>
        </div>

        <div id="chart-rentabilidad" className="h-80 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rentabilidadCasino} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="juego" />
              <YAxis />
              <Tooltip formatter={(val) => `Bs. ${val}`} />
              <Legend />
              <Bar dataKey="apostado" name="Total Apostado" fill="#0088FE" />
              <Bar dataKey="pagado" name="Premios Pagados" fill="#FF8042" />
              <Bar dataKey="ggr" name="GGR (Ganancia Casa)" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto">
          <table id="table-rentabilidad" className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-3">Juego</th>
                <th className="p-3 text-right">Apostado (Volumen)</th>
                <th className="p-3 text-right">Pagado (Premios)</th>
                <th className="p-3 text-right">GGR (Ganancia Casa)</th>
                <th className="p-3 text-right">Margen (%)</th>
              </tr>
            </thead>
            <tbody>
              {rentabilidadCasino.map((j: any, idx: number) => (
                <tr key={idx} className="border-b border-border hover:bg-muted/30">
                  <td className="p-3 font-medium capitalize">{j.juego.replace('_', ' ')}</td>
                  <td className="p-3 text-right">Bs. {Number(j.apostado).toFixed(2)}</td>
                  <td className="p-3 text-right">Bs. {Number(j.pagado).toFixed(2)}</td>
                  <td className={`p-3 text-right font-bold ${j.ggr >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    Bs. {Number(j.ggr).toFixed(2)}
                  </td>
                  <td className="p-3 text-right text-blue-400">
                    {j.apostado > 0 ? ((j.ggr / j.apostado) * 100).toFixed(2) : 0}%
                  </td>
                </tr>
              ))}
              {rentabilidadCasino.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No hay actividad de casino registrada</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
