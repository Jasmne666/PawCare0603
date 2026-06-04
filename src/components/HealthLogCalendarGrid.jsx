import { getCalendarDays, getLocalDateString } from '../utils/careCalendar.js';

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

function getDotClass(log) {
  if (!log) return '';
  if (log.mood === '🤒') return 'bg-[#D95F5F]';
  if ((log.symptoms || []).length > 0) return 'bg-[#E8A020]';
  return 'bg-[#4A7C59]';
}

function getDayClass({ dateKey, inMonth, selectedDate, today }) {
  const isSelected = dateKey === selectedDate;
  const isToday = dateKey === today;
  const borderClass = isSelected
    ? 'border-2 border-paw-primary'
    : isToday
      ? 'border-[1.5px] border-paw-primary'
      : 'border border-paw-border';

  return [
    'min-h-[48px] rounded-control bg-paw-card p-1.5 text-left transition active:scale-[0.98]',
    borderClass,
    isSelected ? 'bg-paw-background' : '',
    inMonth ? 'opacity-100' : 'opacity-35',
  ].join(' ');
}

function HealthLogCalendarGrid({ logsByDate, monthDate, onSelectDate, selectedDate }) {
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
          const log = logsByDate[day.dateKey];
          const dotClass = getDotClass(log);

          return (
            <button
              className={getDayClass({
                dateKey: day.dateKey,
                inMonth: day.inMonth,
                selectedDate,
                today,
              })}
              key={day.dateKey}
              onClick={() => onSelectDate(day.dateKey)}
              type="button"
            >
              <span className="text-[11px] font-semibold text-paw-primary">{day.day}</span>
              {dotClass && <span className={`mx-auto mt-2 block h-1.5 w-1.5 rounded-full ${dotClass}`} />}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default HealthLogCalendarGrid;
