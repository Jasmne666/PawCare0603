import { useCallback, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from './useAuth.js';

function getFriendlyError(error) {
  const message = error?.message || '';
  if (message.includes('activity_minutes') || message.includes('interaction_minutes')) {
    return '活动/互动分钟字段还没创建。请先运行模块4 SQL。';
  }
  return message || '保存记录项失败';
}

export function useHealthLogEntrySave(petId) {
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const saveHealthLogEntry = useCallback(
    async ({ dateKey, log, patch }) => {
      if (!user) throw new Error('请先登录');
      if (!petId) throw new Error('请先选择宠物');

      setSaving(true);
      setError('');

      try {
        const payload = {
          ...(log || {}),
          ...patch,
          log_date: dateKey,
          pet_id: petId,
          user_id: user.id,
        };
        delete payload.id;
        delete payload.created_at;

        const { data, error: saveError } = await supabase
          .from('health_logs')
          .upsert(payload, { onConflict: 'pet_id,log_date' })
          .select('*')
          .single();

        if (saveError) throw saveError;
        return data;
      } catch (err) {
        const message = getFriendlyError(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [petId, user],
  );

  return useMemo(
    () => ({
      error,
      saveHealthLogEntry,
      saving,
    }),
    [error, saveHealthLogEntry, saving],
  );
}
