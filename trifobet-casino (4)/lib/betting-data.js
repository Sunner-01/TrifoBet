// Datos dinámicos para las apuestas
export const generateDynamicOdds = () => {
  const baseOdds = [1.5, 1.8, 2.1, 2.4, 2.8, 3.2, 3.6, 4.0, 4.5, 5.0]
  return baseOdds[Math.floor(Math.random() * baseOdds.length)].toFixed(2)
}

export const generateLiveScore = () => {
  const homeScore = Math.floor(Math.random() * 4)
  const awayScore = Math.floor(Math.random() * 4)
  return `${homeScore} - ${awayScore}`
}

export const generateLiveTime = () => {
  const times = ["15'", "23'", "34'", "45+2'", "52'", "67'", "78'", "89'", "90+3'"]
  return times[Math.floor(Math.random() * times.length)]
}

export const generateMarketCount = () => {
  return Math.floor(Math.random() * 100) + 50 // Entre 50 y 150 mercados
}

export const generatePopularity = () => {
  return Math.floor(Math.random() * 40) + 60 // Entre 60 y 100
}

export const updateMatchData = (match) => {
  return {
    ...match,
    cuotaLocal: generateDynamicOdds(),
    cuotaEmpate: match.cuotaEmpate ? generateDynamicOdds() : undefined,
    cuotaVisitante: generateDynamicOdds(),
    overUnder: match.overUnder
      ? {
          ...match.overUnder,
          over: generateDynamicOdds(),
          under: generateDynamicOdds(),
        }
      : undefined,
    handicap: match.handicap
      ? {
          ...match.handicap,
          home: generateDynamicOdds(),
          away: generateDynamicOdds(),
        }
      : undefined,
    resultado: match.live ? generateLiveScore() : undefined,
    tiempo: match.live ? generateLiveTime() : undefined,
    mercados: generateMarketCount(),
    popularidad: generatePopularity(),
  }
}

export const generateRandomMatches = (count = 10) => {
  const teams = [
    { name: "Barcelona", logo: "/placeholder.svg?height=40&width=40&text=FCB" },
    { name: "Real Madrid", logo: "/placeholder.svg?height=40&width=40&text=RMA" },
    { name: "Manchester City", logo: "/placeholder.svg?height=40&width=40&text=MCI" },
    { name: "Liverpool", logo: "/placeholder.svg?height=40&width=40&text=LIV" },
    { name: "Bayern Munich", logo: "/placeholder.svg?height=40&width=40&text=FCB" },
    { name: "PSG", logo: "/placeholder.svg?height=40&width=40&text=PSG" },
    { name: "Juventus", logo: "/placeholder.svg?height=40&width=40&text=JUV" },
    { name: "Chelsea", logo: "/placeholder.svg?height=40&width=40&text=CHE" },
    { name: "Arsenal", logo: "/placeholder.svg?height=40&width=40&text=ARS" },
    { name: "Inter Milan", logo: "/placeholder.svg?height=40&width=40&text=INT" },
  ]

  const leagues = ["LaLiga", "Premier League", "Bundesliga", "Serie A", "Ligue 1", "Champions League"]
  const countries = ["espana", "inglaterra", "alemania", "italia", "francia", "europa"]

  return Array.from({ length: count }, (_, i) => {
    const homeTeam = teams[Math.floor(Math.random() * teams.length)]
    let awayTeam = teams[Math.floor(Math.random() * teams.length)]
    while (awayTeam.name === homeTeam.name) {
      awayTeam = teams[Math.floor(Math.random() * teams.length)]
    }

    const league = leagues[Math.floor(Math.random() * leagues.length)]
    const isLive = Math.random() < 0.3 // 30% probabilidad de estar en vivo
    const isHighlighted = Math.random() < 0.4 // 40% probabilidad de ser destacado

    return updateMatchData({
      id: i + 100,
      deporte: "futbol",
      liga: league,
      pais: countries[Math.floor(Math.random() * countries.length)],
      equipoLocal: homeTeam.name,
      equipoVisitante: awayTeam.name,
      logoLocal: homeTeam.logo,
      logoVisitante: awayTeam.logo,
      fecha: isLive ? "En vivo" : `Hoy, ${Math.floor(Math.random() * 12) + 12}:${Math.random() < 0.5 ? "00" : "30"}`,
      cuotaLocal: "0.00", // Se actualizará con generateDynamicOdds
      cuotaEmpate: league !== "NBA" ? "0.00" : undefined, // Solo fútbol tiene empate
      cuotaVisitante: "0.00", // Se actualizará con generateDynamicOdds
      overUnder: { over: "0.00", under: "0.00", line: "2.5" },
      handicap: { home: "0.00", away: "0.00", line: "0" },
      destacado: isHighlighted,
      live: isLive,
      estadio: `Estadio ${homeTeam.name}`,
      temperatura: `${Math.floor(Math.random() * 15) + 10}°C`,
    })
  })
}

// Función para simular actualizaciones en tiempo real
export const simulateRealTimeUpdates = (matches) => {
  return matches.map((match) => {
    // Solo actualizar partidos en vivo
    if (match.live && Math.random() < 0.1) {
      // 10% probabilidad de actualización
      return updateMatchData(match)
    }
    return match
  })
}

// Datos de deportes con contadores dinámicos
export const getSportsWithCounts = () => {
  return [
    { id: "futbol", name: "Fútbol", icon: "⚽", count: Math.floor(Math.random() * 500) + 800, active: true },
    { id: "baloncesto", name: "Baloncesto", icon: "🏀", count: Math.floor(Math.random() * 200) + 300, active: true },
    { id: "tenis", name: "Tenis", icon: "🎾", count: Math.floor(Math.random() * 150) + 200, active: true },
    { id: "beisbol", name: "Béisbol", icon: "⚾", count: Math.floor(Math.random() * 100) + 150, active: true },
    { id: "hockey", name: "Hockey", icon: "🏒", count: Math.floor(Math.random() * 80) + 100, active: true },
    { id: "voleibol", name: "Voleibol", icon: "🏐", count: Math.floor(Math.random() * 50) + 60, active: true },
    {
      id: "futbol-americano",
      name: "Fútbol Americano",
      icon: "🏈",
      count: Math.floor(Math.random() * 80) + 120,
      active: true,
    },
    { id: "rugby", name: "Rugby", icon: "🏉", count: Math.floor(Math.random() * 40) + 50, active: true },
    { id: "golf", name: "Golf", icon: "⛳", count: Math.floor(Math.random() * 30) + 20, active: true },
    { id: "boxeo", name: "Boxeo", icon: "🥊", count: Math.floor(Math.random() * 20) + 15, active: true },
    { id: "mma", name: "MMA", icon: "🥋", count: Math.floor(Math.random() * 15) + 15, active: true },
    { id: "formula1", name: "Fórmula 1", icon: "🏎️", count: Math.floor(Math.random() * 8) + 5, active: true },
    { id: "ciclismo", name: "Ciclismo", icon: "🚴", count: Math.floor(Math.random() * 15) + 10, active: true },
    { id: "esports", name: "eSports", icon: "🎮", count: Math.floor(Math.random() * 100) + 80, active: true },
    { id: "dardos", name: "Dardos", icon: "🎯", count: Math.floor(Math.random() * 10) + 10, active: true },
  ]
}

// Función para generar estadísticas de partidos en vivo
export const generateLiveStats = () => {
  const homePos = Math.floor(Math.random() * 40) + 30
  const awayPos = 100 - homePos

  return {
    posesion: `${homePos}% - ${awayPos}%`,
    tiros: `${Math.floor(Math.random() * 10) + 5} - ${Math.floor(Math.random() * 10) + 5}`,
    corners: `${Math.floor(Math.random() * 8) + 2} - ${Math.floor(Math.random() * 8) + 2}`,
  }
}