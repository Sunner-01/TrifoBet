import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/lib/api';

export function useDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7d');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDashboardStats(range);
      setData(res);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range]);

  return {
    data,
    loading,
    range,
    setRange,
    fetchData
  };
}
