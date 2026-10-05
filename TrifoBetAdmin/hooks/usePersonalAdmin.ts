import { useState, useEffect, useCallback } from 'react';
import { getPersonal, toggleHabilitarPersonal, resetPasswordPersonal } from '@/lib/api';

export function usePersonalAdmin() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [selectedStatsId, setSelectedStatsId] = useState<number | null>(null);
  const [selectedViewWorker, setSelectedViewWorker] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchPersonal = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPersonal({ page, limit, search: searchTerm || undefined });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar personal');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm]);

  useEffect(() => {
    fetchPersonal();
  }, [fetchPersonal]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleToggleEstado = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas cambiar el estado de acceso de este trabajador?')) return;
    setActionLoading(id);
    try {
      await toggleHabilitarPersonal(id);
      await fetchPersonal();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (id: number) => {
    if (!window.confirm('¿Restablecer la contraseña a la por defecto (Pass123.)?')) return;
    setActionLoading(id);
    try {
      const res = await resetPasswordPersonal(id);
      alert(res.message);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return {
    data,
    loading,
    error,
    searchInput,
    setSearchInput,
    page,
    setPage,
    limit,
    setLimit,
    isCreateModalOpen,
    setIsCreateModalOpen,
    selectedWorker,
    setSelectedWorker,
    selectedStatsId,
    setSelectedStatsId,
    selectedViewWorker,
    setSelectedViewWorker,
    actionLoading,
    fetchPersonal,
    handleToggleEstado,
    handleResetPassword
  };
}
