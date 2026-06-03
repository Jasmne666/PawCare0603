import { useMemo, useState } from 'react';
import {
  getPetTodoCategoryLabel,
  getPetTodoIcon,
} from '../data/petTodoOptions.js';
import {
  formatDueText,
  getDaysUntil,
} from '../utils/todoDates.js';
import PetTodoComposer from './PetTodoComposer.jsx';

function formatLastDone(value) {
  if (!value) return '还没有完成过';
  return `上次完成：${value.slice(5).replace('-', '月')}日`;
}

function TodoItem({ onComplete, pet, saving, todo }) {
  const overdue = getDaysUntil(todo.due_date) < 0;

  return (
    <article
      className={`rounded-control border px-3 py-3 ${
        overdue ? 'border-paw-danger/40 bg-paw-danger/10' : 'border-paw-border bg-paw-background'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-paw-border bg-paw-card text-xs text-paw-muted disabled:opacity-50"
          disabled={saving}
          onClick={() => onComplete(todo)}
          type="button"
        >
          ✓
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-paw-primary">
                <span className="mr-1">{getPetTodoIcon(todo.type)}</span>
                {todo.title}
              </p>
              <p className="mt-1 text-[11px] text-paw-muted">
                {pet.name} · {getPetTodoCategoryLabel(todo.category)}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                overdue ? 'bg-paw-danger/10 text-paw-danger' : 'bg-paw-healthy/10 text-paw-healthy'
              }`}
            >
              {formatDueText(todo.due_date)}
            </span>
          </div>
          <p className="mt-2 text-xs text-paw-muted">{formatLastDone(todo.last_done_date)}</p>
          {todo.note && <p className="mt-1 text-xs leading-5 text-paw-secondary">{todo.note}</p>}
        </div>
      </div>
    </article>
  );
}

function ReminderItem({ pet, todo }) {
  const days = getDaysUntil(todo.due_date);

  return (
    <article className="rounded-control border border-paw-border bg-paw-background px-3 py-3">
      <p className="truncate text-sm font-semibold text-paw-secondary">
        <span className="mr-1">{getPetTodoIcon(todo.type)}</span>
        距离下次{todo.title}还有 {days} 天
      </p>
      <p className="mt-1 text-[11px] text-paw-muted">
        {pet.name} · {todo.due_date.slice(5).replace('-', '月')}日
      </p>
    </article>
  );
}

function UpcomingTodosCard({
  error,
  loading,
  onCompleteTodo,
  onCreateTodo,
  pet,
  saving,
  todos,
}) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [localError, setLocalError] = useState('');
  const todayTodos = useMemo(() => todos.filter((todo) => getDaysUntil(todo.due_date) <= 0), [todos]);
  const futureTodos = useMemo(
    () => todos.filter((todo) => getDaysUntil(todo.due_date) > 0).slice(0, 3),
    [todos],
  );

  const handleComplete = async (todo) => {
    setLocalError('');
    try {
      await onCompleteTodo(todo);
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-paw-muted">近期待办</p>
          <h2 className="font-title text-xl font-semibold">今日要做</h2>
        </div>
        <button
          className="rounded-control bg-paw-primary px-3 py-2 text-xs font-semibold text-paw-background"
          onClick={() => setComposerOpen(true)}
          type="button"
        >
          + 添加
        </button>
      </div>

      {(error || localError) && (
        <p className="mt-3 rounded-control border border-paw-danger bg-paw-danger/10 px-4 py-3 text-sm leading-6 text-paw-danger">
          {localError || error}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {loading ? (
          <p className="rounded-control bg-paw-background px-4 py-3 text-sm text-paw-muted">正在读取待办...</p>
        ) : todayTodos.length ? (
          todayTodos.map((todo) => (
            <TodoItem key={todo.id} onComplete={handleComplete} pet={pet} saving={saving} todo={todo} />
          ))
        ) : (
          <p className="rounded-control bg-paw-background px-4 py-4 text-sm leading-6 text-paw-muted">
            最近没有待办事项，今天只需要好好陪它玩一会儿 🐾
          </p>
        )}
      </div>

      {futureTodos.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-paw-primary">下次提醒</h3>
            <span className="text-xs text-paw-muted">未来 30 天</span>
          </div>
          <div className="space-y-2">
            {futureTodos.map((todo) => (
              <ReminderItem key={todo.id} pet={pet} todo={todo} />
            ))}
          </div>
        </div>
      )}

      <PetTodoComposer
        onClose={() => setComposerOpen(false)}
        onSubmit={onCreateTodo}
        open={composerOpen}
        saving={saving}
      />
    </section>
  );
}

export default UpcomingTodosCard;
