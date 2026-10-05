import React from 'react';
import { ShieldAlert } from 'lucide-react';

export function AccesoDenegado() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
      <ShieldAlert size={64} className="text-red-500/50" />
      <h2 className="text-2xl font-bold">Acceso Denegado</h2>
      <p className="text-muted-foreground">No tienes permisos para ver o gestionar al personal administrativo.</p>
    </div>
  );
}
