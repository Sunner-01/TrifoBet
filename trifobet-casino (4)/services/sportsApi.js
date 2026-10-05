import axios from "axios";

const API_KEY = "123"; 
const BASE_URL = "https://www.thesportsdb.com/api/v1/json/3";

// Obtener todas las ligas
export const getLeagues = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/all_leagues.php`);
    return response.data.leagues.filter((league) => league.strSport === "Soccer");
  } catch (error) {
    console.error("Error fetching leagues:", error);
    return [];
  }
};

// Obtener partidos próximos de una liga
export const getUpcomingMatches = async (leagueId, season = "2024-2025") => {
  try {
    const response = await axios.get(`${BASE_URL}/eventsseason.php?id=${leagueId}&s=${season}`);
    return response.data.events || [];
  } catch (error) {
    console.error("Error fetching upcoming matches:", error);
    return [];
  }
};

// Obtener resultados pasados de una liga
export const getPastMatches = async (leagueId) => {
  try {
    const response = await axios.get(`${BASE_URL}/eventspastleague.php?id=${leagueId}`);
    return response.data.events || [];
  } catch (error) {
    console.error("Error fetching past matches:", error);
    return [];
  }
};

// Obtener detalles de un partido por ID
export const getEventById = async (eventId) => {
  try {
    const response = await axios.get(`${BASE_URL}/lookup_event.php?id=${eventId}`);
    return response.data.events[0] || null;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
};