// components/bet-slip/hooks/usePendingBets.js
import { useState, useEffect, useCallback } from "react"
import { apiGet } from "@/lib/api"
import { isAuthenticated } from "@/lib/auth"

export function usePendingBets(mainTab, isExpanded) {
  const [pendingBets, setPendingBets] = useState([])
  const [loadingPending, setLoadingPending] = useState(false)

  const fetchPendingBets = useCallback(async (silent = false) => {
    if (!isAuthenticated()) return;
    try {
      if (!silent) setLoadingPending(true);
      const data = await apiGet('/apuestas-deportivas/historial?estado=pendiente');
      let historyData = [];
      if (Array.isArray(data)) historyData = data;
      else if (data && typeof data === 'object') historyData = data.apuestas || data.data || data.items || [];
      setPendingBets(historyData.filter(b => b.estado === 'pendiente'));
    } catch (e) {
      console.error("Error fetching pending bets", e);
    } finally {
      if (!silent) setLoadingPending(false);
    }
  }, []);

  useEffect(() => {
    if (mainTab !== "mis-apuestas" || !isExpanded) return;

    fetchPendingBets();

    const interval = setInterval(() => {
      fetchPendingBets(true);
    }, 10000);

    const handleUpdate = () => fetchPendingBets(true);
    window.addEventListener("balance-updated", handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("balance-updated", handleUpdate);
    };
  }, [mainTab, isExpanded, fetchPendingBets]);

  return { pendingBets, loadingPending, fetchPendingBets };
}
