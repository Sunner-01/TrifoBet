import { useState, useEffect } from 'react';
import { getTodasApuestas, getEstadisticasApuestas } from '@/lib/api';
import { fmtBetId } from '@/lib/apuestas-utils';

export function useApuestasAdmin() {
  const [bets, setBets] = useState<any[]>([]);
  const [stats, setStats] = useState({ eventosActivos: 0, totalVolumen: 0, totalIngresos: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pendiente' | 'ganada' | 'perdida' | 'cashout'>('todos');
  const [selectedBet, setSelectedBet] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchBets = async () => {
    setLoading(true);
    try {
      const data = await getTodasApuestas({
        page,
        limit,
        search: searchTerm || undefined,
        estado: filterStatus === 'todos' ? undefined : filterStatus
      });
      setBets(data.data || []);
      setTotalRecords(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getEstadisticasApuestas();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBets();
  }, [page, limit, filterStatus]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    fetchBets();
    fetchStats();
  };

  const filteredBets = bets.filter((bet) => {
    if (!searchTerm) return true;
    return (
      bet.usuario?.nombre_usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(bet.id).includes(searchTerm) ||
      fmtBetId(bet.id).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const pendingCount = bets.filter(b => b.estado === 'pendiente').length;
  const wonCount = bets.filter(b => b.estado === 'ganada').length;

  return {
    bets,
    stats,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    selectedBet,
    setSelectedBet,
    loading,
    expandedRow,
    setExpandedRow,
    page,
    setPage,
    limit,
    setLimit,
    totalRecords,
    filteredBets,
    pendingCount,
    wonCount,
    handleRefresh
  };
}
