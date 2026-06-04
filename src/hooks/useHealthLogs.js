import { useCallback, useMemo, useState } from 'react';
import { DEEPSEEK_SYSTEM_PROMPT, callDeepSeek } from '../lib/deepseek.js';
import { supabase } from '../lib/supabase.js';
import { useAuth } from './useAuth.js';

export const emptyHealthLogForm = {
  log_date: new Date().toISOString().slice(0, 10),
  food_amount: '',
  water_amount: '',
  poop_count: '1',
  poop_status: '正常',
  mood: '😊',
  activity_level: '正常',
  activity_minutes: '',
  interaction_minutes: '',
  weight_kg: '',
  symptoms: [],
  notes: '',
};

function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null;
  return Number(value);
}

function buildFeedbackPrompt(pet, payload) {
  return `请根据这条宠物每日健康记录，给出1-2句简短即时反馈。

【宠物档案】
名字：${pet.name}
物种：${pet.species}
品种：${pet.breed || '未填写'}
体重：${pet.weight_kg || '未填写'}kg
既往情况：${pet.medical_notes || '无'}

【今日记录】
日期：${payload.log_date}
进食：${payload.food_amount ?? '未记录'}g
饮水：${payload.water_amount ?? '未记录'}ml
排便：${payload.poop_count ?? '未记录'}次，状态：${payload.poop_status || '未记录'}
心情：${payload.mood || '未记录'}
活跃度：${payload.activity_level || '未记录'}
活动时长：${payload.activity_minutes ?? '未记录'}分钟
互动时长：${payload.interaction_minutes ?? '未记录'}分钟
体重：${payload.weight_kg ?? '未记录'}kg
异常症状：${payload.symptoms?.length ? payload.symptoms.join('、') : '无'}
备注：${payload.notes || '无'}`;
}

function toPayload(form, pet, userId) {
  return {
    user_id: userId,
    pet_id: pet.id,
    log_date: form.log_date,
    food_amount: toNumberOrNull(form.food_amount),
    water_amount: toNumberOrNull(form.water_amount),
    poop_count: toNumberOrNull(form.poop_count),
    poop_status: form.poop_status || null,
    mood: form.mood || null,
    activity_level: form.activity_level || null,
    activity_minutes: toNumberOrNull(form.activity_minutes),
    interaction_minutes: toNumberOrNull(form.interaction_minutes),
    weight_kg: toNumberOrNull(form.weight_kg),
    symptoms: form.symptoms,
    notes: form.notes.trim() || null,
    ai_feedback: null,
  };
}

function validateHealthLog(form, pet) {
  if (!pet?.id) throw new Error('请先创建宠物档案');
  if (!form.log_date) throw new Error('请选择记录日期');
}

export function useHealthLogs() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const saveHealthLog = useCallback(
    async (form, pet) => {
      if (!user) throw new Error('请先登录');
      validateHealthLog(form, pet);

      setSaving(true);
      setError('');

      try {
        const payload = toPayload(form, pet, user.id);
        const { data: savedLog, error: saveError } = await supabase
          .from('health_logs')
          .upsert(payload, { onConflict: 'pet_id,log_date' })
          .select('*')
          .single();

        if (saveError) throw saveError;

        let aiFeedback = '';
        try {
          aiFeedback = await callDeepSeek(DEEPSEEK_SYSTEM_PROMPT, buildFeedbackPrompt(pet, payload));
        } catch (feedbackError) {
          aiFeedback = `记录已保存。AI 反馈暂未生成：${feedbackError.message}`;
        }

        const { data: updatedLog, error: updateError } = await supabase
          .from('health_logs')
          .update({ ai_feedback: aiFeedback })
          .eq('id', savedLog.id)
          .select('*')
          .single();

        if (updateError) throw updateError;
        return updatedLog;
      } catch (err) {
        const message = err.message || '保存健康记录失败';
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
      saveHealthLog,
      saving,
    }),
    [error, saveHealthLog, saving],
  );
}
