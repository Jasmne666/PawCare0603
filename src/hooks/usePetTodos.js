import { useCallback, useEffect, useMemo, useState } from 'react';
import { getPetTodoTemplate } from '../data/petTodoOptions.js';
import { supabase } from '../lib/supabase.js';
import { addDays, getLocalDateString } from '../utils/todoDates.js';
import { useAuth } from './useAuth.js';

function getFriendlyError(error) {
  const message = error?.message || '';
  if (message.includes('pet_todos')) {
    return '近期待办表还没创建。请先运行 supabase/pet_todos.sql。';
  }
  if (message.includes('pet_todos_type_check')) {
    return '待办类型还没更新。请先运行 supabase/pet_todos_species_types.sql。';
  }
  return message || '待办操作失败';
}

function normalizeRepeatDays(value) {
  if (value === '' || value === null || value === undefined) return null;
  const days = Number(value);
  return Number.isFinite(days) && days > 0 ? Math.round(days) : null;
}

function toTodoPayload({ form, petId, userId }) {
  const template = getPetTodoTemplate(form.type);
  const title = form.title.trim() || template.title;

  return {
    category: template.category,
    due_date: form.due_date,
    is_done: false,
    last_done_date: null,
    note: form.note.trim() || null,
    pet_id: petId,
    repeat_days: normalizeRepeatDays(form.repeat_days),
    title,
    type: template.type,
    user_id: userId,
  };
}

function buildNextTodo({ todo, today }) {
  const repeatDays = normalizeRepeatDays(todo.repeat_days);
  if (!repeatDays) return null;

  return {
    category: todo.category,
    due_date: addDays(today, repeatDays),
    is_done: false,
    last_done_date: today,
    note: todo.note,
    pet_id: todo.pet_id,
    repeat_days: repeatDays,
    title: todo.title,
    type: todo.type,
    user_id: todo.user_id,
  };
}

export function usePetTodos(petId, horizonDays = 365) {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadTodos = useCallback(async () => {
    if (!user || !petId) {
      setTodos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: queryError } = await supabase
        .from('pet_todos')
        .select('*')
        .eq('user_id', user.id)
        .eq('pet_id', petId)
        .eq('is_done', false)
        .lte('due_date', addDays(getLocalDateString(), horizonDays))
        .order('due_date', { ascending: true })
        .order('created_at', { ascending: true });

      if (queryError) throw queryError;
      setTodos(data ?? []);
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  }, [horizonDays, petId, user]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const createTodo = useCallback(
    async (form) => {
      if (!user) throw new Error('请先登录');
      if (!petId) throw new Error('请先选择宠物');
      if (!form.due_date) throw new Error('请选择到期日期');

      setSaving(true);
      setError('');

      try {
        const payload = toTodoPayload({ form, petId, userId: user.id });
        const { error: insertError } = await supabase.from('pet_todos').insert(payload);
        if (insertError) throw insertError;
        await loadTodos();
      } catch (err) {
        const message = getFriendlyError(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [loadTodos, petId, user],
  );

  const completeTodo = useCallback(
    async (todo) => {
      if (!user) throw new Error('请先登录');

      const today = getLocalDateString();
      setSaving(true);
      setError('');

      try {
        const { error: updateError } = await supabase
          .from('pet_todos')
          .update({ is_done: true, last_done_date: today })
          .eq('id', todo.id)
          .eq('user_id', user.id);
        if (updateError) throw updateError;

        const nextTodo = buildNextTodo({ todo, today });
        if (nextTodo) {
          const { error: insertError } = await supabase.from('pet_todos').insert(nextTodo);
          if (insertError) throw insertError;
        }

        await loadTodos();
      } catch (err) {
        const message = getFriendlyError(err);
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [loadTodos, user],
  );

  return useMemo(
    () => ({
      completeTodo,
      createTodo,
      error,
      loadTodos,
      loading,
      saving,
      todos,
    }),
    [completeTodo, createTodo, error, loadTodos, loading, saving, todos],
  );
}
