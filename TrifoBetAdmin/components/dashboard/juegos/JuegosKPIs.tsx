import React from 'react';

interface JuegosKPIsProps {
  globalMontoApostado: number;
  globalMontoRetorno: number;
  globalGananciaNeta: number;
  globalPartidasJugadas: number;
}

export function JuegosKPIs({
  globalMontoApostado,
  globalMontoRetorno,
  globalGananciaNeta,
  globalPartidasJugadas
}: JuegosKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-sm font-medium text-muted-foreground mb-2">Total Apostado (Volumen)</p>
        <p className="text-2xl font-bold text-foreground">Bs {globalMontoApostado.toFixed(2)}</p>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-sm font-medium text-muted-foreground mb-2">Retornos a Usuarios</p>
        <p className="text-2xl font-bold text-foreground">Bs {globalMontoRetorno.toFixed(2)}</p>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-sm font-medium text-muted-foreground mb-2">Ganancia Neta (GGR)</p>
        <p className={`text-2xl font-bold ${globalGananciaNeta >= 0 ? 'text-primary' : 'text-destructive'}`}>
          Bs {globalGananciaNeta.toFixed(2)}
        </p>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-sm font-medium text-muted-foreground mb-2">Partidas Totales</p>
        <p className="text-2xl font-bold text-primary">{globalPartidasJugadas}</p>
      </div>
    </div>
  );
}
