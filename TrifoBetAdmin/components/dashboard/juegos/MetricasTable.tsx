import React from 'react';
import { JuegoCasino } from '@/lib/api';

interface MetricasTableProps {
  sortedGames: JuegoCasino[];
  handleSort: (key: keyof JuegoCasino) => void;
}

export function MetricasTable({ sortedGames, handleSort }: MetricasTableProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Juego</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-foreground cursor-pointer hover:bg-muted" onClick={() => handleSort('partidasJugadas')}>Partidas</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-foreground cursor-pointer hover:bg-muted" onClick={() => handleSort('montoApostado')}>Total Apostado</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-foreground cursor-pointer hover:bg-muted" onClick={() => handleSort('montoRetorno')}>Retornos</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-foreground cursor-pointer hover:bg-muted" onClick={() => handleSort('gananciaNeta')}>Ganancia (GGR)</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">RTP Real</th>
            </tr>
          </thead>
          <tbody>
            {sortedGames.map((game) => {
              const rtpReal = game.montoApostado ? ((game.montoRetorno || 0) / game.montoApostado) * 100 : 0;
              return (
                <tr key={game.id} className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{game.nombre}</td>
                  <td className="px-6 py-4 text-sm text-center text-foreground">{game.partidasJugadas || 0}</td>
                  <td className="px-6 py-4 text-sm text-right text-foreground">Bs {(game.montoApostado || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-right text-foreground">Bs {(game.montoRetorno || 0).toFixed(2)}</td>
                  <td className={`px-6 py-4 text-sm text-right font-semibold ${(game.gananciaNeta || 0) >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    Bs {(game.gananciaNeta || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-center font-medium">
                    {rtpReal.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
