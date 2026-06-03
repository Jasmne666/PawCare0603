export const DEEPSEEK_SYSTEM_PROMPT = `你是一位专业温柔的宠物健康顾问，有丰富的兽医学知识。
根据用户提供的宠物数据进行分析，给出具体实用的建议。
语气像朋友一样温暖，善用emoji，回复控制在300字以内，用中文回答。`;

export function getDeepSeekApiKey() {
  const envKey = import.meta.env.VITE_DEEPSEEK_KEY;
  if (envKey) return envKey;
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('pawcare_deepseek_key') || localStorage.getItem('ds_key') || '';
}

async function requestDeepSeek(messages, apiKey, maxTokens) {
  if (!apiKey) {
    throw new Error('未配置 DeepSeek API Key');
  }

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      max_tokens: maxTokens,
      messages,
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || 'DeepSeek 请求失败');
  }

  return data.choices?.[0]?.message?.content || 'AI 暂时没有返回内容';
}

export async function callDeepSeek(
  systemPrompt,
  userMessage,
  apiKey = getDeepSeekApiKey(),
  maxTokens = 220,
) {
  return requestDeepSeek(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    apiKey,
    maxTokens,
  );
}

export async function callDeepSeekMessages(messages, apiKey = getDeepSeekApiKey(), maxTokens = 800) {
  return requestDeepSeek(messages, apiKey, maxTokens);
}
