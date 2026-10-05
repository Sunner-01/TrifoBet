import React from 'react';
import { Download, FileText } from 'lucide-react';
import { exportToPDF, exportToExcelWithChart } from '@/lib/reportes-export';

export function TabJugadores({ topJugadores, startDate, endDate }: any) {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-card border border-border p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Top Jugadores (Mayor Volumen Apostado)</h3>
          <div className="flex gap-2">
            <button onClick={() => exportToExcelWithChart('Top Jugadores', 'table-top-jugadores', undefined, startDate, endDate)} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm"><Download size={14} /> Excel</button>
            <button onClick={() => exportToPDF('Top Jugadores', 'table-top-jugadores', startDate, endDate)} className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm"><FileText size={14} /> PDF</button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table id="table-top-jugadores" className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-3">#</th>
                <th className="p-3">ID Usuario</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Correo</th>
                <th className="p-3 text-right">Volumen Apostado</th>
              </tr>
            </thead>
            <tbody>
              {topJugadores.map((jugador: any, idx: number) => (
                <tr key={jugador.usuario?.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-3 font-bold text-muted-foreground">{idx + 1}</td>
                  <td className="p-3">{jugador.usuario?.id}</td>
                  <td className="p-3">{jugador.usuario?.nombre} {jugador.usuario?.apellido1}</td>
                  <td className="p-3">{jugador.usuario?.correo}</td>
                  <td className="p-3 text-right font-bold text-green-500">Bs. {Number(jugador.total).toFixed(2)}</td>
                </tr>
              ))}
              {topJugadores.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No hay datos suficientes</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
