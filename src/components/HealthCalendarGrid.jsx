import {
  getCalendarDays,
  getCareFace,
  getCareRecordIcons,
  getCareStatusLevel,
  getLocalDateString,
} from '../utils/careCalendar.js';
import { getPetTodoIcon } from '../data/petTodoOptions.js';
import { getDaysUntil } from '../utils/todoDates.js';

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

function getDayClass({ dateKey, inMonth, record, selectedDate }) {
  const level = getCareStatusLevel(record);
  const selected = dateKey === selectedDate;
  const abnormalClass =
    level === 'severe'
      ? 'border-paw-danger/40 bg-paw-danger/10'
      : level === 'mild'
        ? 'border-[#F2C5B5] bg-[#FFF2EC]'
        : 'border-paw-border bg-paw-card';

  return [
    'min-h-[54px] rounded-control border p-1.5 text-left transition active:scale-[0.98]',
    selected ? 'border-paw-healthy bg-paw-healthy/10 ring-1 ring-paw-healthy' : abnormalClass,
    inMonth ? 'opacity-100' : 'opacity-35',
  ].join(' ');
}

function getMarkerClass(marker) {
  if (marker?.color === 'rose') return 'bg-paw-danger/20 border-paw-danger/50 text-paw-danger';
  if (marker?.color === 'amber') return 'bg-paw-warning/20 border-paw-warning/60 text-paw-secondary';
  if (marker?.color === 'violet') return 'bg-[#EFE7FF] border-[#A77BE8] text-[#6D3FB4]';
  return '';
}

function getTodoHint(todo) {
  if (!todo) return '';
  const days = getDaysUntil(todo.due_date);
  if (days < 0 || days > 30) return '';
  if (days === 0) return `${getPetTodoIcon(todo.type)} 今天`;
  return `${getPetTodoIcon(todo.type)} ${days}天后`;
}

function HealthCalendarGrid({
  monthDate,
  onSelectDate,
  pet,
  recordsByDate,
  selectedDate,
  cycleMarkers = {},
  todosByDate = {},
}) {
  const today = getLocalDateString();
  const days = getCalendarDays(monthDate);

  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-3">
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-paw-muted">
        {weekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const record = recordsByDate[day.dateKey];
          const icons = getCareRecordIcons(record);
          const marker = cycleMarkers[day.dateKey];
          const markerClass = getMarkerClass(marker);

          return (
            <button
              className={`${getDayClass({
                dateKey: day.dateKey,
                inMonth: day.inMonth,
                record,
                selectedDate,
              })} ${markerClass}`}
              key={day.dateKey}
              onClick={() => onSelectDate(day.dateKey)}
              type="button"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-semibold text-paw-primary">{day.day}</span>
                {day.dateKey === today && (
                  <span className="h-1.5 w-1.5 rounded-full bg-paw-healthy" />
                )}
              </div>
              {record && <div className="mt-0.5 text-center text-sm">{getCareFace(record, pet)}</div>}
              {marker && !record && (
                <div className="mt-0.5 truncate text-center text-[9px] font-semibold">{marker.label}</div>
              )}
              <div className="mt-0.5 flex flex-wrap justify-center gap-0.5 text-[9px] leading-none">
                {icons.map((icon) => (
                  <span key={`${day.dateKey}-${icon}`}>{icon}</span>
                ))}
              </div>
              {getTodoHint(todosByDate[day.dateKey]?.[0]) && (
                <p className="mt-1 truncate text-center text-[9px] font-medium text-paw-muted/70">
                  {getTodoHint(todosByDate[day.dateKey][0])}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default HealthCalendarGrid;
