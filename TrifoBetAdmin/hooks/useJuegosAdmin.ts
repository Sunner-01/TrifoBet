import { useState, useEffect, useMemo } from 'react';
import { getJuegosAdminStats, createJuego, updateJuego, deleteJuego, JuegoCasino } from '@/lib/api';

export function useJuegosAdmin() {
  const [games, setGames] = useState<JuegoCasino[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterStats, setFilterStats] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<JuegoCasino | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'metricas' | 'gestion'>('metricas');
  const [sortConfig, setSortConfig] = useState<{ key: keyof JuegoCasino; direction: 'asc' | 'desc' } | null>(null);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const data = await getJuegosAdminStats();
      setGames(data);
    } catch (error) {
      console.error('Error fetching games:', error);
      alert('Error cargando juegos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleAddGame = () => {
    setSelectedGame(null);
    setIsModalOpen(true);
  };

  const handleEditGame = (game: JuegoCasino) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  const handleSaveGame = async (gameData: Partial<JuegoCasino>) => {
    try {
      if (selectedGame) {
        await updateJuego(selectedGame.id, gameData);
      } else {
        await createJuego(gameData);
      }
      setIsModalOpen(false);
      fetchGames();
    } catch (error) {
      console.error('Error saving game', error);
      alert('Error guardando el juego');
    }
  };

  const handleDeleteGame = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este juego?')) {
      try {
        await deleteJuego(id);
        fetchGames();
      } catch (error) {
        console.error('Error deleting game', error);
        alert('Error eliminando el juego');
      }
    }
  };

  const toggleGameStatus = async (game: JuegoCasino) => {
    try {
      await updateJuego(game.id, { habilitado: !game.habilitado });
      fetchGames();
    } catch (error) {
      console.error('Error updating game status', error);
    }
  };

  const handleSort = (key: keyof JuegoCasino) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  // Memoized computations
  const filteredGames = useMemo(() => {
    let result = games.filter((game) => {
      const matchesSearch =
        game.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.proveedor?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'todos' || game.categoria === filterType;

      let matchesStatus = true;
      if (filterStatus === 'activos') matchesStatus = game.habilitado === true;
      if (filterStatus === 'inactivos') matchesStatus = game.habilitado === false;

      return matchesSearch && matchesType && matchesStatus;
    });

    if (filterStats === 'mas_jugados') {
      result.sort((a, b) => (b.partidasJugadas || 0) - (a.partidasJugadas || 0));
    } else if (filterStats === 'menos_jugados') {
      result.sort((a, b) => (a.partidasJugadas || 0) - (b.partidasJugadas || 0));
    } else if (filterStats === 'mas_ganancias') {
      result.sort((a, b) => (b.gananciaNeta || 0) - (a.gananciaNeta || 0));
    } else if (filterStats === 'menos_ganancias') {
      result.sort((a, b) => (a.gananciaNeta || 0) - (b.gananciaNeta || 0));
    }

    return result;
  }, [games, searchTerm, filterType, filterStatus, filterStats]);

  const sortedGames = useMemo(() => {
    return [...filteredGames].sort((a, b) => {
      if (!sortConfig) return 0;
      const aValue = a[sortConfig.key] || 0;
      const bValue = b[sortConfig.key] || 0;
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredGames, sortConfig]);

  const globalMontoApostado = useMemo(() => games.reduce((sum, g) => sum + (g.montoApostado || 0), 0), [games]);
  const globalMontoRetorno = useMemo(() => games.reduce((sum, g) => sum + (g.montoRetorno || 0), 0), [games]);
  const globalGananciaNeta = useMemo(() => games.reduce((sum, g) => sum + (g.gananciaNeta || 0), 0), [games]);
  const globalPartidasJugadas = useMemo(() => games.reduce((sum, g) => sum + (g.partidasJugadas || 0), 0), [games]);

  return {
    games,
    loading,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    filterStats,
    setFilterStats,
    activeTab,
    setActiveTab,
    isModalOpen,
    setIsModalOpen,
    selectedGame,
    handleAddGame,
    handleEditGame,
    handleSaveGame,
    handleDeleteGame,
    toggleGameStatus,
    handleSort,
    sortedGames,
    filteredGames,
    globalMontoApostado,
    globalMontoRetorno,
    globalGananciaNeta,
    globalPartidasJugadas
  };
}
