// hooks/useBetSelection.js
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function getSelectionName(match, type) {
  switch (type) {
    case "home": return match.equipoLocal;
    case "away": return match.equipoVisitante;
    case "draw": return "Empate";
    default: return "";
  }
}

export function useBetSelection() {
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [selectedBets, setSelectedBets] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const handleLoadBets = (e) => {
      if (e.detail?.bets) {
        setSelectedBets(e.detail.bets);
        setShowBetSlip(true);
      }
    };
    window.addEventListener("load-bets", handleLoadBets);
    return () => window.removeEventListener("load-bets", handleLoadBets);
  }, []);

  const handleBetSelection = (match, type, odds) => {
    const marketType = "1x2";
    const existingBetIndex = selectedBets.findIndex(
      (bet) => bet.id === match.id && bet.marketType === marketType
    );

    if (existingBetIndex >= 0) {
      const existingBet = selectedBets[existingBetIndex];
      const newBets = [...selectedBets];
      if (existingBet.type === type) {
        newBets.splice(existingBetIndex, 1);
        setSelectedBets(newBets);
        toast({ title: "Apuesta removida", description: `${getSelectionName(match, type)} removida del boleto` });
      } else {
        newBets[existingBetIndex] = {
          id: match.id,
          league: match.liga,
          match: `${match.equipoLocal} vs ${match.equipoVisitante}`,
          type,
          odds,
          selection: getSelectionName(match, type),
          marketType,
        };
        setSelectedBets(newBets);
        setShowBetSlip(true);
        toast({ title: "Selección actualizada", description: `Cambiada a ${getSelectionName(match, type)} - Cuota: ${odds}` });
      }
    } else {
      setSelectedBets([...selectedBets, {
        id: match.id,
        league: match.liga,
        match: `${match.equipoLocal} vs ${match.equipoVisitante}`,
        type,
        odds,
        selection: getSelectionName(match, type),
        marketType,
      }]);
      setShowBetSlip(true);
      toast({ title: "Apuesta agregada", description: `${getSelectionName(match, type)} - Cuota: ${odds}` });
    }
  };

  const isBetSelected = (matchId, type) =>
    selectedBets.some((bet) => bet.id === matchId && bet.type === type);

  const removeBet = (id, type, marketType) =>
    setSelectedBets(selectedBets.filter(
      (bet) => !(bet.id === id && bet.type === type && bet.marketType === marketType)
    ));

  return {
    showBetSlip,
    setShowBetSlip,
    selectedBets,
    setSelectedBets,
    handleBetSelection,
    isBetSelected,
    removeBet
  };
}
