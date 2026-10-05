import { useState, useEffect } from "react";

export function useCasinoGames() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_Back_Url || 'http://localhost:3000';
        const res = await fetch(`${apiUrl}/juegos-casino`);
        if (res.ok) {
          const data = await res.json();
          setGames(data);
        }
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const filteredGames = games.filter((game) => {
    const matchesSearch =
      game.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (game.proveedor && game.proveedor.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let categoryMatch = false;
    if (selectedCategory === "Todos") {
      categoryMatch = true;
    } else {
      categoryMatch = game.categoria?.toLowerCase() === selectedCategory.toLowerCase();
    }
    
    return matchesSearch && categoryMatch;
  });

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    loading,
    filteredGames
  };
}
