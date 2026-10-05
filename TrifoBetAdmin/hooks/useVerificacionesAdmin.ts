import { useState, useEffect, useCallback } from 'react';
import { getVerificaciones, VerificacionAdmin, VerificacionesResponse } from '@/lib/api';

export function useVerificacionesAdmin() {
  const [data, setData] = useState<VerificacionesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>('pendiente');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedVerification, setSelectedVerification] = useState<VerificacionAdmin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVerificaciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getVerificaciones({
        page,
        limit,
        estado: filterEstado || undefined,
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar verificaciones');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterEstado]);

  useEffect(() => {
    fetchVerificaciones();
  }, [fetchVerificaciones]);

  const handleReview = (verificacion: VerificacionAdmin) => {
    setSelectedVerification(verificacion);
    setIsModalOpen(true);
  };

  const handleSaved = async () => {
    setIsModalOpen(false);
    setSelectedVerification(null);
    await fetchVerificaciones();
  };

  return {
    data,
    loading,
    error,
    filterEstado,
    setFilterEstado,
    page,
    setPage,
    limit,
    setLimit,
    selectedVerification,
    isModalOpen,
    setIsModalOpen,
    fetchVerificaciones,
    handleReview,
    handleSaved
  };
}
