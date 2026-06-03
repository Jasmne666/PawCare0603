import { useCallback, useEffect, useMemo, useState } from 'react';
import { dailyCareQuickActions } from '../data/dailyCareOptions.js';
import { supabase } from '../lib/supabase.js';
import { useAuth } from './useAuth.js';

const defaultCareRecord = {
  activity: 'normal',
  appetite: 'normal',
  interaction: 'none',
  mood: 'normal',
  stool: 'normal',
  water: 'normal',
};

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthRange(monthDate = new Date()) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  return {
    end: getLocalDateString(new Date(year, month + 1, 0)),
    start: getLocalDateString(new Date(year, month, 1)),
  };
}

function getFriendlyError(error) {
  const message = error?.message || '';
  if (message.includes('daily_care_records')) {
    return '今日照护记录表还没创建。请先运行 supabase/daily_care_records.sql。';
  }
  return message || '保存今日照护记录失败';
}

function buildPayload({ patch, petId, record, recordDate, userId }) {
  const currentRecord = record
    ? {
        abnormal_notes: record.abnormal_notes,
        activity: record.activity,
        appetite: record.appetite,
        interaction: record.interaction,
        mood: record.mood,
        stool: record.stool,
        water: record.water,
      }
    : {};

  return {
    ...defaultCareRecord,
    ...currentRecord,
    abnormal_notes: record?.abnormal_notes || null,
    ...patch,
    pet_id: petId,
    record_date: recordDate,
    user_id: userId,
  };
}

export function useMonthlyDailyCareRecords(petId, monthDate) {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const monthRange = useMemo(() => getMonthRange(monthDate), [monthDate]);

  const loadMonthRecords = useCallback(async () => {
    if (!user || !petId) {
      setRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: queryError } = await supabase
        .from('daily_care_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('pet_id', petId)
        .gte('record_date', monthRange.start)
        .lte('record_date', monthRange.end)
        .order('record_date', { ascending: true });

      if (queryError) throw queryError;
      setRecords(data ?? []);
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  }, [monthRange.end, monthRange.start, petId, user]);

  useEffect(() => {
    loadMonthRecords();
  }, [loadMonthRecords]);

  return useMemo(
    () => ({
      error,
      loadMonthRecords,
      loading,
      monthRange,
      records,
    }),
    [error, loadMonthRecords, loading, monthRange, records],
  );
}

export function useDailyCareRecords(petId) {
  const { user } = useAuth();
  const [record, setRecord] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const today = useMemo(() => getLocalDateString(), []);

  const loadTodayRecord = useCallback(async () => {
    if (!user || !petId) {
      setRecord(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: queryError } = await supabase
        .from('daily_care_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('pet_id', petId)
        .eq('record_date', today)
        .maybeSingle();

      if (queryError) throw queryError;
      setRecord(data ?? null);
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  }, [petId, today, user]);

  useEffect(() => {
    loadTodayRecord();
  }, [loadTodayRecord]);

  const saveCareRecord = useCallback(
    async (patch, feedbackMessage = '今日小报告已保存 🐾') => {
      if (!user) throw new Error('请先登录');
      if (!petId) throw new Error('请先选择宠物');
      setSaving(true);
      setError('');
      setFeedback('');

      try {
        const payload = buildPayload({
          patch,
          petId,
          record,
          recordDate: today,
          userId: user.id,
        });
        const { data, error: saveError } = await supabase
          .from('daily_care_records')
          .upsert(payload, { onConflict: 'pet_id,record_date' })
          .select('*')
          .single();

        if (saveError) throw saveError;
        setRecord(data);
        setFeedback(feedbackMessage);
        return data;
      } catch (err) {
        const message = getFriendlyError(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [petId, record, today, user],
  );

  const saveQuickRecord = useCallback(
    async (actionValue) => {
      if (!user) throw new Error('请先登录');
      if (!petId) throw new Error('请先选择宠物');

      const action = dailyCareQuickActions.find((item) => item.value === actionValue);
      if (!action) throw new Error('未知照护状态');

      return saveCareRecord(action.patch, action.feedback);
    },
    [petId, saveCareRecord, user],
  );

  return useMemo(
    () => ({
      error,
      feedback,
      loadTodayRecord,
      loading,
      record,
      saveCareRecord,
      saveQuickRecord,
      saving,
      today,
    }),
    [error, feedback, loadTodayRecord, loading, record, saveCareRecord, saveQuickRecord, saving, today],
  );
}
