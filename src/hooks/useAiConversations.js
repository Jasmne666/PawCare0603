import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEEPSEEK_SYSTEM_PROMPT, callDeepSeekMessages } from '../lib/deepseek.js';
import { supabase } from '../lib/supabase.js';
import { useAuth } from './useAuth.js';

function buildPetContext(pet, logs) {
  const logLines = logs
    .slice(0, 5)
    .map(
      (log) =>
        `${log.log_date}：进食${log.food_amount ?? '未记录'}g，饮水${log.water_amount ?? '未记录'}ml，排便${log.poop_count ?? '未记录'}次，心情${log.mood || '未记录'}，症状${log.symptoms?.length ? log.symptoms.join('、') : '无'}，备注${log.notes || '无'}`,
    )
    .join('\n');

  return `${DEEPSEEK_SYSTEM_PROMPT}

以下是当前宠物上下文，请基于这些数据回答：

【宠物档案】
姓名：${pet.name}
物种：${pet.species}
品种：${pet.breed || '未填写'}
生日：${pet.birth_date || '未填写'}
体重：${pet.weight_kg || '未填写'}kg
既往情况：${pet.medical_notes || '无'}

【最近健康记录】
${logLines || '暂无健康记录'}`;
}

function toMessage(row) {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    created_at: row.created_at,
  };
}

export function useAiConversations(petId) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const loadMessages = useCallback(async () => {
    if (!user || !petId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: queryError } = await supabase
        .from('ai_conversations')
        .select('id, role, content, created_at')
        .eq('user_id', user.id)
        .eq('pet_id', petId)
        .order('created_at', { ascending: true })
        .limit(30);

      if (queryError) throw queryError;
      setMessages((data ?? []).map(toMessage));
    } catch (err) {
      setError(err.message || '读取 AI 对话失败');
    } finally {
      setLoading(false);
    }
  }, [petId, user]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const saveMessage = useCallback(
    async (role, content) => {
      const { data, error: saveError } = await supabase
        .from('ai_conversations')
        .insert({ user_id: user.id, pet_id: petId, role, content })
        .select('id, role, content, created_at')
        .single();

      if (saveError) throw saveError;
      return toMessage(data);
    },
    [petId, user],
  );

  const sendMessage = useCallback(
    async (question, pet, logs) => {
      if (!user) throw new Error('请先登录');
      if (!pet?.id) throw new Error('请先创建宠物档案');
      if (!question.trim()) return null;

      setSending(true);
      setError('');

      try {
        const userMessage = await saveMessage('user', question.trim());
        setMessages((current) => [...current, userMessage]);

        let assistantText = '';
        try {
          const recentMessages = messages.slice(-8).map(({ role, content }) => ({ role, content }));
          assistantText = await callDeepSeekMessages([
            { role: 'system', content: buildPetContext(pet, logs) },
            ...recentMessages,
            { role: 'user', content: question.trim() },
          ]);
        } catch (aiError) {
          assistantText = `AI 暂未回复：${aiError.message}。你可以先填写 DeepSeek Key 后再提问。`;
        }

        const assistantMessage = await saveMessage('assistant', assistantText);
        setMessages((current) => [...current, assistantMessage]);
        return assistantMessage;
      } catch (err) {
        const message = err.message || '发送 AI 消息失败';
        setError(message);
        throw new Error(message);
      } finally {
        setSending(false);
      }
    },
    [messages, saveMessage, user],
  );

  return useMemo(
    () => ({
      error,
      loadMessages,
      loading,
      messages,
      sendMessage,
      sending,
    }),
    [error, loadMessages, loading, messages, sendMessage, sending],
  );
}
