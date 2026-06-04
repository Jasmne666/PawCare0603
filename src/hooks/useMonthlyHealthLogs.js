import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { getLocalDateString } from '../utils/todoDates.js';
import { useAuth } from './useAuth.js';

function getMonthRange(monthDate = new Date()) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  return {
    end: getLocalDateString(new Date(year, month + 1, 0)),
    start: getLocalDateString(new Date(year, month, 1)),
  };
}

export function useMonthlyHealthLogs(petId, monthDate) {
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const monthRange = useMemo(() => getMonthRange(monthDate), [monthDate]);

  const loadHealthLogs = useCallback(async () => {
    if (!user || !petId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: queryError } = await supabase
        .from('health_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('pet_id', petId)
        .gte('log_date', monthRange.start)
        .lte('log_date', monthRange.end)
        .order('log_date', { ascending: true });

      if (queryError) throw queryError;
      setLogs(data ?? []);
    } catch (err) {
      setError(err.message || '读取健康日历失败');
    } finally {
      setLoading(false);
    }
  }, [monthRange.end, monthRange.start, petId, user]);

  useEffect(() => {
    loadHealthLogs();
  }, [loadHealthLogs]);

  return useMemo(
    () => ({
      error,
      loadHealthLogs,
      loading,
      logs,
      monthRange,
    }),
    [error, loadHealthLogs, loading, logs, monthRange],
  );
}
