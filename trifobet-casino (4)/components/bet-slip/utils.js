// components/bet-slip/utils.js
export const getMarketLabel = (marketType) => {
  const map = {
    "1x2": "Resultado Final",
    "1X2": "Resultado Final",
    resultado: "Resultado Final",
    overunder: "Total de Goles",
    goles: "Total de Goles",
    handicap: "Hándicap",
    doble: "Doble Oportunidad",
    ambos: "Ambos Marcan",
    primer: "Primer Gol",
    tiempo: "Primer Tiempo",
    exacto: "Resultado Exacto",
    corners: "Corners",
    tarjetas: "Tarjetas",
  }
  return map[marketType] || marketType || "Mercado"
}

export const groupBets = (bets) => {
  return Object.values(
    bets.reduce((acc, bet) => {
      const matchName = bet.match || bet.league;
      if (!acc[matchName]) acc[matchName] = { matchName, id: bet.id, bets: [] };
      acc[matchName].bets.push(bet);
      return acc;
    }, {})
  );
}
