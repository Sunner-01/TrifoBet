import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PRIORIDAD_LIGAS } from "@/lib/constants";

export function useApuestas() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("todos");
  const [selectedLeague, setSelectedLeague] = useState("todas");
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [selectedBets, setSelectedBets] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const obtenerPrioridadLiga = (nombreLiga, nombrePais) => {
    const liga = nombreLiga?.toLowerCase() || "";
    const pais = nombrePais?.toLowerCase() || "";
    for (const regla of PRIORIDAD_LIGAS) {
      const ligaMatch = regla.terms.some((term) => liga.includes(term));
      if (ligaMatch) {
        if (regla.pais) {
          const paisMatch = regla.pais.some((p) => pais.includes(p));
          if (paisMatch) return regla.id;
        } else {
          return regla.id;
        }
      }
    }
    return 999;
  };

  const formatearFecha = (fechaRaw) => {
    try {
      const fecha = new Date(fechaRaw);
      if (isNaN(fecha.getTime())) return String(fechaRaw);

      const hoy = new Date();
      const manana = new Date();
      manana.setDate(hoy.getDate() + 1);

      const hora = fecha.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

      const isHoy =
        fecha.getDate() === hoy.getDate() &&
        fecha.getMonth() === hoy.getMonth() &&
        fecha.getFullYear() === hoy.getFullYear();
      const isManana =
        fecha.getDate() === manana.getDate() &&
        fecha.getMonth() === manana.getMonth() &&
        fecha.getFullYear() === manana.getFullYear();

      if (isHoy) return hora;
      if (isManana) return `Mañana, ${hora}`;
      return `${fecha.getDate()}/${fecha.getMonth() + 1}, ${hora}`;
    } catch {
      return String(fechaRaw);
    }
  };

  useEffect(() => {
    const fetchPartidos = async () => {
      try {
        setLoading(true);
        const data = await apiGet("/deportes/futbol/partidos");

        let todosLosPartidos = [];
        if (Array.isArray(data)) {
          todosLosPartidos = data;
        } else if (data && typeof data === "object") {
          Object.values(data).forEach((arr) => {
            if (Array.isArray(arr)) todosLosPartidos = [...todosLosPartidos, ...arr];
          });
        }

        const mappedPartidos = todosLosPartidos.map((p) => ({
          id: p.id,
          deporte: "futbol",
          liga: p.liga,
          pais: p.pais?.toLowerCase() || "world",
          equipoLocal: p.equipo_local,
          equipoVisitante: p.equipo_visitante,
          logoLocal: p.escudo_local,
          logoVisitante: p.escudo_visitante,
          fecha: formatearFecha(p.fecha),
          cuotaLocal: p.cuotas?.main?.["1X2"]?.["1"]?.toFixed(2) || "-",
          cuotaEmpate: p.cuotas?.main?.["1X2"]?.["X"]?.toFixed(2) || "-",
          cuotaVisitante: p.cuotas?.main?.["1X2"]?.["2"]?.toFixed(2) || "-",
          overUnder: {
            over: p.cuotas?.goals?.total?.["2.5"]?.over?.toFixed(2) || "-",
            under: p.cuotas?.goals?.total?.["2.5"]?.under?.toFixed(2) || "-",
            line: "2.5",
          },
          live: p.estado !== "NS",
          tiempo: p.minuto ? `${p.minuto}'` : "LIVE",
          resultado: `${p.goles_local || 0} - ${p.goles_visitante || 0}`,
          mercados: 50,
          estadio: "Estadio Principal",
          temperatura: "20°C",
          prioridad: obtenerPrioridadLiga(p.liga, p.pais),
        }));

        const destacados = mappedPartidos.sort((a, b) => a.prioridad - b.prioridad).slice(0, 3);
        setPartidos(destacados);
      } catch (error) {
        console.error("Error loading matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartidos();
  }, []);

  const getSelectionName = (match, type, marketType) => {
    if (marketType === "overunder") {
      return type === "over" ? `Más de ${match.overUnder.line}` : `Menos de ${match.overUnder.line}`;
    }
    if (marketType === "handicap") {
      return type === "home"
        ? `${match.equipoLocal} ${match.handicap.line}`
        : `${match.equipoVisitante} ${match.handicap.line}`;
    }
    switch (type) {
      case "home":
        return match.equipoLocal;
      case "away":
        return match.equipoVisitante;
      case "draw":
        return "Empate";
      default:
        return "";
    }
  };

  const handleBetSelection = (match, type, odds, marketType = "1x2") => {
    const existingBetIndex = selectedBets.findIndex(
      (bet) => bet.id === match.id && bet.marketType === marketType
    );

    if (existingBetIndex >= 0) {
      const existingBet = selectedBets[existingBetIndex];
      const newBets = [...selectedBets];

      if (existingBet.type === type) {
        newBets.splice(existingBetIndex, 1);
        setSelectedBets(newBets);
        toast({
          title: "Apuesta removida",
          description: `${getSelectionName(match, type, marketType)} removida del boleto`,
        });
      } else {
        newBets[existingBetIndex] = {
          id: match.id,
          league: match.liga,
          match: `${match.equipoLocal} vs ${match.equipoVisitante}`,
          type,
          odds,
          selection: getSelectionName(match, type, marketType),
          marketType,
        };
        setSelectedBets(newBets);
        setShowBetSlip(true);
        toast({
          title: "Selección actualizada",
          description: `Cambiada a ${getSelectionName(match, type, marketType)} - Cuota: ${odds}`,
        });
      }
    } else {
      const newBet = {
        id: match.id,
        league: match.liga,
        match: `${match.equipoLocal} vs ${match.equipoVisitante}`,
        type,
        odds,
        selection: getSelectionName(match, type, marketType),
        marketType,
      };
      setSelectedBets([...selectedBets, newBet]);
      setShowBetSlip(true);
      toast({
        title: "Apuesta agregada",
        description: `${getSelectionName(match, type, marketType)} - Cuota: ${odds}`,
      });
    }
  };

  const isBetSelected = (matchId, type, marketType = "1x2") => {
    return selectedBets.some(
      (bet) => bet.id === matchId && bet.type === type && bet.marketType === marketType
    );
  };

  const removeBet = (id, type, marketType) => {
    setSelectedBets(
      selectedBets.filter(
        (bet) => !(bet.id === id && bet.type === type && bet.marketType === marketType)
      )
    );
  };

  const filteredPartidos = partidos.filter((partido) => {
    const matchesSearch =
      partido.equipoLocal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partido.equipoVisitante.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partido.liga.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCountry = selectedCountry === "todos" || partido.pais === selectedCountry;
    const matchesLeague = selectedLeague === "todas" || partido.liga === selectedLeague;

    return matchesSearch && matchesCountry && matchesLeague;
  });

  return {
    searchQuery, setSearchQuery,
    selectedCountry, setSelectedCountry,
    selectedLeague, setSelectedLeague,
    showBetSlip, setShowBetSlip,
    selectedBets, setSelectedBets,
    partidos, loading, filteredPartidos,
    handleBetSelection, isBetSelected, removeBet
  };
}
