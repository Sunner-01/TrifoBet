// components/profile/hooks/useBetHistoryLogic.js
import { useState, useCallback } from "react";
import { apiGet } from "@/lib/api";

export function useBetHistoryLogic() {
  const [apuestasDeportivas, setApuestasDeportivas] = useState([]);
  const [apuestasCasino, setApuestasCasino] = useState([]);
  const [isLoadingApuestas, setIsLoadingApuestas] = useState(false);
  const [betsTabType, setBetsTabType] = useState("deportivas"); // "deportivas" o "casino"

  const fetchApuestas = useCallback(async () => {
    setIsLoadingApuestas(true);
    try {
      // Deportivas
      const depRes = await apiGet('/apuestas-deportivas/historial');
      setApuestasDeportivas(depRes?.apuestas || []);
      
      // Casino
      const casRes = await apiGet('/juegos-casino/historial/me');
      setApuestasCasino(Array.isArray(casRes) ? casRes : []);
    } catch (error) {
      console.error("Error al cargar historial de apuestas:", error);
    } finally {
      setIsLoadingApuestas(false);
    }
  }, []);

  return {
    apuestasDeportivas,
    apuestasCasino,
    isLoadingApuestas,
    betsTabType,
    setBetsTabType,
    fetchApuestas
  };
}
