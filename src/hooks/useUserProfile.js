import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from './useAuth.js';

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
        .select('id,username,avatar_url')
        .eq('id', user.id)
        .maybeSingle();
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
          .select('id,username,avatar_url')
          .single();
        if (saveError) throw saveError;
        setProfile(data);
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

  return useMemo(
    () => ({
      error,
      loadProfile,
      loading,
      profile,
      saveUsername,
      saving,
    }),
    [error, loadProfile, loading, profile, saveUsername, saving],
  );
}
