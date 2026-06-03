import { formatLogDate } from '../utils/dateFormat.js';
import { isAbnormalLog } from '../utils/logStatus.js';

function MetricBox({ icon, label, value }) {
  return (
    <div className="rounded-control bg-paw-background p-3 text-center">
      <p className="text-lg">{icon}</p>
      <p className="mt-1 text-[11px] text-paw-muted">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}

function HistoryLogCard({ log }) {
  const abnormal = isAbnormalLog(log);

  return (
    <article className="rounded-card border border-paw-border bg-paw-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-card bg-paw-background text-2xl">
            {log.mood || '😐'}
          </div>
          <div>
            <h2 className="text-sm font-semibold">{formatLogDate(log.log_date)}</h2>
            <p className="mt-1 text-xs text-paw-muted">{log.log_date}</p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            abnormal ? 'bg-paw-danger/10 text-paw-danger' : 'bg-paw-healthy/10 text-paw-healthy'
          }`}
        >
          {abnormal ? '需关注' : '正常'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MetricBox icon="🍚" label="进食" value={`${log.food_amount ?? '--'}g`} />
        <MetricBox icon="💧" label="饮水" value={`${log.water_amount ?? '--'}ml`} />
        <MetricBox icon="💩" label="排便" value={`${log.poop_count ?? '--'}次`} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {log.poop_status && (
          <span className="rounded-full bg-paw-background px-3 py-1 text-paw-muted">
            排便：{log.poop_status}
          </span>
        )}
        {log.activity_level && (
          <span className="rounded-full bg-paw-background px-3 py-1 text-paw-muted">
            活跃度：{log.activity_level}
          </span>
        )}
        {log.weight_kg && (
          <span className="rounded-full bg-paw-background px-3 py-1 text-paw-muted">
            体重：{log.weight_kg}kg
          </span>
        )}
      </div>

      {log.symptoms?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {log.symptoms.map((symptom) => (
            <span
              className="rounded-full bg-paw-danger/10 px-3 py-1 text-xs font-semibold text-paw-danger"
              key={symptom}
            >
              {symptom}
            </span>
          ))}
        </div>
      )}

      {log.notes && (
        <p className="mt-3 rounded-control bg-paw-background p-3 text-xs leading-5 text-paw-secondary">
          {log.notes}
        </p>
      )}

      {log.ai_feedback && (
        <p className="mt-3 rounded-control border border-paw-border bg-paw-background p-3 text-xs leading-5 text-paw-muted">
          AI：{log.ai_feedback}
        </p>
      )}
    </article>
  );
}

export default HistoryLogCard;
