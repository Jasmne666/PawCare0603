import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

function Login() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { hasSupabaseConfig, session, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (session) navigate(from, { replace: true });
  }, [from, navigate, session]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!email || !password) {
      setError('请输入邮箱和密码');
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要 6 位');
      return;
    }

    setSubmitting(true);

    try {
      const authAction = mode === 'login' ? signIn : signUp;
      const data = await authAction({ email, password });

      if (data.session) {
        navigate(from, { replace: true });
        return;
      }

      setMessage('注册成功，请检查邮箱完成验证后再登录');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <section className="flex min-h-[calc(100vh-7.5rem)] flex-col justify-center">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-card border border-paw-border bg-paw-card text-4xl">
          🐾
        </div>
        <p className="text-sm font-semibold text-paw-muted">AI 宠物健康管家</p>
        <h1 className="mt-2 font-title text-4xl font-semibold">PawCare</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-card border border-paw-border bg-paw-card p-5 shadow-sm"
      >
        <div className="mb-5 grid grid-cols-2 rounded-control bg-paw-background p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-control px-4 py-2 text-sm font-semibold transition ${
              isLogin ? 'bg-paw-primary text-white' : 'text-paw-muted'
            }`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`rounded-control px-4 py-2 text-sm font-semibold transition ${
              !isLogin ? 'bg-paw-primary text-white' : 'text-paw-muted'
            }`}
          >
            注册
          </button>
        </div>

        {!hasSupabaseConfig && (
          <div className="mb-4 rounded-control border border-paw-warning bg-[#FDF0D8] px-4 py-3 text-sm text-paw-secondary">
            请先在 .env.local 中配置 Supabase URL 和 anon key。
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-control border border-paw-healthy bg-[#EEF6F1] px-4 py-3 text-sm text-paw-healthy">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-control border border-paw-danger bg-[#FDEAEA] px-4 py-3 text-sm text-paw-danger">
            {error}
          </div>
        )}

        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-semibold text-paw-secondary">邮箱</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            className="w-full rounded-control border border-paw-border bg-paw-background px-4 py-3 text-sm text-paw-primary outline-none transition focus:border-paw-healthy"
          />
        </label>

        <label className="mb-5 block">
          <span className="mb-2 block text-sm font-semibold text-paw-secondary">密码</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="至少 6 位密码"
            className="w-full rounded-control border border-paw-border bg-paw-background px-4 py-3 text-sm text-paw-primary outline-none transition focus:border-paw-healthy"
          />
        </label>

        <button
          type="submit"
          disabled={submitting || !hasSupabaseConfig}
          className="w-full rounded-control bg-paw-primary px-4 py-3 font-title text-lg font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-45"
        >
          {submitting ? '处理中...' : isLogin ? '登录' : '创建账号'}
        </button>
      </form>
    </section>
  );
}

export default Login;
