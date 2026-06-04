import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { addDays, getLocalDateString } from '../utils/todoDates.js';
import { useAuth } from './useAuth.js';

export function useSevenDayHealthLogCount(petId) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadCount = useCallback(async () => {
    if (!user || !petId) {
      setCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const endDate = getLocalDateString();
    const startDate = addDays(endDate, -6);

    try {
      const { count: nextCount, error } = await supabase
        .from('health_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('pet_id', petId)
        .gte('log_date', startDate)
        .lte('log_date', endDate);

      if (error) throw error;
      setCount(nextCount ?? 0);
    } catch {
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [petId, user]);

  useEffect(() => {
    loadCount();
  }, [loadCount]);

  return useMemo(() => ({ count, loading, reload: loadCount }), [count, loadCount, loading]);
}
