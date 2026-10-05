import { Loader2, X } from 'lucide-react';

interface RechazarRetiroModalProps {
  submitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function RechazarRetiroModal({
  submitting,
  onConfirm,
  onClose
}: RechazarRetiroModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border w-full max-w-sm rounded-xl shadow-lg overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-border bg-muted/20">
          <h3 className="font-semibold text-foreground">Confirmar Rechazo</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={submitting}
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <X className="text-destructive w-6 h-6" />
          </div>
          <p className="text-foreground text-sm">
            ¿Estás seguro de que deseas rechazar este retiro?
          </p>
          <p className="text-muted-foreground text-xs mt-2">
            El saldo retenido será devuelto automáticamente al usuario.
          </p>
        </div>
        <div className="p-4 bg-muted/20 border-t border-border flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-destructive-foreground bg-destructive rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Sí, Rechazar
          </button>
        </div>
      </div>
    </div>
  );
}
