import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from './useAuth.js';

function getFriendlyError(error) {
  const message = error?.message || '';
  if (message.includes('reminders')) return '健康日程表还没创建。请先运行 reminders SQL。';
  return message || '读取健康日程失败';
}

export function useReminders(petId) {
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState([]);

  const loadReminders = useCallback(async () => {
    if (!user || !petId) {
      setReminders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: queryError } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('pet_id', petId)
        .eq('is_done', false)
        .order('scheduled_date', { ascending: true })
        .limit(3);

      if (queryError) throw queryError;
      setReminders(data ?? []);
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  }, [petId, user]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  return useMemo(
    () => ({
      error,
      loadReminders,
      loading,
      reminders,
    }),
    [error, loadReminders, loading, reminders],
  );
}
