import { useState, useEffect } from 'react'
import { X, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { VerificacionAdmin, procesarVerificacion } from '@/lib/api'
import Image from 'next/image'

interface VerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  verificacion: VerificacionAdmin | null
}

export default function VerificationModal({
  isOpen,
  onClose,
  onSaved,
  verificacion
}: VerificationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accion, setAccion] = useState<'aprobar' | 'rechazar' | null>(null)
  const [motivo, setMotivo] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setAccion(null)
      setMotivo('')
      setError(null)
      setImagePreview(null)
    }
  }, [isOpen])

  if (!isOpen || !verificacion) return null

  const handleAction = async (tipo: 'aprobar' | 'rechazar') => {
    if (tipo === 'rechazar' && !motivo.trim()) {
      setError('Debes especificar un motivo para el rechazo')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await procesarVerificacion(verificacion.id, tipo, motivo)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la verificación')
      setIsSubmitting(false)
    }
  }

  const isPendiente = verificacion.estado === 'pendiente'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div
        className="bg-card border border-border w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Revisión de Identidad (KYC)
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Usuario: <span className="font-medium text-foreground">{verificacion.usuario?.nombre} {verificacion.usuario?.apellido1}</span> ({verificacion.usuario?.correo})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted text-muted-foreground rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          {!isPendiente && (
            <div className={`mb-6 p-4 rounded-lg border ${verificacion.estado === 'aprobado'
                ? 'bg-green-500/10 border-green-500/30 text-green-500'
                : 'bg-red-500/10 border-red-500/30 text-red-500'
              }`}>
              <h3 className="font-bold flex items-center gap-2">
                {verificacion.estado === 'aprobado' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                Esta solicitud ya fue {verificacion.estado.toUpperCase()}
              </h3>
              {verificacion.notas_rechazo && (
                <p className="mt-2 text-sm">Motivo: {verificacion.notas_rechazo}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-foreground flex items-center gap-2">Anverso del Documento <span className="text-xs text-muted-foreground font-normal">(Doble clic para ampliar)</span></h3>
              <div
                className="relative aspect-[1.6/1] w-full bg-muted rounded-lg overflow-hidden border border-border group cursor-pointer"
                onDoubleClick={() => setImagePreview(verificacion.url_imagen_anverso)}
              >
                <Image
                  src={verificacion.url_imagen_anverso}
                  alt="Anverso"
                  fill
                  className="object-contain transition-transform group-hover:scale-105"
                  unoptimized
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-foreground flex items-center gap-2">Reverso del Documento <span className="text-xs text-muted-foreground font-normal">(Doble clic para ampliar)</span></h3>
              <div
                className="relative aspect-[1.6/1] w-full bg-muted rounded-lg overflow-hidden border border-border group cursor-pointer"
                onDoubleClick={() => setImagePreview(verificacion.url_imagen_reverso)}
              >
                <Image
                  src={verificacion.url_imagen_reverso}
                  alt="Reverso"
                  fill
                  className="object-contain transition-transform group-hover:scale-105"
                  unoptimized
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-6 bg-muted/30 p-4 rounded-lg border border-border">
            <div>
              <p className="text-sm text-muted-foreground">Documento de Identidad (CI Registrado)</p>
              <p className="font-mono text-lg font-medium text-foreground">{verificacion.usuario?.ci || 'No proporcionado'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Subida</p>
              <p className="text-foreground font-medium">{new Date(verificacion.fecha_subida).toLocaleString('es-BO')}</p>
            </div>
          </div>

          {/* Acciones de Rechazo */}
          {accion === 'rechazar' && (
            <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-4">
              <label className="block text-sm font-medium text-foreground">Motivo del rechazo</label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej. La imagen está borrosa, el documento está expirado..."
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[100px] resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {isPendiente && (
          <div className="p-6 border-t border-border bg-muted/20 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 hover:bg-muted text-foreground rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>

            {accion === 'rechazar' ? (
              <button
                onClick={() => handleAction('rechazar')}
                disabled={isSubmitting}
                className="px-6 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                Confirmar Rechazo
              </button>
            ) : (
              <>
                <button
                  onClick={() => setAccion('rechazar')}
                  className="px-6 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <XCircle size={18} />
                  Rechazar
                </button>
                <button
                  onClick={() => handleAction('aprobar')}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                  Aprobar Documento
                </button>
              </>
            )}
          </div>
        )}
      </div>
      {/* Image Preview Overlay */}
      {imagePreview && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-8 bg-black/90 backdrop-blur-md cursor-pointer animate-in fade-in"
          onClick={() => setImagePreview(null)}
        >
          <div className="relative w-full max-w-5xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <Image
              src={imagePreview}
              alt="Vista previa ampliada"
              fill
              className="object-contain"
              unoptimized
            />
            <button
              onClick={() => setImagePreview(null)}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
            >
              <X size={32} />
            </button>
            <div className="absolute -bottom-10 left-0 right-0 text-center text-white/70 text-sm">
              Haz clic fuera de la imagen o en la X para cerrar
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
