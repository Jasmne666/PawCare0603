import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from './useAuth.js';

export function useRecentHealthLogs(petId, limit = 7) {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = useCallback(async () => {
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
        .order('log_date', { ascending: false })
        .limit(limit);

      if (queryError) throw queryError;
      setLogs(data ?? []);
    } catch (err) {
      setError(err.message || '读取健康记录失败');
    } finally {
      setLoading(false);
    }
  }, [limit, petId, user]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return useMemo(
    () => ({
      error,
      loadLogs,
      loading,
      logs,
    }),
    [error, loadLogs, loading, logs],
  );
}
