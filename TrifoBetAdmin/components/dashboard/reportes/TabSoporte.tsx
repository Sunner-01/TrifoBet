import React from 'react';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText } from 'lucide-react';
import { exportToPDF } from '@/lib/reportes-export';

export function TabSoporte({ eficienciaSoporte, startDate, endDate }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
      <div className="bg-card border border-border p-6 rounded-lg flex flex-col justify-center items-center">
        <h3 className="text-lg font-bold mb-2">Eficiencia de Resolución (SLA)</h3>
        <p className="text-muted-foreground text-sm mb-6 text-center">Proporción de tickets cerrados vs pendientes.</p>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={[
                  { name: 'Cerrados / Resueltos', value: eficienciaSoporte.cerrados, fill: '#00C49F' },
                  { name: 'Abiertos / Pendientes', value: eficienciaSoporte.abiertos, fill: '#FF8042' }
                ]} 
                dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} label
              />
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Problemas por Categoría</h3>
          <button onClick={() => exportToPDF('Soporte Categorias', 'table-soporte', startDate, endDate)} className="p-2 bg-red-600/20 text-red-500 rounded hover:bg-red-600/40" title="Descargar PDF"><FileText size={16} /></button>
        </div>

        <table id="table-soporte" className="w-full text-left border-collapse mt-4">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-3">Categoría</th>
              <th className="p-3 text-right">Cant. Tickets</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(eficienciaSoporte.porCategoria || {}).map(([cat, total], i) => (
              <tr key={i} className="border-b border-border">
                <td className="p-3 font-medium">{cat}</td>
                <td className="p-3 text-right">{total as number}</td>
              </tr>
            ))}
            {Object.keys(eficienciaSoporte.porCategoria || {}).length === 0 && (
              <tr><td colSpan={2} className="p-4 text-center text-muted-foreground">No hay tickets registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
