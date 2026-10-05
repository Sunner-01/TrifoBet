import { Loader2, Check, UploadCloud } from 'lucide-react';
import { TransaccionRetiro } from '@/hooks/useSolicitudesRetiro';

interface ProcesarRetiroModalProps {
  retiro: TransaccionRetiro;
  file: File | null;
  setFile: (file: File | null) => void;
  submitting: boolean;
  onProcess: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function ProcesarRetiroModal({
  retiro,
  file,
  setFile,
  submitting,
  onProcess,
  onClose
}: ProcesarRetiroModalProps) {
  if (!retiro.cuenta_retiro) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card rounded-xl p-6 max-w-lg w-full shadow-2xl border border-border">
        <h3 className="text-xl font-bold mb-4">Procesar Retiro</h3>

        <div className="bg-muted/30 p-4 rounded-lg mb-6 border border-border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Monto a Transferir:</p>
              <p className="text-2xl font-bold text-primary">Bs {retiro.monto.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Billetera Destino:</p>
              <p className="font-semibold uppercase text-blue-400">{retiro.cuenta_retiro.billetera}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Número de Cuenta:</p>
              <p className="font-mono font-medium text-lg">{retiro.cuenta_retiro.numero_cuenta}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Titular:</p>
              <p className="font-medium">{retiro.cuenta_retiro?.nombre_titular || 'Desconocido'}</p>
            </div>
          </div>

          {retiro.cuenta_retiro.qr_url && (
            <div className="mt-4 pt-4 border-t border-border flex flex-col items-center">
              <p className="text-sm text-muted-foreground mb-2">Código QR del Cliente:</p>
              <div className="bg-white p-2 rounded-lg inline-block">
                <img src={retiro.cuenta_retiro.qr_url} alt="QR" className="w-32 h-32 object-contain" />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={onProcess}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-foreground">
              Subir Comprobante de Pago (Obligatorio)
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              {file ? (
                <div className="flex flex-col items-center text-primary">
                  <Check size={24} className="mb-2" />
                  <span className="font-medium">{file.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <UploadCloud size={32} className="mb-2" />
                  <span>Haz clic o arrastra la captura del comprobante aquí</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!file || submitting}
              className="px-6 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Confirmar y Completar Retiro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
