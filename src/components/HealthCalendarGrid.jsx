import {
  getCalendarDays,
  getCareFace,
  getCareRecordIcons,
  getCareStatusLevel,
  getLocalDateString,
} from '../utils/careCalendar.js';

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
    'min-h-[74px] rounded-control border p-2 text-left transition active:scale-[0.98]',
    selected ? 'border-paw-healthy bg-paw-healthy/10 ring-1 ring-paw-healthy' : abnormalClass,
    inMonth ? 'opacity-100' : 'opacity-35',
  ].join(' ');
}

function HealthCalendarGrid({ monthDate, onSelectDate, pet, recordsByDate, selectedDate }) {
  const today = getLocalDateString();
  const days = getCalendarDays(monthDate);

  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-4">
      <div className="mb-3 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-paw-muted">
        {weekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const record = recordsByDate[day.dateKey];
          const icons = getCareRecordIcons(record);

          return (
            <button
              className={getDayClass({
                dateKey: day.dateKey,
                inMonth: day.inMonth,
                record,
                selectedDate,
              })}
              key={day.dateKey}
              onClick={() => onSelectDate(day.dateKey)}
              type="button"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-paw-primary">{day.day}</span>
                {day.dateKey === today && (
                  <span className="h-1.5 w-1.5 rounded-full bg-paw-healthy" />
                )}
              </div>
              <div className={`mt-1 text-center text-base ${record ? '' : 'text-paw-muted/45'}`}>
                {getCareFace(record, pet)}
              </div>
              <div className="mt-1 flex flex-wrap justify-center gap-0.5 text-[10px] leading-none">
                {icons.map((icon) => (
                  <span key={`${day.dateKey}-${icon}`}>{icon}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default HealthCalendarGrid;
