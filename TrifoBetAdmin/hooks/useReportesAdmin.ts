import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '@/lib/api';

export function useReportesAdmin() {
  const [activeTab, setActiveTab] = useState('financieros');
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Datos
  const [cashflow, setCashflow] = useState({ totalDepositos: 0, totalRetiros: 0, balance: 0 });
  const [ggr, setGgr] = useState({ totalApostado: 0, totalPagado: 0, ggr: 0 });
  const [depositosMetodo, setDepositosMetodo] = useState([]);
  const [topJugadores, setTopJugadores] = useState([]);
  const [rentabilidadCasino, setRentabilidadCasino] = useState([]);
  const [eficienciaSoporte, setEficienciaSoporte] = useState({ abiertos: 0, cerrados: 0, porCategoria: {} });

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('admin_token') : null;
      const headers: HeadersInit = { 
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      const baseUrl = API_URL + '/reportes';

      let params = '';
      if (startDate && endDate) {
        params = `?startDate=${startDate}&endDate=${endDate}`;
      }

      const [resCash, resGgr, resMetodo, resTop, resCasino, resSoporte] = await Promise.all([
        fetch(`${baseUrl}/financieros/cashflow${params}`, { headers }).then(res => res.ok ? res.json() : null),
        fetch(`${baseUrl}/financieros/ggr${params}`, { headers }).then(res => res.ok ? res.json() : null),
        fetch(`${baseUrl}/financieros/depositos-metodo${params}`, { headers }).then(res => res.ok ? res.json() : null),
        fetch(`${baseUrl}/jugadores/top${params}`, { headers }).then(res => res.ok ? res.json() : null),
        fetch(`${baseUrl}/casino/rentabilidad${params}`, { headers }).then(res => res.ok ? res.json() : null),
        fetch(`${baseUrl}/soporte/eficiencia${params}`, { headers }).then(res => res.ok ? res.json() : null),
      ]);

      if (resCash) setCashflow(resCash);
      if (resGgr) setGgr(resGgr);
      if (resMetodo) setDepositosMetodo(resMetodo);
      if (resTop) setTopJugadores(resTop);
      if (resCasino) setRentabilidadCasino(resCasino);
      if (resSoporte) setEficienciaSoporte(resSoporte);

    } catch (e) {
      console.error('Error fetching reports', e);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    activeTab,
    setActiveTab,
    loading,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    cashflow,
    ggr,
    depositosMetodo,
    topJugadores,
    rentabilidadCasino,
    eficienciaSoporte,
    fetchAllData
  };
}
