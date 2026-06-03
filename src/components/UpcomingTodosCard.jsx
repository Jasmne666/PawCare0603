import { useMemo, useState } from 'react';
import {
  getPetTodoCategoryLabel,
  getPetTodoIcon,
} from '../data/petTodoOptions.js';
import {
  formatDueText,
  getDaysUntil,
  isWithinThisMonth,
} from '../utils/todoDates.js';
import PetTodoComposer from './PetTodoComposer.jsx';

const filters = [
  { label: '今天', value: 'today' },
  { label: '近 7 天', value: 'week' },
  { label: '本月', value: 'month' },
];

function getFilteredTodos(todos, filter) {
  if (filter === 'today') return todos.filter((todo) => getDaysUntil(todo.due_date) <= 0);
  if (filter === 'week') {
    return todos.filter((todo) => {
      const days = getDaysUntil(todo.due_date);
      return days > 0 && days <= 7;
    });
  }
  return todos.filter((todo) => isWithinThisMonth(todo.due_date));
}

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

function UpcomingTodosCard({
  error,
  loading,
  onCompleteTodo,
  onCreateTodo,
  pet,
  saving,
  todos,
}) {
  const [filter, setFilter] = useState('today');
  const [composerOpen, setComposerOpen] = useState(false);
  const [localError, setLocalError] = useState('');
  const filteredTodos = useMemo(() => getFilteredTodos(todos, filter), [filter, todos]);

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
          <h2 className="font-title text-xl font-semibold">照护清单</h2>
        </div>
        <button
          className="rounded-control bg-paw-primary px-3 py-2 text-xs font-semibold text-paw-background"
          onClick={() => setComposerOpen(true)}
          type="button"
        >
          + 添加
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-card border border-paw-border bg-paw-background p-1">
        {filters.map((item) => (
          <button
            className={`rounded-control px-2 py-2 text-xs font-semibold ${
              filter === item.value ? 'bg-paw-primary text-paw-background' : 'text-paw-muted'
            }`}
            key={item.value}
            onClick={() => setFilter(item.value)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      {(error || localError) && (
        <p className="mt-3 rounded-control border border-paw-danger bg-paw-danger/10 px-4 py-3 text-sm leading-6 text-paw-danger">
          {localError || error}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {loading ? (
          <p className="rounded-control bg-paw-background px-4 py-3 text-sm text-paw-muted">正在读取待办...</p>
        ) : filteredTodos.length ? (
          filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              onComplete={handleComplete}
              pet={pet}
              saving={saving}
              todo={todo}
            />
          ))
        ) : (
          <p className="rounded-control bg-paw-background px-4 py-4 text-sm leading-6 text-paw-muted">
            最近没有待办事项，今天只需要好好陪它玩一会儿 🐾
          </p>
        )}
      </div>

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
