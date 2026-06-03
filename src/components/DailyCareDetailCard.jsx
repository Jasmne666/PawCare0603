import { dailyCareSummaryFields, getDailyCareLabel } from '../data/dailyCareOptions.js';
import { getPetTodoIcon } from '../data/petTodoOptions.js';
import { getCareFace, getCareStatusLevel } from '../utils/careCalendar.js';
import { formatDueText } from '../utils/todoDates.js';

function formatSelectedDate(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString('zh-CN', { day: 'numeric', month: 'long', weekday: 'long' });
}

function getStatusText(level) {
  if (level === 'severe') return '需要多观察';
  if (level === 'mild') return '有一点小波动';
  if (level === 'normal') return '整体状态不错';
  return '还没有记录';
}

function formatFoodAmount(record) {
  if (record.food_amount_mode === 'grams' && record.food_amount_grams) {
    return `${record.food_amount_grams}g`;
  }
  return getDailyCareLabel('appetite', record.food_amount_level || record.appetite);
}

function ExtraCareDetails({ record }) {
  const tags = record.species_care_tags || [];

  if (!record.food_amount_grams && !record.walk_count && !record.walk_minutes && !tags.length) return null;

  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      <div className="rounded-control bg-paw-background px-3 py-3">
        <p className="text-[11px] text-paw-muted">🍚 食量</p>
        <p className="mt-1 text-sm font-semibold text-paw-secondary">{formatFoodAmount(record)}</p>
      </div>
      {(record.walk_count || record.walk_minutes) && (
        <div className="rounded-control bg-paw-background px-3 py-3">
          <p className="text-[11px] text-paw-muted">🦮 遛狗</p>
          <p className="mt-1 text-sm font-semibold text-paw-secondary">
            {record.walk_count || 0} 次 · {record.walk_minutes || 0} 分钟
          </p>
        </div>
      )}
      {tags.length > 0 && (
        <div className="col-span-2 rounded-control bg-paw-background px-3 py-3">
          <p className="text-[11px] text-paw-muted">🐾 小观察</p>
          <p className="mt-1 text-sm leading-6 text-paw-secondary">{tags.join('、')}</p>
        </div>
      )}
    </div>
  );
}

function DailyTodoList({ todos }) {
  if (!todos.length) {
    return (
      <p className="rounded-control bg-paw-background px-4 py-3 text-sm leading-6 text-paw-muted">
        这一天没有待办事项。
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <article className="rounded-control border border-paw-border bg-paw-background px-3 py-3" key={todo.id}>
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-sm font-semibold text-paw-secondary">
              <span className="mr-1">{getPetTodoIcon(todo.type)}</span>
              {todo.title}
            </p>
            <span className="shrink-0 rounded-full bg-paw-healthy/10 px-2 py-1 text-[10px] font-semibold text-paw-healthy">
              {formatDueText(todo.due_date)}
            </span>
          </div>
          {todo.note && <p className="mt-1 text-xs leading-5 text-paw-muted">{todo.note}</p>}
        </article>
      ))}
    </div>
  );
}

function DailyCareDetailCard({ dateKey, onAddTodo, onEditRecord, pet, record, todos = [] }) {
  const level = getCareStatusLevel(record);

  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-paw-muted">{formatSelectedDate(dateKey)}</p>
          <h2 className="mt-1 font-title text-2xl font-semibold">
            {getCareFace(record, pet)} {getStatusText(level)}
          </h2>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <button
            className="rounded-control bg-paw-primary px-3 py-2 text-center text-xs font-semibold text-paw-background"
            onClick={onEditRecord}
            type="button"
          >
            {record ? '编辑记录' : '添加记录'}
          </button>
          <button
            className="rounded-control border border-paw-border bg-paw-background px-3 py-2 text-xs font-semibold text-paw-secondary"
            onClick={onAddTodo}
            type="button"
          >
            添加待办
          </button>
        </div>
      </div>

      {record ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {dailyCareSummaryFields.map((field) => (
              <div className="rounded-control bg-paw-background px-3 py-3" key={field.key}>
                <p className="text-[11px] text-paw-muted">
                  {field.icon} {field.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-paw-secondary">
                  {getDailyCareLabel(field.key, record[field.key])}
                </p>
              </div>
            ))}
          </div>
          <ExtraCareDetails record={record} />
          <div className="mt-3 rounded-control bg-paw-background px-4 py-3">
            <p className="text-[11px] font-semibold text-paw-muted">异常备注</p>
            <p className="mt-1 text-sm leading-6 text-paw-secondary">
              {record.abnormal_notes || '没有额外备注。'}
            </p>
          </div>
        </>
      ) : (
        <p className="mt-4 rounded-control bg-paw-background px-4 py-3 text-sm leading-6 text-paw-muted">
          这一天还没有照护记录。点击上方任意记录栏，就能补充当天状态。
        </p>
      )}

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-paw-primary">当天待办</h3>
          <span className="text-xs text-paw-muted">{todos.length} 项</span>
        </div>
        <DailyTodoList todos={todos} />
      </div>
    </section>
  );
}

export default DailyCareDetailCard;
