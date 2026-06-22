import { useState } from 'react';
import {
  hasCloudBaseConfig,
  signInCloudBaseWithEmail,
  signUpCloudBaseWithEmail,
} from '../lib/cloudbase.js';

function getCloudBaseError(error) {
  const message = error?.message || '';
  if (message.includes('SDK')) return message;
  if (message.includes('network') || message.includes('fetch')) {
    return '无法连接 CloudBase，请检查网络或 CloudBase 环境配置。';
  }
  return message || 'CloudBase 操作失败';
}

function CloudBaseAuthPanel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (mode) => {
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
      if (mode === 'register') {
        await signUpCloudBaseWithEmail({ email, password });
        setMessage('CloudBase 注册请求已发送。若开启邮箱验证，请先查看邮箱。');
      } else {
        await signInCloudBaseWithEmail({ email, password });
        setMessage('CloudBase 登录成功。下一步可以迁移 PawCare 数据层。');
      }
    } catch (err) {
      setError(getCloudBaseError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-4 rounded-card border border-paw-border bg-paw-card p-5">
      <p className="text-xs font-semibold text-paw-muted">CloudBase 登录测试</p>
      <h2 className="mt-1 font-title text-xl font-semibold text-paw-primary">国内认证通路测试</h2>
      <p className="mt-2 text-xs leading-5 text-paw-muted">
        这一步只验证 CloudBase 邮箱注册/登录，不会进入 PawCare 主应用，也不会影响现有数据。
      </p>

      {!hasCloudBaseConfig && (
        <p className="mt-3 rounded-control border border-paw-warning bg-[#FDF0D8] px-3 py-2 text-xs text-paw-secondary">
          请先配置 CloudBase EnvId 和 Publishable Key。
        </p>
      )}

      {message && (
        <p className="mt-3 rounded-control border border-paw-healthy bg-[#EEF6F1] px-3 py-2 text-xs text-paw-healthy">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-control border border-paw-danger bg-[#FDEAEA] px-3 py-2 text-xs text-paw-danger">
          {error}
        </p>
      )}

      <div className="mt-4 space-y-3">
        <input
          className="w-full rounded-control border border-paw-border bg-paw-background px-4 py-3 text-sm outline-none focus:border-paw-healthy"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="CloudBase 测试邮箱"
          type="email"
          value={email}
        />
        <input
          className="w-full rounded-control border border-paw-border bg-paw-background px-4 py-3 text-sm outline-none focus:border-paw-healthy"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="至少 6 位密码"
          type="password"
          value={password}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          className="rounded-control border border-paw-border bg-paw-background px-4 py-3 text-sm font-semibold text-paw-secondary disabled:opacity-50"
          disabled={submitting || !hasCloudBaseConfig}
          onClick={() => submit('register')}
          type="button"
        >
          注册测试
        </button>
        <button
          className="rounded-control bg-paw-primary px-4 py-3 text-sm font-semibold text-paw-background disabled:opacity-50"
          disabled={submitting || !hasCloudBaseConfig}
          onClick={() => submit('login')}
          type="button"
        >
          登录测试
        </button>
      </div>
    </section>
  );
}

export default CloudBaseAuthPanel;
