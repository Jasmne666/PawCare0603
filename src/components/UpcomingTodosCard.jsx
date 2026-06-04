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
  const days = getDaysUntil(todo.due_date);
  const urgentClass =
    days <= 0
      ? 'border-paw-danger/40 bg-paw-danger/10'
      : days <= 3
        ? 'border-paw-warning/50 bg-paw-warning/10'
        : days <= 7
          ? 'border-paw-healthy/30 bg-paw-healthy/10'
          : 'border-paw-border bg-paw-background';
  const badgeClass =
    days <= 0
      ? 'bg-paw-danger/10 text-paw-danger'
      : days <= 3
        ? 'bg-paw-warning/10 text-paw-secondary'
        : days <= 7
          ? 'bg-paw-healthy/10 text-paw-healthy'
          : 'bg-paw-background text-paw-muted';

  return (
    <article className={`rounded-control border px-3 py-3 ${urgentClass}`}>
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
              className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${badgeClass}`}
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
  const [notice, setNotice] = useState('');
  const scheduleTodos = useMemo(
    () => [...todos].sort((a, b) => getDaysUntil(a.due_date) - getDaysUntil(b.due_date)).slice(0, 4),
    [todos],
  );

  const handleComplete = async (todo) => {
    setNotice('');
    setLocalError('');
    try {
      await onCompleteTodo(todo);
      setNotice('已完成，本次照护已记录；如果设置了周期，下一次提醒已自动生成。');
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const handleCreate = async (form) => {
    setNotice('');
    setLocalError('');
    try {
      await onCreateTodo(form);
      setNotice('已保存，下一次提醒已加入健康日程。');
    } catch (err) {
      setLocalError(err.message);
      throw err;
    }
  };

  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-paw-muted">按紧急程度排序</p>
          <h2 className="font-title text-xl font-semibold">健康日程</h2>
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

      {notice && (
        <p className="mt-3 rounded-control border border-paw-healthy bg-paw-healthy/10 px-4 py-3 text-sm leading-6 text-paw-healthy">
          {notice}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {loading ? (
          <p className="rounded-control bg-paw-background px-4 py-3 text-sm text-paw-muted">正在读取待办...</p>
        ) : scheduleTodos.length ? (
          scheduleTodos.map((todo) => (
            <TodoItem key={todo.id} onComplete={handleComplete} pet={pet} saving={saving} todo={todo} />
          ))
        ) : (
          <p className="rounded-control bg-paw-background px-4 py-4 text-sm leading-6 text-paw-muted">
            最近没有待办事项，今天只需要好好陪它玩一会儿 🐾
          </p>
        )}
      </div>

      <PetTodoComposer
        onClose={() => setComposerOpen(false)}
        onSubmit={handleCreate}
        open={composerOpen}
        pet={pet}
        saving={saving}
      />
    </section>
  );
}

export default UpcomingTodosCard;
