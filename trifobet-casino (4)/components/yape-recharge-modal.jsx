"use client"

import { useState, useEffect, useRef } from "react"
import { CheckCircle, Clock, XCircle, Upload, QrCode, ShieldCheck, AlertCircle, Copy, RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { getStoredUser, getStoredToken } from "@/lib/auth"
import { API_Back_Url } from "@/lib/config"
import Image from "next/image"
import Link from "next/link"

const MONTO_MIN = 1
const MONTO_MAX = 2000

// Simula la "generación" del QR con un efecto de escaneo
function QRDisplay({ isGenerating }) {
  return (
    <div className="relative flex flex-col items-center gap-3">
      <div className={`relative p-3 bg-white rounded-2xl shadow-xl ${isGenerating ? "animate-pulse" : ""}`}>
        {isGenerating && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent animate-[scan_1.5s_linear_infinite]" style={{ animation: "scan 1.5s linear infinite" }} />
          </div>
        )}
        <Image
          src="/qr-yape.jpeg"
          alt="QR Yape TrifoBet"
          width={200}
          height={200}
          className={`rounded-xl transition-all duration-500 ${isGenerating ? "blur-[2px]" : "blur-0"}`}
          priority
        />
      </div>
      {isGenerating ? (
        <p className="text-xs text-violet-400 animate-pulse">Generando QR seguro...</p>
      ) : (
        <p className="text-xs text-muted-foreground">Escanea con la app de Yape</p>
      )}
    </div>
  )
}

function EstadoBadge({ estado }) {
  if (estado === "aprobado") return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Aprobado</Badge>
  if (estado === "rechazado") return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Rechazado</Badge>
  return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>
}

export default function YapeRechargeModal({ isOpen, onClose }) {
  const [user, setUser] = useState(null)
  const [step, setStep] = useState(1) // 1: monto, 2: pago+comprobante, 3: confirmado
  const [monto, setMonto] = useState("")
  const [aceptaTitular, setAceptaTitular] = useState(false)
  const [solicitud, setSolicitud] = useState(null)
  const [comprobante, setComprobante] = useState(null)
  const [previewComprobante, setPreviewComprobante] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingHistorial, setLoadingHistorial] = useState(false)
  const [historial, setHistorial] = useState([])
  const [error, setError] = useState("")
  const [isQrGenerating, setIsQrGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      const u = getStoredUser()
      setUser(u)
      cargarHistorial()
    }
  }, [isOpen])

  // Polling de estado de la solicitud activa
  useEffect(() => {
    if (!isOpen || !solicitud || solicitud.estado !== "pendiente") return
    const interval = setInterval(async () => {
      try {
        const token = getStoredToken()
        const res = await fetch(`${API_Back_Url}/recargas/mis-solicitudes`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          const actualizada = data.find(s => s.id === solicitud.id)
          if (actualizada && actualizada.estado !== "pendiente") {
            setSolicitud(actualizada)
            cargarHistorial()
            if (actualizada.estado === "aprobado") setStep(3)
          }
        }
      } catch {}
    }, 8000) // Cada 8 segundos
    return () => clearInterval(interval)
  }, [solicitud, isOpen])

  const cargarHistorial = async () => {
    setLoadingHistorial(true)
    try {
      const token = getStoredToken()
      if (!token) return
      const res = await fetch(`${API_Back_Url}/recargas/mis-solicitudes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) setHistorial(await res.json())
    } catch {} finally {
      setLoadingHistorial(false)
    }
  }

  const handleCrearSolicitud = async (e) => {
    e.preventDefault()
    setError("")
    const montoNum = parseFloat(monto)
    if (!montoNum || montoNum < MONTO_MIN) return setError(`El monto mínimo es Bs ${MONTO_MIN}.`)
    if (montoNum > MONTO_MAX) return setError(`El monto máximo es Bs ${MONTO_MAX}.`)
    if (!aceptaTitular) return setError("Debes confirmar que el pago será realizado desde tu cuenta personal.")

    setLoading(true)
    setIsQrGenerating(true)
    try {
      const token = getStoredToken()
      const res = await fetch(`${API_Back_Url}/recargas/solicitud`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ monto: montoNum, aceptaTitular: true })
      })
      const data = await res.json()
      if (!res.ok) {
        const errMsg = Array.isArray(data.message) ? data.message.join(", ") : (data.message || "Error al crear la solicitud")
        throw new Error(errMsg)
      }
      
      await new Promise(r => setTimeout(r, 1800))
      setIsQrGenerating(false)
      setSolicitud(data.solicitud)
      setStep(2)
    } catch (err) {
      setIsQrGenerating(false)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleComprobanteChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setComprobante(file)
    setPreviewComprobante(URL.createObjectURL(file))
  }

  const handleSubirComprobante = async () => {
    if (!comprobante || !solicitud) return
    setLoading(true)
    setError("")
    try {
      const token = getStoredToken()
      const formData = new FormData()
      formData.append("comprobante", comprobante)
      const res = await fetch(`${API_Back_Url}/recargas/comprobante/${solicitud.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Error al subir el comprobante")
      
      setSolicitud(prev => ({ ...prev, url_comprobante: data.urlComprobante }))
      cargarHistorial()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copiarCodigo = () => {
    if (!solicitud?.codigo_unico) return
    navigator.clipboard.writeText(solicitud.codigo_unico)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const montosSugeridos = [10, 20, 50, 100, 200, 500]

  // Resetear el estado al cerrar
  const handleClose = () => {
    if (step === 3) {
      // Si se completó con éxito, recargar la data del usuario en la app disparando evento
      window.dispatchEvent(new CustomEvent('auth-change'))
    }
    setStep(1)
    setMonto("")
    setAceptaTitular(false)
    setSolicitud(null)
    setComprobante(null)
    setPreviewComprobante(null)
    setError("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-0 border-violet-500/20 bg-gradient-to-br from-background to-violet-950/20 hide-close">
        <style>{`
          @keyframes scan {
            0% { top: 0%; }
            100% { top: 100%; }
          }
          /* Ocultamos el botón de cierre por defecto para poner el nuestro */
          .hide-close > button {
            display: none;
          }
        `}</style>

        {/* Botón de cierre personalizado */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <DialogTitle className="sr-only">Recarga vía Yape</DialogTitle>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-4">
              <QrCode className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-violet-300 font-medium">Recargar saldo</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-violet-300 bg-clip-text text-transparent">
              Recarga vía Yape
            </h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-md mx-auto">
              Transfiere el monto deseado al QR y sube tu comprobante. Tu saldo se acreditará automáticamente.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel Izquierdo: Flujo de Recarga */}
            <div className="space-y-4">
              {/* PASO 1: Monto y confirmación */}
              {step === 1 && (
                <div className="bg-card/80 backdrop-blur border border-border rounded-2xl p-6 space-y-5">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-bold">1</span>
                    Ingresa el monto
                  </h2>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Montos sugeridos</label>
                    <div className="grid grid-cols-3 gap-2">
                      {montosSugeridos.map(m => (
                        <button
                          key={m}
                          onClick={() => setMonto(String(m))}
                          className={`py-2 rounded-xl text-sm font-semibold border transition-all ${monto === String(m) ? "bg-violet-600 border-violet-500 text-white" : "bg-muted/50 border-transparent hover:border-violet-500/50 text-muted-foreground"}`}
                        >
                          Bs {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">O ingresa otro monto</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">Bs </span>
                      <input
                        type="number"
                        value={monto}
                        onChange={e => setMonto(e.target.value)}
                        placeholder="0.00"
                        min={MONTO_MIN}
                        max={MONTO_MAX}
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-xl font-bold text-right focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Mín. Bs {MONTO_MIN} · Máx. Bs {MONTO_MAX}</p>
                  </div>

                  {/* Check de titular */}
                  <label className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-all ${aceptaTitular ? "border-violet-500/40 bg-violet-500/5" : "border-border hover:border-violet-500/30"}`}>
                    <div className={`w-5 h-5 mt-0.5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${aceptaTitular ? "bg-violet-600 border-violet-600" : "border-muted-foreground"}`}
                      onClick={() => setAceptaTitular(!aceptaTitular)}>
                      {aceptaTitular && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      <span className="text-foreground font-medium">Confirmo que soy el titular de la cuenta depositante.</span>{" "}
                      El pago se realizará desde una cuenta registrada a nombre de{" "}
                      <span className="text-violet-400 font-semibold">
                        {user?.nombre} {user?.apellido1} {user?.apellido2 ? user.apellido2 : ""}
                      </span>,
                      titular de esta cuenta TrifoBet.
                    </span>
                  </label>

                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={handleCrearSolicitud}
                    disabled={loading || !monto || !aceptaTitular}
                    className="w-full h-12 bg-violet-600 hover:bg-violet-700 rounded-xl font-semibold text-base"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" />Generando...</span>
                    ) : (
                      <span className="flex items-center gap-2"><QrCode className="w-4 h-4" />Generar QR de Pago</span>
                    )}
                  </Button>
                </div>
              )}

              {/* PASO 2: Pago + comprobante */}
              {step === 2 && solicitud && (
                <div className="bg-card/80 backdrop-blur border border-border rounded-2xl p-6 space-y-5">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-bold">2</span>
                    Realiza el pago
                  </h2>

                  <div className="flex flex-col items-center">
                    <QRDisplay isGenerating={false} />
                  </div>

                  {/* Datos del pago */}
                  <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Monto a pagar</span>
                      <span className="text-xl font-bold text-violet-400">Bs {parseFloat(solicitud.monto).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Código único</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-foreground">{solicitud.codigo_unico}</span>
                        <button onClick={copiarCodigo} className="text-muted-foreground hover:text-violet-400 transition-colors">
                          {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estado</span>
                      <EstadoBadge estado={solicitud.estado} />
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300">
                    💡 Puedes incluir el código <strong>{solicitud.codigo_unico}</strong> en la referencia del pago para ayudarnos a identificarlo más rápido.
                  </div>

                  {/* Upload comprobante */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-bold">3</span>
                      Sube tu comprobante
                    </h3>

                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleComprobanteChange} />

                    {previewComprobante ? (
                      <div className="space-y-3">
                        <div className="relative rounded-xl overflow-hidden border border-border">
                          <img src={previewComprobante} alt="Comprobante" className="w-full max-h-48 object-contain bg-black/20" />
                          <button onClick={() => { setComprobante(null); setPreviewComprobante(null); }}
                            className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors">
                            ✕
                          </button>
                        </div>
                        {!solicitud.url_comprobante && (
                          <Button onClick={handleSubirComprobante} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 rounded-xl">
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                            {loading ? "Subiendo..." : "Confirmar y enviar comprobante"}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <button onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-border hover:border-violet-500/50 rounded-xl p-6 text-center transition-all group">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground group-hover:text-violet-400 transition-colors" />
                        <p className="text-sm font-medium group-hover:text-violet-400 transition-colors">Toca para subir el comprobante</p>
                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG o WEBP · Máx 5MB</p>
                      </button>
                    )}

                    {solicitud.url_comprobante && (
                      <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        Comprobante recibido. Tu solicitud está siendo procesada...
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                    </div>
                  )}
                </div>
              )}

              {/* PASO 3: Aprobado */}
              {step === 3 && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-green-400">¡Recarga aprobada!</h2>
                  <p className="text-muted-foreground text-sm">
                    Se acreditaron <span className="text-green-400 font-bold">Bs {parseFloat(solicitud?.monto || 0).toFixed(2)}</span> a tu cuenta.
                  </p>
                  <Button onClick={() => { setStep(1); setSolicitud(null); setMonto(""); setComprobante(null); setPreviewComprobante(null); cargarHistorial(); }}
                    className="bg-green-600 hover:bg-green-700 rounded-xl">
                    Realizar otra recarga
                  </Button>
                </div>
              )}
            </div>

            {/* Panel Derecho: QR + Info + Historial */}
            <div className="space-y-4">
              {/* QR Preview cuando estamos en paso 1 */}
              {step === 1 && (
                <div className="bg-card/80 backdrop-blur border border-border rounded-2xl p-6">
                  <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-violet-400" />
                    QR de Yape TrifoBet
                  </h2>
                  <QRDisplay isGenerating={isQrGenerating} />
                  <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-violet-400 flex-shrink-0" />
                      <span>Transferencias verificadas automáticamente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-violet-400 flex-shrink-0" />
                      <span>Acreditación en minutos</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Historial de solicitudes */}
              <div className="bg-card/80 backdrop-blur border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-violet-400" />
                    Mis recargas
                  </h2>
                  <button onClick={cargarHistorial} className="text-muted-foreground hover:text-violet-400 transition-colors">
                    <RefreshCw className={`w-4 h-4 ${loadingHistorial ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {historial.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No tienes recargas aún.</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {historial.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                        <div>
                          <p className="font-mono text-xs text-muted-foreground">{s.codigo_unico}</p>
                          <p className="font-semibold text-sm">Bs {parseFloat(s.monto).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{new Date(s.fecha_creacion).toLocaleString("es-PE")}</p>
                        </div>
                        <EstadoBadge estado={s.estado} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Aviso si no está verificado */}
              {user && !user.verificado && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 text-sm text-orange-300">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Cuenta no verificada</p>
                      <p className="text-xs text-orange-300/70 mt-1">
                        Las recargas de cuentas no verificadas requieren revisión manual y pueden tardar más.{" "}
                        <Link href="/perfil" className="underline hover:text-orange-200" onClick={handleClose}>Verificar mi cuenta →</Link>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
