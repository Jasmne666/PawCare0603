import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { hasSupabaseConfig, supabase } from '../lib/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      if (!hasSupabaseConfig) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (mounted) setSession(data.session ?? null);
      } catch (error) {
        if (mounted) setAuthError(error.message || '读取登录状态失败');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSession();

    if (!hasSupabaseConfig) {
      return () => {
        mounted = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthError('');
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    if (!hasSupabaseConfig) throw new Error('请先配置 Supabase 环境变量');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setSession(data.session ?? null);
      return data;
    } catch (error) {
      throw new Error(error.message || '登录失败，请稍后重试');
    }
  }, []);

  const signUp = useCallback(async ({ email, password }) => {
    if (!hasSupabaseConfig) throw new Error('请先配置 Supabase 环境变量');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      setSession(data.session ?? null);
      return data;
    } catch (error) {
      throw new Error(error.message || '注册失败，请稍后重试');
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!hasSupabaseConfig) return;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
    } catch (error) {
      throw new Error(error.message || '退出登录失败');
    }
  }, []);

  const value = useMemo(
    () => ({
      authError,
      hasSupabaseConfig,
      loading,
      session,
      signIn,
      signOut,
      signUp,
      user: session?.user ?? null,
    }),
    [authError, loading, session, signIn, signOut, signUp],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth 必须在 AuthProvider 内使用');
  return context;
}
