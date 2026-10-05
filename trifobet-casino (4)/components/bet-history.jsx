"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  Loader2, Trophy, XCircle, Clock, RefreshCw,
  Search, Filter, ChevronDown, ChevronUp, Wallet,
  TrendingUp, DollarSign, History,
} from "lucide-react"
import { apiGet, apiPost } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

// ─── Helpers ─────────────────────────────────────────────────

const safeDate = (val) => {
  if (!val) return null
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d
}

const formatDate = (val) => {
  const d = safeDate(val)
  if (!d) return "—"
  return d.toLocaleString("es-BO", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

const fmtBetId = (id) => `TRF-${String(id).padStart(8, "0")}`

const ESTADO_CONFIG = {
  pendiente: { label: "Pendiente", icon: Clock,    cls: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30" },
  ganada:    { label: "Ganada",    icon: Trophy,    cls: "bg-green-500/10  text-green-500  border border-green-500/30"  },
  perdida:   { label: "Perdida",   icon: XCircle,   cls: "bg-red-500/10    text-red-500    border border-red-500/30"    },
  cashout:   { label: "Cashout",   icon: RefreshCw, cls: "bg-blue-500/10   text-blue-500   border border-blue-500/30"   },
}

const TIPO_CONFIG = {
  simple:    { label: "Simple",    cls: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30" },
  combinada: { label: "Combinada", cls: "bg-purple-500/10 text-purple-400 border border-purple-500/30" },
  sistema:   { label: "Sistema",   cls: "bg-cyan-500/10   text-cyan-400   border border-cyan-500/30"   },
}

function StatusBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.pendiente
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.cls}`}>
      <Icon size={10} />
      {cfg.label}
    </span>
  )
}

// ─── Tarjeta de Apuesta ───────────────────────────────────────

function BetCard({ bet, onCashout }) {
  const [expanded, setExpanded] = useState(false)
  const tipoCfg = TIPO_CONFIG[bet.tipo] || TIPO_CONFIG.simple
  const sels = bet.selecciones || []

  const dateStr = formatDate(bet.fechaCreacion || bet.fecha_creacion || bet.fecha_apuesta || bet.created_at)
  const potencial = Number(bet.gananciaPotencial ?? bet.ganancia_potencial ?? 0)
  const cashoutAmt = Number(bet.montoCashout ?? bet.monto_cashout ?? 0)

  const accentColor =
    bet.estado === "ganada" ? "border-l-green-500" :
    bet.estado === "perdida" ? "border-l-red-500" :
    bet.estado === "cashout" ? "border-l-blue-500" :
    "border-l-yellow-400"

  return (
    <div className={`border border-border border-l-4 ${accentColor} rounded-xl overflow-hidden bg-card`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tipoCfg.cls}`}>{tipoCfg.label.toUpperCase()}</span>
          <span className="font-mono text-xs text-muted-foreground">{fmtBetId(bet.id)}</span>
          <StatusBadge estado={bet.estado} />
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-bold">Bs {Number(bet.monto).toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground">{dateStr}</p>
          </div>
          {expanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </div>
      </div>

      {/* Selecciones expandidas */}
      {expanded && (
        <div className="border-t border-border bg-muted/10 px-3 py-3 space-y-3">
          {/* Cuota y ganancia */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-card rounded-lg p-2 border border-border">
              <p className="text-muted-foreground">Cuota</p>
              <p className="font-bold text-base text-foreground">{Number(bet.cuotaTotal ?? bet.cuota_total ?? 0).toFixed(2)}x</p>
            </div>
            <div className="bg-card rounded-lg p-2 border border-border">
              <p className="text-muted-foreground">Monto</p>
              <p className="font-bold text-base text-foreground">Bs {Number(bet.monto).toFixed(2)}</p>
            </div>
            <div className="bg-card rounded-lg p-2 border border-border">
              <p className="text-muted-foreground">{bet.estado === "cashout" ? "Cashout" : "Potencial"}</p>
              <p className={`font-bold text-base ${bet.estado === "ganada" ? "text-green-400" : bet.estado === "cashout" ? "text-blue-400" : "text-foreground"}`}>
                Bs {bet.estado === "cashout" ? cashoutAmt.toFixed(2) : potencial.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Selecciones */}
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Selecciones ({sels.length})</p>
            {sels.map((sel, i) => (
              <div key={sel.id || i} className="bg-card border border-border rounded-lg px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{sel.eventoNombre || sel.evento_nombre || "—"}</p>
                    <p className="text-[10px] text-muted-foreground">{sel.mercado}</p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-primary">{Number(sel.cuota).toFixed(2)}x</span>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] font-medium text-foreground">{sel.seleccionDisplay || sel.seleccion}</span>
                  {sel.resultado === true  && <span className="text-[10px] text-green-400 font-bold">✓ Correcto</span>}
                  {sel.resultado === false && <span className="text-[10px] text-red-400 font-bold">✗ Incorrecto</span>}
                  {sel.resultado === null  && bet.estado === "pendiente" && <span className="text-[10px] text-yellow-400">⏳</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Cashout action */}
          {bet.estado === "pendiente" && (
            <div className="flex items-center justify-between pt-1 border-t border-border">
              <p className="text-[11px] text-muted-foreground">
                Retorno aprox: <span className="font-semibold text-foreground">Bs {(Number(bet.monto) * 0.85).toFixed(2)}</span>
              </p>
              <Button
                size="sm"
                className="h-7 text-[11px] px-3"
                onClick={() => onCashout(bet.id)}
              >
                Cerrar Apuesta
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────

export default function BetHistory() {
  const [bets, setBets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterTab, setFilterTab] = useState("todas")   // todas | pendiente | ganada | perdida | cashout
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState("recientes") // recientes | antiguas | monto_mayor | monto_menor
  const [stats, setStats] = useState({ total: 0, pendientes: 0, ganadas: 0, perdidas: 0, cashouts: 0, volumen: 0, ganado: 0 })
  const { toast } = useToast()

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet("/apuestas-deportivas/historial?limit=100")
      let list = []
      if (Array.isArray(data)) list = data
      else if (data?.apuestas) list = data.apuestas
      else if (data?.data) list = data.data

      setBets(list)

      // Calcular stats
      const pendientes = list.filter(b => b.estado === "pendiente")
      const ganadas = list.filter(b => b.estado === "ganada")
      const perdidas = list.filter(b => b.estado === "perdida")
      const cashouts = list.filter(b => b.estado === "cashout")
      const volumen = list.reduce((acc, b) => acc + Number(b.monto || 0), 0)
      const ganado  = ganadas.reduce((acc, b) => acc + Number(b.gananciaPotencial ?? b.ganancia_potencial ?? 0), 0)

      setStats({ total: list.length, pendientes: pendientes.length, ganadas: ganadas.length, perdidas: perdidas.length, cashouts: cashouts.length, volumen, ganado })
    } catch (err) {
      console.error("Error fetching history:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const handleCashout = async (betId) => {
    try {
      const res = await apiPost(`/apuestas-deportivas/${betId}/cashout`)
      toast({ title: "Apuesta Cerrada", description: `Has recuperado Bs ${res.montoDevuelto?.toFixed(2) ?? "—"}` })
      fetchHistory()
      window.dispatchEvent(new CustomEvent("balance-updated"))
    } catch (e) {
      toast({ title: "Error al cerrar", description: e.message || "No se pudo hacer cashout", variant: "destructive" })
    }
  }

  // Filtrar y ordenar
  const filtered = bets
    .filter(bet => {
      if (filterTab !== "todas" && bet.estado !== filterTab) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const inId = fmtBetId(String(bet.id)).toLowerCase().includes(q) || String(bet.id).includes(q)
        const inEvento = (bet.selecciones || []).some(s =>
          (s.eventoNombre || s.evento_nombre || "").toLowerCase().includes(q) ||
          (s.seleccionDisplay || s.seleccion || "").toLowerCase().includes(q)
        )
        if (!inId && !inEvento) return false
      }
      return true
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "antiguas":    return new Date(a.fechaCreacion || a.created_at) - new Date(b.fechaCreacion || b.created_at)
        case "monto_mayor": return Number(b.monto) - Number(a.monto)
        case "monto_menor": return Number(a.monto) - Number(b.monto)
        default:            return new Date(b.fechaCreacion || b.created_at) - new Date(a.fechaCreacion || a.created_at)
      }
    })

  const TABS = [
    { key: "todas",    label: "Todas",     count: stats.total },
    { key: "pendiente",label: "Pendientes",count: stats.pendientes },
    { key: "ganada",   label: "Ganadas",   count: stats.ganadas },
    { key: "perdida",  label: "Perdidas",  count: stats.perdidas },
    { key: "cashout",  label: "Cashout",   count: stats.cashouts },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3 border-b border-border bg-muted/20">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Apostado</p>
          <p className="text-sm font-bold text-foreground">Bs {stats.volumen.toFixed(2)}</p>
        </div>
        <div className="text-center border-x border-border">
          <p className="text-[10px] text-muted-foreground uppercase">Ganado</p>
          <p className="text-sm font-bold text-green-400">Bs {stats.ganado.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Apuestas</p>
          <p className="text-sm font-bold text-foreground">{stats.total}</p>
        </div>
      </div>

      {/* Tabs de estado */}
      <div className="flex border-b border-border overflow-x-auto shrink-0">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
              filterTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                filterTab === tab.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Búsqueda y ordenado */}
      <div className="flex gap-2 px-4 py-2.5 border-b border-border shrink-0">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID o evento..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          className="text-xs px-2 py-1 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-8"
        >
          <option value="recientes">Más recientes</option>
          <option value="antiguas">Más antiguas</option>
          <option value="monto_mayor">Mayor monto</option>
          <option value="monto_menor">Menor monto</option>
        </select>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={fetchHistory} disabled={loading}>
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      {/* Lista */}
      <ScrollArea className="flex-1 px-4 py-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Cargando apuestas...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-50">
            <History size={40} className="text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Sin apuestas</p>
            <p className="text-xs text-muted-foreground">
              {searchQuery ? "No hay resultados para tu búsqueda" : `No tienes apuestas ${filterTab !== "todas" ? filterTab + "s" : ""}`}
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-6">
            <p className="text-[10px] text-muted-foreground">
              Mostrando <strong>{filtered.length}</strong> de <strong>{bets.length}</strong> apuestas
            </p>
            {filtered.map(bet => (
              <BetCard key={bet.id} bet={bet} onCashout={handleCashout} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
