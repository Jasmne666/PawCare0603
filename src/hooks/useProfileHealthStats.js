import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { calcHealthScore } from '../utils/healthScore.js';
import { addDays, getLocalDateString, parseLocalDate } from '../utils/todoDates.js';
import { useAuth } from './useAuth.js';

function getMonthStart() {
  const today = new Date();
  return getLocalDateString(new Date(today.getFullYear(), today.getMonth(), 1));
}

function getStreak(logs) {
  const days = new Set(logs.map((log) => log.log_date));
  let streak = 0;
  let cursor = parseLocalDate(getLocalDateString());

  while (cursor && days.has(getLocalDateString(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function useProfileHealthStats(petId) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ healthScore: 80, monthRecordDays: 0, streakDays: 0 });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!user || !petId) {
      setStats({ healthScore: 80, monthRecordDays: 0, streakDays: 0 });
      setLoading(false);
      return;
    }

    setLoading(true);
    const today = getLocalDateString();
    const monthStart = getMonthStart();
    const streakStart = addDays(today, -60);

    try {
      const { data, error } = await supabase
        .from('health_logs')
        .select('log_date,food_amount,water_amount,poop_count,mood,symptoms')
        .eq('user_id', user.id)
        .eq('pet_id', petId)
        .gte('log_date', streakStart)
        .lte('log_date', today)
        .order('log_date', { ascending: false });

      if (error) throw error;
      const logs = data ?? [];
      const monthDays = new Set(logs.filter((log) => log.log_date >= monthStart).map((log) => log.log_date));

      setStats({
        healthScore: calcHealthScore(logs),
        monthRecordDays: monthDays.size,
        streakDays: getStreak(logs),
      });
    } catch {
      setStats({ healthScore: 80, monthRecordDays: 0, streakDays: 0 });
    } finally {
      setLoading(false);
    }
  }, [petId, user]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return useMemo(() => ({ loading, reload: loadStats, ...stats }), [loadStats, loading, stats]);
}
