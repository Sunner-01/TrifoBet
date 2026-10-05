// components/bet-slip.jsx
"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Ticket, Loader2, Trash2, ChevronDown, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
// Hooks
import { usePendingBets } from "./bet-slip/hooks/usePendingBets"
import { useBetSlipLogic } from "./bet-slip/hooks/useBetSlipLogic"
// Tabs
import { SimpleBetTab } from "./bet-slip/tabs/SimpleBetTab"
import { CombinedBetTab } from "./bet-slip/tabs/CombinedBetTab"
import { SystemBetTab } from "./bet-slip/tabs/SystemBetTab"
import { PendingBetsTab } from "./bet-slip/tabs/PendingBetsTab"
export default function BetSlip({ open, onOpenChange, bets, onRemoveBet, onClearAll }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState("simple") // "simple" | "combinada" | "sistema"
  const [mainTab, setMainTab] = useState("cupon") // "cupon" | "mis-apuestas"
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()

  const { pendingBets, loadingPending, fetchPendingBets } = usePendingBets(mainTab, isExpanded)

  const {
    betAmounts, setBetAmounts,
    combinedAmount, setCombinedAmount,
    systemAmount, setSystemAmount,
    isSubmitting, shareCode,
    loadCode, setLoadCode, isLoadingCode,
    calcTotalPayout, combinedOdds, combinedWin, combinedPayout, systemCombinations, systemTotalCost,
    placeSingleBet, placeCombinedBet, placeSystemBet, clearAll, handleShareSlip, handleLoadSlip
  } = useBetSlipLogic(bets, onRemoveBet, onClearAll)

  useEffect(() => {
    if (open !== undefined) setIsExpanded(open)
  }, [open])

  const syncOpen = (val) => {
    setIsExpanded(val)
    if (onOpenChange) onOpenChange(val)
  }

  useEffect(() => {
    if (bets.length === 0) {
      setActiveTab("simple")
      return
    }
    if (bets.length === 1) {
      setActiveTab("simple")
    } else if (bets.length >= 2) {
      if (!combinedAmount && Object.values(betAmounts).length > 0) {
        setCombinedAmount(Object.values(betAmounts)[0])
      }
      setActiveTab("combinada")
    }
    if (!isExpanded) syncOpen(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bets.length])

  return (
    <div className="fixed bottom-0 right-0 z-50 w-full sm:w-[360px] flex flex-col pointer-events-none">
      {!isExpanded && (
        <button
          onClick={() => syncOpen(true)}
          style={{
            backgroundColor: '#1e2329',
            isolation: 'isolate',
          }}
          className="pointer-events-auto flex items-center justify-between gap-3 w-full px-4 py-3
            border border-white/10 rounded-t-2xl sm:rounded-2xl sm:mb-2
            shadow-[0_-8px_32px_rgba(0,0,0,0.5)] hover:brightness-110 active:brightness-90 transition-all text-left
            relative z-10"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-black">
              {bets.length}
            </div>
            <div>
              <p className="text-xs font-bold leading-tight text-white">
                {bets.length === 0 ? "Cupón" : bets.length === 1 ? "Apuesta Simple" : activeTab === "sistema" ? "Apuesta de Sistema" : "Apuesta Combinada"}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight text-gray-400">
                Toca para ver o cargar código
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {bets.length >= 2 && (
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground leading-tight text-gray-400">Cuota</p>
                <p className="text-sm font-black text-primary leading-tight">{combinedOdds()}</p>
              </div>
            )}
            {bets.length > 0 && (
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground leading-tight text-gray-400">Potencial</p>
                <p className="text-xs font-black text-primary leading-tight">
                  {bets.length === 1 ? `Bs ${calcTotalPayout(bets[0].odds, betAmounts[`${bets[0].id}-${bets[0].type}-${bets[0].marketType}`] || 0)}` : activeTab === "sistema" && bets.length >= 3 ? `Bs ${systemTotalCost()}` : `Bs ${combinedWin()}`}
                </p>
              </div>
            )}
            <ChevronDown className="h-4 w-4 text-muted-foreground rotate-180" />
          </div>
        </button>
      )}
      
      {isExpanded && (
        <div className="pointer-events-auto flex flex-col bg-card border border-border rounded-t-2xl sm:rounded-2xl sm:mb-2 sm:mr-2 shadow-[0_-5px_30px_rgba(0,0,0,0.4)] max-h-[80vh] overflow-hidden w-full">
          
          <div className="flex flex-col border-b bg-muted/30 rounded-t-2xl sm:rounded-t-2xl">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-primary" />
                <span className="font-bold text-sm">Apuestas Deportivas</span>
                <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                  {bets.length}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => { clearAll(); syncOpen(false); }} title="Limpiar todo">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => syncOpen(false)}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-1 px-2 pb-2">
              <button onClick={() => setMainTab("cupon")} className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${mainTab === "cupon" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                Cupón ({bets.length})
              </button>
              <button onClick={() => { setMainTab("mis-apuestas"); fetchPendingBets(); }} className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${mainTab === "mis-apuestas" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                Mis Apuestas
              </button>
            </div>
          </div>

          {mainTab === "cupon" && bets.length >= 3 && (
            <div className="flex gap-1 p-2 border-b bg-muted/10">
              {["combinada", "sistema"].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors capitalize ${activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                  {tab === "combinada" ? "Combinada" : "Sistema"}
                </button>
              ))}
            </div>
          )}

          {mainTab === "cupon" && (
            <div className="flex flex-col gap-2 p-3 border-b bg-card">
              <div className="flex gap-2 items-center">
                <Input placeholder="Código ej. A7B9X" value={loadCode} onChange={(e) => setLoadCode(e.target.value.toUpperCase())} className="h-8 text-xs font-mono uppercase" />
                <Button size="sm" variant="secondary" className="h-8 shrink-0 text-xs" onClick={handleLoadSlip} disabled={isLoadingCode || !loadCode}>
                  {isLoadingCode ? <Loader2 className="h-3 w-3 animate-spin" /> : "Cargar"}
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground disabled:opacity-40" onClick={handleShareSlip} disabled={bets.length === 0 || isSubmitting}>
                  <Ticket className="h-3.5 w-3.5 mr-1" /> Guardar selección
                </Button>
                {shareCode && (
                  <div className="flex items-center gap-1 relative">
                    {isCopied && <div className="absolute -top-8 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded shadow-lg z-50">¡Copiado!</div>}
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">{shareCode}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => {
                      navigator.clipboard.writeText(shareCode).then(() => { setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); })
                    }}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-3 space-y-3">
              {mainTab === "cupon" && bets.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 opacity-60">
                  <Ticket className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">Tu cupón está vacío</p>
                  <p className="text-xs text-muted-foreground">Selecciona alguna cuota para comenzar o carga un código arriba.</p>
                </div>
              )}

              {mainTab === "cupon" && activeTab === "simple" && bets.length > 0 && (
                <SimpleBetTab bets={bets} onRemoveBet={onRemoveBet} betAmounts={betAmounts} setBetAmounts={setBetAmounts} calcTotalPayout={calcTotalPayout} placeSingleBet={placeSingleBet} isSubmitting={isSubmitting} />
              )}

              {mainTab === "cupon" && activeTab === "combinada" && bets.length >= 2 && (
                <CombinedBetTab bets={bets} onRemoveBet={onRemoveBet} combinedAmount={combinedAmount} setCombinedAmount={setCombinedAmount} combinedOdds={combinedOdds} combinedWin={combinedWin} combinedPayout={combinedPayout} placeCombinedBet={placeCombinedBet} isSubmitting={isSubmitting} />
              )}

              {mainTab === "cupon" && activeTab === "sistema" && bets.length >= 3 && (
                <SystemBetTab bets={bets} onRemoveBet={onRemoveBet} systemAmount={systemAmount} setSystemAmount={setSystemAmount} systemCombinations={systemCombinations} systemTotalCost={systemTotalCost} placeSystemBet={placeSystemBet} isSubmitting={isSubmitting} />
              )}

              {mainTab === "mis-apuestas" && (
                <PendingBetsTab pendingBets={pendingBets} loadingPending={loadingPending} />
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}