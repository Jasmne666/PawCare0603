const cloudbaseEnvId = import.meta.env.VITE_CLOUDBASE_ENV_ID;
const cloudbaseAccessKey = import.meta.env.VITE_CLOUDBASE_ACCESS_KEY;
const cloudbaseSdkUrl = 'https://static.cloudbase.net/cloudbase-js-sdk/latest/cloudbase.full.js';

let sdkPromise = null;
let appInstance = null;

export const hasCloudBaseConfig = Boolean(cloudbaseEnvId && cloudbaseAccessKey);

function loadCloudBaseSdk() {
  if (typeof window === 'undefined') return Promise.reject(new Error('CloudBase 只能在浏览器中初始化'));
  if (window.cloudbase) return Promise.resolve(window.cloudbase);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = cloudbaseSdkUrl;
    script.onload = () => {
      if (window.cloudbase) {
        resolve(window.cloudbase);
        return;
      }
      reject(new Error('CloudBase SDK 加载失败'));
    };
    script.onerror = () => reject(new Error('CloudBase SDK 网络加载失败'));
    document.head.appendChild(script);
  });

  return sdkPromise;
}

export async function getCloudBaseApp() {
  if (!hasCloudBaseConfig) {
    throw new Error('请先配置 CloudBase EnvId 和 Publishable Key');
  }

  if (appInstance) return appInstance;

  const cloudbase = await loadCloudBaseSdk();
  appInstance = cloudbase.init({
    env: cloudbaseEnvId,
    accessKey: cloudbaseAccessKey,
  });
  return appInstance;
}

export async function getCloudBaseAuth() {
  const app = await getCloudBaseApp();
  return app.auth({ persistence: 'local' });
}

export async function signInCloudBaseWithEmail({ email, password }) {
  const auth = await getCloudBaseAuth();
  return auth.signInWithEmailAndPassword(email, password);
}

export async function signUpCloudBaseWithEmail({ email, password }) {
  const auth = await getCloudBaseAuth();
  return auth.signUpWithEmailAndPassword(email, password);
}
