import { useState, useCallback, useEffect, useRef } from "react";
import { apiGet } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";
import { useSportsHistory } from "@/hooks/useSportsHistory";

export function useBetHistoryLogic() {
  const sportsHistory = useSportsHistory();
  const [apuestasCasino, setApuestasCasino] = useState([]);
  const [casinoLoading, setCasinoLoading] = useState(false);
  const [betsTabType, setBetsTabType] = useState("deportivas");
  const generation = useRef(0);

  const fetchCasino = useCallback(async () => {
    const current = ++generation.current;
    const token = getStoredToken();
    setApuestasCasino([]);
    if (!token) { setCasinoLoading(false); return; }
    setCasinoLoading(true);
    try {
      const data = await apiGet("/juegos-casino/historial/me");
      if (current === generation.current && getStoredToken() === token) {
        setApuestasCasino(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error al cargar historial de casino:", error);
    } finally {
      if (current === generation.current) setCasinoLoading(false);
    }
  }, []);

  useEffect(() => {
    const onStorage = (event) => { if (event.key === "token" || event.key === null) fetchCasino(); };
    fetchCasino();
    window.addEventListener("auth-change", fetchCasino);
    window.addEventListener("storage", onStorage);
    return () => {
      generation.current += 1;
      window.removeEventListener("auth-change", fetchCasino);
      window.removeEventListener("storage", onStorage);
    };
  }, [fetchCasino]);

  const fetchApuestas = useCallback(() => {
    sportsHistory.refresh();
    return fetchCasino();
  }, [sportsHistory.refresh, fetchCasino]);

  return {
    apuestasDeportivas: sportsHistory.bets, apuestasCasino,
    isLoadingApuestas: betsTabType === "deportivas" ? sportsHistory.loading : casinoLoading,
    betsTabType, setBetsTabType, fetchApuestas, sportsHistory,
  };
}
