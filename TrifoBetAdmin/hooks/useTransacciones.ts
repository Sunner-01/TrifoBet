import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

export interface Transaccion {
  id: number;
  usuario_id: number;
  tipo: 'deposito' | 'retiro' | 'apuesta' | 'ganancia' | 'reembolso';
  monto: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'completado' | 'cancelado';
  descripcion: string;
  fecha_creacion: string;
  usuario: {
    nombre: string;
    apellido1: string;
    correo: string;
    nombre_usuario: string;
  };
  entidad_financiera?: { nombre: string };
  metodo_pago?: { nombre: string };
}

export const statusStyles = {
  completado: 'bg-primary/10 text-primary',
  aprobado: 'bg-green-500/10 text-green-600',
  rechazado: 'bg-red-500/10 text-red-600',
  pendiente: 'bg-yellow-500/10 text-yellow-600',
  cancelado: 'bg-destructive/10 text-destructive',
};

export const typeColors = {
  deposito: 'text-primary',
  retiro: 'text-muted-foreground',
  apuesta: 'text-blue-400',
  ganancia: 'text-green-400',
  reembolso: 'text-orange-400',
};

export function useTransacciones() {
  const [transactions, setTransactions] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      const offset = (page - 1) * limit;
      let url = `${API_URL}/transacciones/admin/historial?limit=${limit}&offset=${offset}`;
      if (filterType !== 'todos') url += `&tipo=${filterType}`;
      if (filterStatus !== 'todos') url += `&estado=${filterStatus}`;
      if (searchTerm) url += `&searchTerm=${encodeURIComponent(searchTerm)}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transacciones);
        setTotalRecords(data.total || 0);
      }
    } catch (error) {
      console.error('Error cargando transacciones', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTransactions();
    setIsRefreshing(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filterType, filterStatus, page, limit]);

  const totalIngresos = transactions
    .filter((t) => (t.tipo === 'deposito' || t.tipo === 'ganancia') && (t.estado === 'completado' || t.estado === 'aprobado'))
    .reduce((sum, t) => sum + t.monto, 0);

  const totalEgresos = transactions
    .filter((t) => t.tipo === 'retiro' && (t.estado === 'completado' || t.estado === 'aprobado'))
    .reduce((sum, t) => sum + t.monto, 0);

  return {
    transactions,
    loading,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    page,
    setPage,
    limit,
    setLimit,
    totalRecords,
    isRefreshing,
    handleRefresh,
    totalIngresos,
    totalEgresos
  };
}
