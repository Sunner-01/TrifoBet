import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiGet } from "@/lib/api";

export function usePartidoLogic(id) {
  const [activeTab, setActiveTab] = useState("resultado");
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [selectedBets, setSelectedBets] = useState([]);
  const { toast } = useToast();
  
  const [partido, setPartido] = useState(null);
  const [mercados, setMercados] = useState({
    resultado: [],
    totalGoles: [],
    handicap: [],
    ambosMarcan: [],
    primerGol: [],
    mitadTiempo: [],
    dobleOportunidad: [],
    resultadoExacto: [],
    corners: [],
    tarjetas: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchPartido = async () => {
      try {
        setLoading(true);
        const data = await apiGet('/deportes/futbol/partidos');
        let todosLosPartidos = [];
        if (Array.isArray(data)) {
          todosLosPartidos = data;
        } else if (typeof data === 'object' && data !== null) {
          Object.values(data).forEach(arr => {
            if (Array.isArray(arr)) todosLosPartidos = [...todosLosPartidos, ...arr];
          });
        }

        const formatearFecha = (fechaRaw) => {
          try {
            const fecha = new Date(fechaRaw);
            if (isNaN(fecha.getTime())) return String(fechaRaw);
            const hoy = new Date();
            const manana = new Date();
            manana.setDate(hoy.getDate() + 1);
            
            const hora = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            
            const isHoy = fecha.getDate() === hoy.getDate() && fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
            const isManana = fecha.getDate() === manana.getDate() && fecha.getMonth() === manana.getMonth() && fecha.getFullYear() === manana.getFullYear();
            
            if (isHoy) return hora;
            if (isManana) return `Mañana, ${hora}`;
            return `${fecha.getDate()}/${fecha.getMonth() + 1}, ${hora}`;
          } catch {
            return String(fechaRaw);
          }
        };

        const matchFound = todosLosPartidos.find(p => p.id.toString() === id);
        if (matchFound) {
          setPartido({
            id: matchFound.id,
            equipoLocal: matchFound.equipo_local,
            equipoVisitante: matchFound.equipo_visitante,
            logoLocal: matchFound.escudo_local,
            logoVisitante: matchFound.escudo_visitante,
            liga: matchFound.liga,
            fecha: formatearFecha(matchFound.fecha),
            estadio: "Estadio Principal",
            live: matchFound.estado !== "NS",
            marcadorLocal: matchFound.goles_local || 0,
            marcadorVisitante: matchFound.goles_visitante || 0,
            minuto: matchFound.minuto || null,
            estado: matchFound.estado,
          });

          const cuotas = matchFound.cuotas || {};
          const main = cuotas.main || {};
          const goals = cuotas.goals || {};
          const handicap = cuotas.handicap || {};
          const halves = cuotas.halves || {};
          const corners = cuotas.corners || {};
          const cards = cuotas.cards || {};
          const specials = cuotas.specials || {};

          const newMercados = {
            resultado: [], totalGoles: [], handicap: [], ambosMarcan: [],
            primerGol: [], mitadTiempo: [], dobleOportunidad: [],
            resultadoExacto: [], corners: [], tarjetas: [], especiales: [],
            empateNoValido: [], golesLocal: [], golesVisitante: [],
            parImpar: [], golesMitades: [], mitadMasGoles: [], handicapsAsiaticos: []
          };

          if (main["1X2"]) {
            newMercados.resultado = [
              { name: `1 - ${matchFound.equipo_local}`, odds: main["1X2"]["1"]?.toFixed(2) || "-", type: "1" },
              { name: "X - Empate", odds: main["1X2"]["X"]?.toFixed(2) || "-", type: "X" },
              { name: `2 - ${matchFound.equipo_visitante}`, odds: main["1X2"]["2"]?.toFixed(2) || "-", type: "2" },
            ];
          }

          if (main.double_chance) {
            newMercados.dobleOportunidad = [
              { name: "1X", odds: main.double_chance["1X"]?.toFixed(2) || "-", type: "1X" },
              { name: "12", odds: main.double_chance["12"]?.toFixed(2) || "-", type: "12" },
              { name: "X2", odds: main.double_chance["X2"]?.toFixed(2) || "-", type: "X2" },
            ];
          }

          if (main.draw_no_bet) {
            newMercados.empateNoValido = [
              { name: `1 - ${matchFound.equipo_local}`, odds: main.draw_no_bet["1"]?.toFixed(2) || "-", type: "dnb_1" },
              { name: `2 - ${matchFound.equipo_visitante}`, odds: main.draw_no_bet["2"]?.toFixed(2) || "-", type: "dnb_2" },
            ];
          }

          if (main.btts || goals.both_teams) {
            const bttsSource = main.btts || goals.both_teams;
            newMercados.ambosMarcan = [
              { name: "Sí", odds: bttsSource.yes?.toFixed(2) || "-", type: "btts_yes" },
              { name: "No", odds: bttsSource.no?.toFixed(2) || "-", type: "btts_no" },
            ];
          }

          if (goals.total) {
            Object.keys(goals.total).forEach(line => {
              newMercados.totalGoles.push(
                { name: `Más de ${line}`, odds: goals.total[line].over?.toFixed(2) || "-", type: `over_${line}`, sublabel: `+ ${line}` },
                { name: `Menos de ${line}`, odds: goals.total[line].under?.toFixed(2) || "-", type: `under_${line}`, sublabel: `- ${line}` }
              );
            });
          }

          if (goals.team_total_home) {
            Object.keys(goals.team_total_home).forEach(line => {
              newMercados.golesLocal.push(
                { name: `Más de ${line}`, odds: goals.team_total_home[line].over?.toFixed(2) || "-", type: `home_over_${line}`, sublabel: `+ ${line}` },
                { name: `Menos de ${line}`, odds: goals.team_total_home[line].under?.toFixed(2) || "-", type: `home_under_${line}`, sublabel: `- ${line}` }
              );
            });
          }

          if (goals.team_total_away) {
            Object.keys(goals.team_total_away).forEach(line => {
              newMercados.golesVisitante.push(
                { name: `Más de ${line}`, odds: goals.team_total_away[line].over?.toFixed(2) || "-", type: `away_over_${line}`, sublabel: `+ ${line}` },
                { name: `Menos de ${line}`, odds: goals.team_total_away[line].under?.toFixed(2) || "-", type: `away_under_${line}`, sublabel: `- ${line}` }
              );
            });
          }

          if (goals["1st_half"]) {
            Object.keys(goals["1st_half"]).forEach(line => {
              newMercados.golesMitades.push(
                { name: `1T Más de ${line}`, odds: goals["1st_half"][line].over?.toFixed(2) || "-", type: `1h_over_${line}`, sublabel: `1T +${line}` },
                { name: `1T Menos de ${line}`, odds: goals["1st_half"][line].under?.toFixed(2) || "-", type: `1h_under_${line}`, sublabel: `1T -${line}` }
              );
            });
          }

          if (goals.odd_even) {
            newMercados.parImpar = [
              { name: "Impar", odds: goals.odd_even.odd?.toFixed(2) || "-", type: "odd" },
              { name: "Par", odds: goals.odd_even.even?.toFixed(2) || "-", type: "even" },
            ];
          }

          if (handicap.european) {
            const eu = handicap.european;
            newMercados.handicap = [
              { name: `Local -1`, odds: eu["home_-1"]?.toFixed(2) || "-", type: "eu_h_1" },
              { name: `Empate -1`, odds: eu["draw_-1"]?.toFixed(2) || "-", type: "eu_d_1" },
              { name: `Visit. +1`, odds: eu["away_+1"]?.toFixed(2) || "-", type: "eu_a_1" },
            ];
          }

          if (handicap.asian) {
            Object.keys(handicap.asian).forEach(line => {
              newMercados.handicapsAsiaticos.push(
                { name: `Local ${line}`, odds: handicap.asian[line]["1"]?.toFixed(2) || "-", type: `ah_1_${line}`, sublabel: `1 (${line})` },
                { name: `Visit. ${line}`, odds: handicap.asian[line]["2"]?.toFixed(2) || "-", type: `ah_2_${line}`, sublabel: `2 (${line})` }
              );
            });
          }

          if (halves.winner_1st) {
            newMercados.mitadTiempo = [
              { name: "1", odds: halves.winner_1st["1"]?.toFixed(2) || "-", type: "1h_1" },
              { name: "X", odds: halves.winner_1st["X"]?.toFixed(2) || "-", type: "1h_X" },
              { name: "2", odds: halves.winner_1st["2"]?.toFixed(2) || "-", type: "1h_2" },
            ];
          }

          if (halves.highest_scoring_half) {
            newMercados.mitadMasGoles = [
              { name: "1er Tiempo", odds: halves.highest_scoring_half["1st"]?.toFixed(2) || "-", type: "highest_1h" },
              { name: "Iguales", odds: halves.highest_scoring_half.equal?.toFixed(2) || "-", type: "highest_eq" },
              { name: "2do Tiempo", odds: halves.highest_scoring_half["2nd"]?.toFixed(2) || "-", type: "highest_2h" },
            ];
          }

          if (corners.total) {
            Object.keys(corners.total).forEach(line => {
              newMercados.corners.push(
                { name: `Más de ${line}`, odds: corners.total[line].over?.toFixed(2) || "-", type: `c_over_${line}`, sublabel: `+ ${line}` },
                { name: `Menos de ${line}`, odds: corners.total[line].under?.toFixed(2) || "-", type: `c_under_${line}`, sublabel: `- ${line}` }
              );
            });
          }

          if (cards.total) {
            Object.keys(cards.total).forEach(line => {
              newMercados.tarjetas.push(
                { name: `Más de ${line}`, odds: cards.total[line].over?.toFixed(2) || "-", type: `cards_over_${line}`, sublabel: `+ ${line}` },
                { name: `Menos de ${line}`, odds: cards.total[line].under?.toFixed(2) || "-", type: `cards_under_${line}`, sublabel: `- ${line}` }
              );
            });
          }

          if (cards.red_card) {
            newMercados.tarjetas.push(
              { name: "Tarjeta Roja - Sí", odds: cards.red_card.yes?.toFixed(2) || "-", type: "red_yes" },
              { name: "Tarjeta Roja - No", odds: cards.red_card.no?.toFixed(2) || "-", type: "red_no" }
            );
          }

          if (specials.to_win_to_nil) {
            newMercados.especiales.push(
              { name: "Local Gana a Cero", odds: specials.to_win_to_nil.home?.toFixed(2) || "-", type: "win_nil_home" },
              { name: "Visitante Gana a Cero", odds: specials.to_win_to_nil.away?.toFixed(2) || "-", type: "win_nil_away" }
            );
          }

          if (specials.clean_sheet) {
            newMercados.especiales.push(
              { name: "Portería Cero - Local", odds: specials.clean_sheet.home?.toFixed(2) || "-", type: "cs_home" },
              { name: "Portería Cero - Visit.", odds: specials.clean_sheet.away?.toFixed(2) || "-", type: "cs_away" }
            );
          }

          if (specials.next_10_mins_goal) {
            newMercados.especiales.push(
              { name: "Gol en próx 10m - Sí", odds: specials.next_10_mins_goal.yes?.toFixed(2) || "-", type: "n10m_yes" },
              { name: "Gol en próx 10m - No", odds: specials.next_10_mins_goal.no?.toFixed(2) || "-", type: "n10m_no" }
            );
          }

          setMercados(newMercados);
        } else {
          setError("Partido no encontrado");
        }
      } catch (err) {
        setError("Error al cargar los detalles del partido");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchPartido();
  }, [id]);

  const handleBetSelection = (market, bet) => {
    const existingBetIndex = selectedBets.findIndex(
      (selectedBet) => selectedBet.id === partido.id && selectedBet.marketType === market
    );

    if (existingBetIndex >= 0) {
      const existingBet = selectedBets[existingBetIndex];
      const newBets = [...selectedBets];
      if (existingBet.type === bet.type) {
        newBets.splice(existingBetIndex, 1);
        setSelectedBets(newBets);
        toast({ title: "Apuesta removida", description: `${bet.name} removida del boleto` });
      } else {
        newBets[existingBetIndex] = {
          id: partido.id, league: partido.liga, match: `${partido.equipoLocal} vs ${partido.equipoVisitante}`,
          type: bet.type, odds: bet.odds, selection: bet.name, marketType: market,
        };
        setSelectedBets(newBets);
        setShowBetSlip(true);
        toast({ title: "Seleccion actualizada", description: `${bet.name} - Cuota: ${bet.odds}` });
      }
    } else {
      setSelectedBets([...selectedBets, {
        id: partido.id, league: partido.liga, match: `${partido.equipoLocal} vs ${partido.equipoVisitante}`,
        type: bet.type, odds: bet.odds, selection: bet.name, marketType: market,
      }]);
      setShowBetSlip(true);
      toast({ title: "Apuesta agregada", description: `${bet.name} - Cuota: ${bet.odds}` });
    }
  };

  const isBetSelected = (market, betType) =>
    selectedBets.some((bet) => bet.id === partido?.id && bet.type === betType && bet.marketType === market);

  const removeBet = (betId, type, marketType) =>
    setSelectedBets(selectedBets.filter((bet) => !(bet.id === betId && bet.type === type && bet.marketType === marketType)));

  const clearAllBets = () => setSelectedBets([]);

  return {
    activeTab,
    setActiveTab,
    showBetSlip,
    setShowBetSlip,
    selectedBets,
    partido,
    mercados,
    loading,
    error,
    handleBetSelection,
    isBetSelected,
    removeBet,
    clearAllBets
  };
}
