import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from './useAuth.js';

const baseColumns = 'id,username,avatar_url';
const relationColumns = `${baseColumns},pet_relation_name`;

function isMissingRelationColumn(error) {
  const message = error?.message || '';
  return message.includes('pet_relation_name');
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select(relationColumns)
        .eq('id', user.id)
        .maybeSingle();
      if (queryError && isMissingRelationColumn(queryError)) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('profiles')
          .select(baseColumns)
          .eq('id', user.id)
          .maybeSingle();
        if (fallbackError) throw fallbackError;
        setProfile(fallbackData ?? null);
        return;
      }
      if (queryError) throw queryError;
      setProfile(data ?? null);
    } catch (err) {
      setError(err.message || '读取用户资料失败');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveUsername = useCallback(
    async (username) => {
      if (!user) throw new Error('请先登录');
      if (!username.trim()) throw new Error('请填写昵称');

      setSaving(true);
      setError('');

      try {
        const { data, error: saveError } = await supabase
          .from('profiles')
          .update({ username: username.trim() })
          .eq('id', user.id)
          .select(baseColumns)
          .single();
        if (saveError) throw saveError;
        setProfile((current) => ({ ...current, ...data }));
        return data;
      } catch (err) {
        const message = err.message || '保存昵称失败';
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [user],
  );

  const saveRelationName = useCallback(
    async (relationName) => {
      if (!user) throw new Error('请先登录');
      if (!relationName.trim()) throw new Error('请填写称呼');

      setSaving(true);
      setError('');

      try {
        const { data, error: saveError } = await supabase
          .from('profiles')
          .update({ pet_relation_name: relationName.trim() })
          .eq('id', user.id)
          .select(relationColumns)
          .single();
        if (saveError) throw saveError;
        setProfile((current) => ({ ...current, ...data }));
        return data;
      } catch (err) {
        const missingColumn = isMissingRelationColumn(err);
        const message = missingColumn
          ? '称呼字段还没创建。请先运行 supabase/profile_relation_name.sql。'
          : err.message || '保存称呼失败';
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [user],
  );

  return useMemo(
    () => ({
      error,
      loadProfile,
      loading,
      profile,
      saveRelationName,
      saveUsername,
      saving,
    }),
    [error, loadProfile, loading, profile, saveRelationName, saveUsername, saving],
  );
}
