import { useState, useEffect, useCallback } from 'react';
import { apiRecargas } from '@/lib/recargas-api';

export function useRecargasAdmin() {
  const [data, setData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [solicitudes, estadisticas, ultimasNotifs] = await Promise.all([
        apiRecargas(`/recargas/admin?page=${page}&limit=${limit}&estado=${filterEstado}&busqueda=${busqueda}`),
        apiRecargas('/recargas/admin/estadisticas'),
        apiRecargas('/recargas/admin/notificaciones?limit=5'),
      ]);
      setData(solicitudes);
      setStats(estadisticas);
      setNotifs(ultimasNotifs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterEstado, busqueda]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    data,
    stats,
    notifs,
    loading,
    filterEstado,
    setFilterEstado,
    busqueda,
    setBusqueda,
    page,
    setPage,
    limit,
    setLimit,
    selectedSolicitud,
    setSelectedSolicitud,
    fetchAll
  };
}
