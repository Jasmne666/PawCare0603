import { Link } from 'react-router-dom';
import { dailyCareSummaryFields, getDailyCareLabel } from '../data/dailyCareOptions.js';
import { getCareFace, getCareStatusLevel } from '../utils/careCalendar.js';

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

function DailyCareDetailCard({ dateKey, pet, record }) {
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
        <Link
          className="shrink-0 rounded-control bg-paw-primary px-3 py-2 text-xs font-semibold text-paw-background"
          to="/log"
        >
          编辑当天记录
        </Link>
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
          <div className="mt-3 rounded-control bg-paw-background px-4 py-3">
            <p className="text-[11px] font-semibold text-paw-muted">异常备注</p>
            <p className="mt-1 text-sm leading-6 text-paw-secondary">
              {record.abnormal_notes || '没有额外备注。'}
            </p>
          </div>
        </>
      ) : (
        <p className="mt-4 rounded-control bg-paw-background px-4 py-3 text-sm leading-6 text-paw-muted">
          这一天还没有照护记录。可以从首页的“今日照护”卡片快速补一条当天状态。
        </p>
      )}
    </section>
  );
}

export default DailyCareDetailCard;
