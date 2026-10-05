// components/bet-slip/hooks/useBetSlipLogic.js
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { apiPost, apiGet } from "@/lib/api"
import { isAuthenticated } from "@/lib/auth"

export const getBetKey = (bet) => `${bet.id}-${bet.type}-${bet.marketType}`
export const fmt2 = (n) => (Number.parseFloat(n) || 0).toFixed(2)

export function useBetSlipLogic(bets, onRemoveBet, onClearAll) {
  const [betAmounts, setBetAmounts] = useState({})
  const [combinedAmount, setCombinedAmount] = useState("")
  const [systemAmount, setSystemAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shareCode, setShareCode] = useState("")
  const [loadCode, setLoadCode] = useState("")
  const [isLoadingCode, setIsLoadingCode] = useState(false)
  
  const { toast } = useToast()

  const calcPotentialWin = (odds, amount) => fmt2((Number.parseFloat(odds) - 1) * (Number.parseFloat(amount) || 0))
  const calcTotalPayout = (odds, amount) => fmt2(Number.parseFloat(odds) * (Number.parseFloat(amount) || 0))
  const combinedOdds = () => bets.reduce((acc, b) => acc * Number.parseFloat(b.odds), 1).toFixed(2)
  const combinedWin = () => calcPotentialWin(combinedOdds(), combinedAmount)
  const combinedPayout = () => calcTotalPayout(combinedOdds(), combinedAmount)
  const systemCombinations = () => bets.length >= 3 ? Math.floor((bets.length * (bets.length - 1)) / 2) : 0
  const systemTotalCost = () => fmt2((Number.parseFloat(systemAmount) || 0) * systemCombinations())

  const validateBet = (amount) => {
    if (!isAuthenticated()) {
      window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { tab: "login" } }))
      toast({ title: "Atención", description: "Inicia sesión para realizar tu apuesta", variant: "default" })
      return false
    }
    const val = Number.parseFloat(amount)
    if (isNaN(val) || val < 2) {
      toast({ title: "Monto inválido", description: "El monto mínimo de apuesta es de 2 Bs.", variant: "destructive" })
      return false
    }
    return true
  }

  const clearAll = () => {
    if (onClearAll) onClearAll()
    else bets.forEach((b) => onRemoveBet(b.id, b.type, b.marketType))
    setBetAmounts({})
    setCombinedAmount("")
    setSystemAmount("")
    setShareCode("")
  }

  const placeSingleBet = async (bet) => {
    const key = getBetKey(bet)
    const amount = betAmounts[key]
    if (!validateBet(amount)) return
    try {
      setIsSubmitting(true)
      await apiPost("/apuestas-deportivas/crear", {
        tipo: "simple",
        monto: Number.parseFloat(amount),
        selecciones: [{
          eventoId: bet.id, mercado: bet.marketType, seleccion: bet.type,
          cuota: Number.parseFloat(bet.odds), eventoNombre: bet.match, seleccionDisplay: bet.selection,
        }],
      })
      toast({ title: "¡Apuesta realizada!", description: `Bs ${amount} en ${bet.selection} · Ganancia potencial: Bs ${calcPotentialWin(bet.odds, amount)}` })
      window.dispatchEvent(new CustomEvent('balance-updated'))
      onRemoveBet(bet.id, bet.type, bet.marketType)
      setBetAmounts((prev) => { const n = { ...prev }; delete n[key]; return n })
    } catch (e) {
      toast({ title: "Error", description: e.message || "Error al procesar la apuesta", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const placeCombinedBet = async () => {
    if (bets.length < 2) return
    if (!validateBet(combinedAmount)) return
    try {
      setIsSubmitting(true)
      await apiPost("/apuestas-deportivas/crear", {
        tipo: "combinada", monto: Number.parseFloat(combinedAmount),
        selecciones: bets.map((b) => ({
          eventoId: b.id, mercado: b.marketType, seleccion: b.type,
          cuota: Number.parseFloat(b.odds), eventoNombre: b.match, seleccionDisplay: b.selection,
        })),
      })
      toast({ title: "¡Combinada realizada!", description: `Bs ${combinedAmount} · Cuota total: ${combinedOdds()} · Ganancia potencial: Bs ${combinedWin()}` })
      window.dispatchEvent(new CustomEvent('balance-updated'))
      clearAll()
    } catch (e) {
      toast({ title: "Error", description: e.message || "Error al procesar la apuesta", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const placeSystemBet = async () => {
    if (bets.length < 3) return
    if (!validateBet(systemAmount)) return
    try {
      setIsSubmitting(true)
      await apiPost("/apuestas-deportivas/crear", {
        tipo: "sistema", monto: Number.parseFloat(systemAmount),
        selecciones: bets.map((b) => ({
          eventoId: b.id, mercado: b.marketType, seleccion: b.type,
          cuota: Number.parseFloat(b.odds), eventoNombre: b.match, seleccionDisplay: b.selection,
        })),
      })
      toast({ title: "¡Sistema realizado!", description: `${systemCombinations()} combinaciones · Inversión total: Bs ${systemTotalCost()}` })
      window.dispatchEvent(new CustomEvent('balance-updated'))
      clearAll()
    } catch (e) {
      toast({ title: "Error", description: e.message || "Error al procesar la apuesta", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleShareSlip = async () => {
    try {
      setIsSubmitting(true)
      const res = await apiPost("/cupon/compartir", { selecciones: bets })
      if (res && res.codigo) {
        setShareCode(res.codigo)
        navigator.clipboard.writeText(res.codigo)
        toast({ title: "Cupón Compartido", description: `Código copiado al portapapeles: ${res.codigo}` })
      }
    } catch (e) {
      toast({ title: "Error", description: e.message || "No se pudo compartir el cupón", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLoadSlip = async () => {
    if (!loadCode) return
    try {
      setIsLoadingCode(true)
      const res = await apiGet(`/cupon/${loadCode.trim()}`)
      if (res && Array.isArray(res)) {
        window.dispatchEvent(new CustomEvent("load-bets", { detail: { bets: res } }))
        toast({ title: "Cupón Cargado", description: "Selecciones añadidas exitosamente" })
        setLoadCode("")
      }
    } catch (e) {
      toast({ title: "Error", description: e.message || "Código inválido o expirado", variant: "destructive" })
    } finally {
      setIsLoadingCode(false)
    }
  }

  return {
    betAmounts, setBetAmounts,
    combinedAmount, setCombinedAmount,
    systemAmount, setSystemAmount,
    isSubmitting,
    shareCode,
    loadCode, setLoadCode,
    isLoadingCode,
    calcTotalPayout, combinedOdds, combinedWin, combinedPayout, systemCombinations, systemTotalCost,
    placeSingleBet, placeCombinedBet, placeSystemBet, clearAll, handleShareSlip, handleLoadSlip
  }
}
