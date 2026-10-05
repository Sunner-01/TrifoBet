// hooks/useMatchesLogic.js
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import { PRIORIDAD_LIGAS } from "@/lib/constants";

export function obtenerPrioridadLiga(nombreLiga, nombrePais) {
  const liga = nombreLiga?.toLowerCase() || "";
  const pais = nombrePais?.toLowerCase() || "";
  for (const regla of PRIORIDAD_LIGAS) {
    const ligaMatch = regla.terms.some(term => liga.includes(term));
    if (ligaMatch) {
      if (regla.pais) {
        if (regla.pais.some(p => pais.includes(p))) return regla.id;
      } else {
        return regla.id;
      }
    }
  }
  return 999;
}

export function useMatchesLogic() {
  const [featuredMatches, setFeaturedMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    const fetchPartidos = async () => {
      try {
        setLoadingMatches(true);
        const data = await apiGet('/deportes/futbol/partidos');

        let todosLosPartidos = [];
        if (Array.isArray(data)) {
          todosLosPartidos = data;
        } else if (data && typeof data === 'object') {
          Object.values(data).forEach(arr => {
            if (Array.isArray(arr)) todosLosPartidos = [...todosLosPartidos, ...arr];
          });
        }

        const mappedPartidos = todosLosPartidos.map(p => {
          let fechaFormatted = "Fecha desconocida";
          try {
            if (p.fecha) {
              fechaFormatted = new Date(p.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            }
          } catch (e) {
            console.error("Error parsing date:", p.fecha);
          }
          return {
            id: p.id,
            deporte: "futbol",
            liga: p.liga,
            logoLiga: p.logo_liga,
            pais: p.pais?.toLowerCase() || "world",
            equipoLocal: p.equipo_local,
            logoLocal: p.escudo_local,
            equipoVisitante: p.equipo_visitante,
            logoVisitante: p.escudo_visitante,
            fecha: fechaFormatted,
            cuotaLocal: p.cuotas?.main?.["1X2"]?.["1"]?.toFixed(2) || "-",
            cuotaEmpate: p.cuotas?.main?.["1X2"]?.["X"]?.toFixed(2) || "-",
            cuotaVisitante: p.cuotas?.main?.["1X2"]?.["2"]?.toFixed(2) || "-",
            live: p.estado !== "NS",
            tiempo: p.minuto ? `${p.minuto}'` : "LIVE",
            resultado: `${p.goles_local || 0} - ${p.goles_visitante || 0}`,
            stats: { posesion: "50% - 50%", tiros: "5 - 5", corners: "3 - 3" },
            prioridad: obtenerPrioridadLiga(p.liga, p.pais)
          };
        });

        const destacados = mappedPartidos
          .sort((a, b) => {
            if (a.prioridad !== b.prioridad) return a.prioridad - b.prioridad;
            if (a.live !== b.live) return a.live ? -1 : 1;
            return 0;
          })
          .slice(0, 3);

        setFeaturedMatches(destacados);
      } catch (error) {
        console.error("Error loading matches:", error);
      } finally {
        setLoadingMatches(false);
      }
    };
    fetchPartidos();
  }, []);

  return { featuredMatches, loadingMatches };
}
