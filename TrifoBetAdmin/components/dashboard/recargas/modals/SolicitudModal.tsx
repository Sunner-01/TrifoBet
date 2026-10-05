import { useState } from 'react';
import { X, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { apiRecargas } from '@/lib/recargas-api';
import { EstadoBadge } from '../EstadoBadge';

export function SolicitudModal({ solicitud, onClose, onActualizar }: {
  solicitud: any, onClose: () => void, onActualizar: () => void
}) {
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAprobar = async () => {
    setLoading(true); setError('');
    try {
      await apiRecargas(`/recargas/admin/${solicitud.id}/aprobar`, {
        method: 'POST',
        body: JSON.stringify({ notas }),
      });
      onActualizar();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  const handleRechazar = async () => {
    if (!notas.trim()) { setError('Debes escribir el motivo del rechazo.'); return; }
    setLoading(true); setError('');
    try {
      await apiRecargas(`/recargas/admin/${solicitud.id}/rechazar`, {
        method: 'POST',
        body: JSON.stringify({ notas }),
      });
      onActualizar();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-bold text-lg">Solicitud {solicitud.codigo_unico}</h2>
            <p className="text-sm text-muted-foreground">{solicitud.usuario?.nombre} {solicitud.usuario?.apellido1}</p>
          </div>
          <div className="flex items-center gap-3">
            <EstadoBadge estado={solicitud.estado} />
            <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Datos de la solicitud */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/30 rounded-xl p-3">
              <p className="text-muted-foreground text-xs mb-1">Monto solicitado</p>
              <p className="font-bold text-xl text-green-400">Bs {parseFloat(solicitud.monto).toFixed(2)}</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3">
              <p className="text-muted-foreground text-xs mb-1">Código único</p>
              <p className="font-mono font-bold">{solicitud.codigo_unico}</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3">
              <p className="text-muted-foreground text-xs mb-1">Usuario</p>
              <p className="font-medium">{solicitud.usuario?.correo}</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3">
              <p className="text-muted-foreground text-xs mb-1">Nombre titular</p>
              <p className="font-medium">{solicitud.nombre_titular}</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3">
              <p className="text-muted-foreground text-xs mb-1">Fecha solicitud</p>
              <p className="text-xs">{new Date(solicitud.fecha_creacion).toLocaleString('es-PE')}</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3">
              <p className="text-muted-foreground text-xs mb-1">Procesado auto.</p>
              <p className="font-medium">{solicitud.procesado_auto ? <span className="text-green-400">Sí ✓</span> : 'No'}</p>
            </div>
          </div>

          {/* Datos del matching de Yape */}
          {solicitud.yape_nombre_pagador && (
            <div className="border border-violet-500/20 bg-violet-500/5 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Datos capturados de Yape</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Nombre pagador</p>
                  <p className="font-medium">{solicitud.yape_nombre_pagador || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Monto</p>
                  <p className="font-medium">Bs {solicitud.yape_monto || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Score nombre</p>
                  <p className={`font-bold ${solicitud.match_score >= 85 ? 'text-green-400' : 'text-red-400'}`}>
                    {solicitud.match_score ? `${solicitud.match_score}%` : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Comprobante */}
          {solicitud.url_comprobante && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Comprobante subido por el usuario</p>
              <a href={solicitud.url_comprobante} target="_blank" rel="noopener noreferrer"
                className="block relative group">
                <img src={solicitud.url_comprobante} alt="Comprobante" className="w-full rounded-xl border border-border max-h-48 object-contain bg-black/20" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 rounded-xl transition-opacity">
                  <ExternalLink className="text-white w-6 h-6" />
                </div>
              </a>
            </div>
          )}

          {/* Notas y acciones (solo si está pendiente) */}
          {solicitud.estado === 'pendiente' && (
            <div className="space-y-3 pt-2 border-t border-border">
              <textarea
                value={notas}
                onChange={e => setNotas(e.target.value)}
                placeholder="Notas internas (opcional para aprobación, obligatorio para rechazo)..."
                rows={2}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-violet-500"
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleRechazar} disabled={loading}
                  className="flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-medium transition-colors disabled:opacity-50">
                  <XCircle size={16} /> Rechazar
                </button>
                <button onClick={handleAprobar} disabled={loading}
                  className="flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
                  <CheckCircle size={16} /> Aprobar
                </button>
              </div>
            </div>
          )}

          {/* Info si ya fue procesado */}
          {solicitud.estado !== 'pendiente' && solicitud.notas_admin && (
            <div className="bg-muted/30 rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-1">Notas del administrador</p>
              <p className="text-sm">{solicitud.notas_admin}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
