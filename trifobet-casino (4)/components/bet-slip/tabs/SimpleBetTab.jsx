// components/bet-slip/tabs/SimpleBetTab.jsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Loader2 } from "lucide-react"
import { getBetKey } from "../hooks/useBetSlipLogic"
import { getMarketLabel } from "../utils"

export function SimpleBetTab({ bets, onRemoveBet, betAmounts, setBetAmounts, calcTotalPayout, placeSingleBet, isSubmitting }) {
  if (bets.length === 0) return null

  return bets.map((bet) => {
    const key = getBetKey(bet)
    const amount = betAmounts[key] || ""
    const payout = calcTotalPayout(bet.odds, amount)

    return (
      <div key={key} className="border border-border rounded-xl overflow-hidden bg-card">
        <div className="flex items-start justify-between p-3 gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground truncate mb-0.5">{bet.match || bet.league}</p>
            <p className="text-sm font-bold truncate">{bet.selection}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{getMarketLabel(bet.marketType)}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-base font-black text-primary">{bet.odds}</span>
            <button className="text-muted-foreground hover:text-destructive transition-colors" onClick={() => onRemoveBet(bet.id, bet.type, bet.marketType)}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="px-3 pb-3 space-y-2 bg-muted/20 border-t border-border/50">
          <div className="flex items-center justify-between pt-2">
            <Label className="text-[11px] text-muted-foreground">Monto a apostar (Bs)</Label>
            <Input
              type="number" value={amount} onChange={(e) => setBetAmounts((p) => ({ ...p, [key]: e.target.value }))}
              className="w-24 h-8 text-right text-sm font-bold border-2 border-green-500 rounded-md focus-visible:ring-green-500 bg-background"
              placeholder="2.00" min="2" step="0.01"
            />
          </div>
          <div className="flex gap-1">
            {[5, 10, 25, 50].map((v) => (
              <button key={v} onClick={() => setBetAmounts((p) => ({ ...p, [key]: String(v) }))} className="flex-1 py-1 rounded-md bg-muted hover:bg-muted/70 text-xs font-semibold text-foreground transition-colors">
                +{v}
              </button>
            ))}
          </div>
          {amount && Number.parseFloat(amount) < 2 && (
            <p className="text-[10px] text-destructive font-semibold pt-1">El monto mínimo de apuesta es 2 Bs.</p>
          )}
          {amount && Number.parseFloat(amount) > 0 && (
            <div className="flex justify-between items-center text-xs pt-1 border-t border-border/40">
              <span className="text-muted-foreground">Retorno estimado</span>
              <span className="font-black text-primary">Bs {payout}</span>
            </div>
          )}
        </div>

        <div className="px-3 pb-3 pt-2">
          <Button className="w-full h-9 font-bold text-sm" onClick={() => placeSingleBet(bet)} disabled={!amount || Number.parseFloat(amount) < 2 || isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : `Apostar Bs ${amount || "0"}`}
          </Button>
        </div>
      </div>
    )
  })
}
