import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '@/lib/api';

export interface TransaccionRetiro {
  id: number;
  monto: number;
  fecha_creacion: string;
  usuario: {
    nombre: string;
    apellido1: string;
    correo: string;
  };
  cuenta_retiro: {
    billetera: string;
    numero_cuenta: string;
    nombre_titular: string;
    qr_url: string | null;
  };
}

export function useSolicitudesRetiro() {
  const [retiros, setRetiros] = useState<TransaccionRetiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRetiro, setActiveRetiro] = useState<TransaccionRetiro | null>(null);
  const [rejectingRetiro, setRejectingRetiro] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRetiros = useCallback(async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      const offset = (page - 1) * limit;
      const res = await fetch(`${API_URL}/retiros/admin/solicitudes?limit=${limit}&offset=${offset}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRetiros(data.data || []);
        setTotalRecords(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching retiros', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchRetiros();
  }, [fetchRetiros]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRetiros();
    setIsRefreshing(false);
  };

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRetiro || !file) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append('comprobante', file);

    try {
      const token = sessionStorage.getItem('admin_token');
      const res = await fetch(`${API_URL}/retiros/admin/procesar/${activeRetiro.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setRetiros(retiros.filter(r => r.id !== activeRetiro.id));
        setNotification({ message: 'Retiro completado exitosamente', type: 'success' });
        closeModal();
      } else {
        const error = await res.json();
        setNotification({ message: `Error: ${error.message}`, type: 'error' });
      }
    } catch (error) {
      setNotification({ message: 'Error de conexión', type: 'error' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleReject = (id: number) => {
    setRejectingRetiro(id);
  };

  const confirmReject = async () => {
    if (!rejectingRetiro) return;
    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      const res = await fetch(`${API_URL}/retiros/admin/rechazar/${rejectingRetiro}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setRetiros(retiros.filter(r => r.id !== rejectingRetiro));
        setNotification({ message: 'Retiro rechazado. El saldo ha sido devuelto.', type: 'success' });
        setRejectingRetiro(null);
      } else {
        const error = await res.json();
        setNotification({ message: `Error: ${error.message}`, type: 'error' });
      }
    } catch (error) {
      setNotification({ message: 'Error de conexión', type: 'error' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const closeModal = () => {
    setActiveRetiro(null);
    setFile(null);
  };

  return {
    retiros,
    loading,
    activeRetiro,
    setActiveRetiro,
    rejectingRetiro,
    setRejectingRetiro,
    file,
    setFile,
    submitting,
    notification,
    page,
    setPage,
    limit,
    setLimit,
    totalRecords,
    isRefreshing,
    handleRefresh,
    handleProcess,
    handleReject,
    confirmReject,
    closeModal
  };
}
