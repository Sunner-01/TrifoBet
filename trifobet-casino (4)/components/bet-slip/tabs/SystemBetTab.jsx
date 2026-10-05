// components/bet-slip/tabs/SystemBetTab.jsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Loader2, Info } from "lucide-react"
import { getBetKey } from "../hooks/useBetSlipLogic"
import { getMarketLabel, groupBets } from "../utils"

export function SystemBetTab({ bets, onRemoveBet, systemAmount, setSystemAmount, systemCombinations, systemTotalCost, placeSystemBet, isSubmitting }) {
  if (bets.length < 3) return null

  const groupedBetsArray = groupBets(bets)

  return (
    <div className="space-y-2">
      <div className="flex gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-primary">Sistema 2/{bets.length}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Se generan <strong className="text-foreground">{systemCombinations()} combinaciones</strong> de 2 selecciones.
            Ganas retorno si al menos 2 de tus selecciones son correctas.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {groupedBetsArray.map((group) => (
          <div key={group.matchName} className="border border-border/60 rounded-lg overflow-hidden bg-card">
            <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40 border-b border-border/40">
              <span className="text-[11px] font-bold truncate text-muted-foreground">{group.matchName}</span>
              <button className="text-muted-foreground hover:text-destructive shrink-0" onClick={() => group.bets.forEach((b) => onRemoveBet(b.id, b.type, b.marketType))}>
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="divide-y divide-border/30">
              {group.bets.map((bet) => (
                <div key={getBetKey(bet)} className="flex items-center gap-2 p-2 px-3 bg-muted/10">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate text-foreground">{bet.selection}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{getMarketLabel(bet.marketType)}</p>
                  </div>
                  <span className="text-sm font-black text-primary shrink-0">{bet.odds}</span>
                  <button className="text-muted-foreground hover:text-destructive transition-colors shrink-0" onClick={() => onRemoveBet(bet.id, bet.type, bet.marketType)}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="p-3 space-y-2 bg-muted/20">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-muted-foreground">Monto por línea (Bs)</Label>
            <Input
              type="number" value={systemAmount} onChange={(e) => setSystemAmount(e.target.value)}
              className="w-24 h-8 text-right text-sm font-bold border-2 border-green-500 rounded-md focus-visible:ring-green-500 bg-background"
              placeholder="2.00" min="2" step="0.01"
            />
          </div>
          
          {systemAmount && Number.parseFloat(systemAmount) < 2 && (
            <p className="text-[10px] text-destructive font-semibold">El monto mínimo de apuesta es 2 Bs.</p>
          )}

          {systemAmount && Number.parseFloat(systemAmount) >= 2 && (
            <div className="flex justify-between text-xs pt-1 border-t border-border/40">
              <span className="text-muted-foreground">{systemCombinations()} combinaciones · costo total</span>
              <span className="font-black text-foreground">Bs {systemTotalCost()}</span>
            </div>
          )}
        </div>
        <div className="px-3 pb-3 pt-1">
          <Button className="w-full h-10 font-bold" onClick={placeSystemBet} disabled={!systemAmount || Number.parseFloat(systemAmount) < 2 || isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Colocar Sistema"}
          </Button>
        </div>
      </div>
    </div>
  )
}
