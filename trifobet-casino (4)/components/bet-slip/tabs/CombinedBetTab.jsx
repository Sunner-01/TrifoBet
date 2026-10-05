// components/bet-slip/tabs/CombinedBetTab.jsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Loader2 } from "lucide-react"
import { getBetKey } from "../hooks/useBetSlipLogic"
import { getMarketLabel, groupBets } from "../utils"

export function CombinedBetTab({ bets, onRemoveBet, combinedAmount, setCombinedAmount, combinedOdds, combinedWin, combinedPayout, placeCombinedBet, isSubmitting }) {
  if (bets.length < 2) return null

  const groupedBetsArray = groupBets(bets)

  return (
    <div className="space-y-2">
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
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/60">
          <span className="text-xs text-muted-foreground font-medium">Cuota Total ({bets.length} selecciones)</span>
          <span className="text-xl font-black text-primary">{combinedOdds()}</span>
        </div>

        <div className="p-3 space-y-2 bg-muted/20">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-muted-foreground">Monto Combinada (Bs)</Label>
            <Input
              type="number" value={combinedAmount} onChange={(e) => setCombinedAmount(e.target.value)}
              className="w-24 h-8 text-right text-sm font-bold border-2 border-green-500 rounded-md focus-visible:ring-green-500 bg-background"
              placeholder="2.00" min="2" step="0.01"
            />
          </div>
          <div className="flex gap-1">
            {[5, 10, 25, 50].map((v) => (
              <button key={v} onClick={() => setCombinedAmount(String(v))} className="flex-1 py-1 rounded-md bg-muted hover:bg-muted/70 text-xs font-semibold transition-colors">
                +{v}
              </button>
            ))}
          </div>

          {combinedAmount && Number.parseFloat(combinedAmount) < 2 && (
            <p className="text-[10px] text-destructive font-semibold">El monto mínimo de apuesta es 2 Bs.</p>
          )}

          {combinedAmount && Number.parseFloat(combinedAmount) >= 2 && (
            <div className="space-y-1 pt-1 border-t border-border/40">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Ganancia potencial</span>
                <span className="font-semibold text-primary">+Bs {combinedWin()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground font-medium">Retorno total</span>
                <span className="font-black text-primary">Bs {combinedPayout()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="px-3 pb-3 pt-1">
          <Button className="w-full h-10 font-bold" onClick={placeCombinedBet} disabled={!combinedAmount || Number.parseFloat(combinedAmount) < 2 || isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : `Apostar Combinada · Bs ${combinedAmount || "0"}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
