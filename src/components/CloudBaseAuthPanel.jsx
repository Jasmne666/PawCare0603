import { useState } from 'react';
import {
  hasCloudBaseConfig,
  sendCloudBaseEmailOtp,
  verifyCloudBaseEmailOtp,
} from '../lib/cloudbase.js';

function getCloudBaseError(error) {
  const message = error?.message || error?.msg || error?.errmsg || '';
  const code = error?.code || error?.errorCode || error?.errCode;
  if (code === 'INVALID_USERNAME_OR_PASSWORD') {
    return '邮箱或密码不正确。请确认：1）邮箱验证链接已经点击激活；2）登录密码和注册时完全一致；3）CloudBase 控制台已开启邮箱登录。';
  }
  if (message.includes('SDK')) return message;
  if (message.includes('network') || message.includes('fetch')) {
    return '无法连接 CloudBase，请检查网络或 CloudBase 环境配置。';
  }
  if (message) return code ? `${message}（${code}）` : message;
  if (code) return `CloudBase 返回错误码：${code}`;

  try {
    return `CloudBase 操作失败：${JSON.stringify(error)}`;
  } catch {
    return 'CloudBase 操作失败，请检查邮箱是否已验证，或查看控制台身份认证配置。';
  }
}

function CloudBaseAuthPanel() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [verifyOtp, setVerifyOtp] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const sendCode = async () => {
    setError('');
    setMessage('');

    if (!email) {
      setError('请输入邮箱');
      return;
    }

    setSubmitting(true);
    try {
      const nextVerifyOtp = await sendCloudBaseEmailOtp(email);
      setVerifyOtp(() => nextVerifyOtp);
      setMessage('验证码已发送，请查看邮箱，然后输入验证码完成登录。');
    } catch (err) {
      setError(getCloudBaseError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const verifyCode = async () => {
    setError('');
    setMessage('');

    if (!token) {
      setError('请输入邮箱验证码');
      return;
    }

    setSubmitting(true);
    try {
      await verifyCloudBaseEmailOtp(verifyOtp, token);
      setMessage('CloudBase 登录成功。下一步可以迁移 PawCare 数据层。');
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
      <p className="mt-2 text-xs leading-5 text-paw-muted">当前按邮箱验证码方式测试：先发送验证码，再输入邮箱收到的验证码登录。</p>

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
          inputMode="numeric"
          onChange={(event) => setToken(event.target.value.trim())}
          placeholder="邮箱验证码"
          type="text"
          value={token}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          className="rounded-control border border-paw-border bg-paw-background px-4 py-3 text-sm font-semibold text-paw-secondary disabled:opacity-50"
          disabled={submitting || !hasCloudBaseConfig}
          onClick={sendCode}
          type="button"
        >
          发送验证码
        </button>
        <button
          className="rounded-control bg-paw-primary px-4 py-3 text-sm font-semibold text-paw-background disabled:opacity-50"
          disabled={submitting || !hasCloudBaseConfig || !verifyOtp}
          onClick={verifyCode}
          type="button"
        >
          验证并登录
        </button>
      </div>
    </section>
  );
}

export default CloudBaseAuthPanel;
