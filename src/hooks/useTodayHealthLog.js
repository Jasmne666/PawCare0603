import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { getLocalDateString } from '../utils/todoDates.js';
import { useAuth } from './useAuth.js';

export function useTodayHealthLog(petId) {
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState(null);
  const today = useMemo(() => getLocalDateString(), []);

  const loadTodayLog = useCallback(async () => {
    if (!user || !petId) {
      setLog(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: queryError } = await supabase
        .from('health_logs')
        .select('*')
        .eq('pet_id', petId)
        .eq('log_date', today)
        .maybeSingle();

      if (queryError) throw queryError;
      setLog(data ?? null);
    } catch (err) {
      setError(err.message || '读取今日健康记录失败');
    } finally {
      setLoading(false);
    }
  }, [petId, today, user]);

  useEffect(() => {
    loadTodayLog();
  }, [loadTodayLog]);

  return useMemo(
    () => ({
      error,
      loadTodayLog,
      loading,
      log,
      today,
    }),
    [error, loadTodayLog, loading, log, today],
  );
}
