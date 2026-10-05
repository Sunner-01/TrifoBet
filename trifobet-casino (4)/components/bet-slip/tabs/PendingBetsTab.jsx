// components/bet-slip/tabs/PendingBetsTab.jsx
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Ticket, Loader2 } from "lucide-react"

export function PendingBetsTab({ pendingBets, loadingPending }) {
  if (loadingPending) {
    return <div className="flex justify-center p-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
  }

  if (pendingBets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 opacity-60">
        <Ticket className="h-12 w-12 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Sin apuestas pendientes</p>
        <Button variant="outline" size="sm" onClick={() => window.dispatchEvent(new CustomEvent('open-bet-history'))}>
          Ver Historial Completo
        </Button>
      </div>
    )
  }

  return (
    <>
      {pendingBets.map(bet => (
        <div key={bet.id} className="border border-border rounded-xl overflow-hidden bg-card text-xs">
          <div className="flex justify-between items-center bg-muted/40 px-3 py-2 border-b">
            <div className="flex items-center gap-2">
              <span className="font-bold">{bet.tipo === 'combinada' ? 'Combinada' : bet.tipo === 'sistema' ? 'Sistema' : 'Simple'}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{`TRF-${String(bet.id).padStart(8, "0")}`}</span>
            </div>
            <Badge variant="secondary" className="text-[10px] bg-yellow-500/10 text-yellow-600">Pendiente</Badge>
          </div>
          <div className="p-3 space-y-2">
            {bet.selecciones?.slice(0, 2).map((s, i) => (
              <div key={i} className="flex justify-between">
                <span className="truncate max-w-[200px] text-muted-foreground">{s.eventoNombre || "Evento"} - {s.seleccionDisplay}</span>
                <span className="font-semibold">{s.cuota}</span>
              </div>
            ))}
            {bet.selecciones?.length > 2 && (
              <div className="text-center text-muted-foreground pt-1 border-t text-[10px]">
                + {bet.selecciones.length - 2} selecciones más
              </div>
            )}
            <div className="flex justify-between items-center pt-2 mt-2 border-t font-semibold">
              <span className="text-muted-foreground">Inversión: Bs {bet.monto}</span>
              <span className="text-primary">Ganancia Pot: Bs {bet.gananciaPotencial}</span>
            </div>
          </div>
        </div>
      ))}
      <div className="pt-2 flex justify-center">
        <Button variant="outline" size="sm" className="w-full" onClick={() => window.dispatchEvent(new CustomEvent('open-bet-history'))}>
          Ver Historial Completo
        </Button>
      </div>
    </>
  )
}
