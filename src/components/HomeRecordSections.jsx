import { Link } from 'react-router-dom';
import { formatLogDate } from '../utils/dateFormat.js';
import { isAbnormalLog } from '../utils/logStatus.js';

function getAverage(logs, key, precision = 0) {
  const values = logs
    .map((log) => Number(log[key]))
    .filter((value) => Number.isFinite(value) && value > 0);
  if (!values.length) return '--';
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return precision ? average.toFixed(precision) : Math.round(average);
}

function MetricBars({ color, keyName, logs, maxValue, unit }) {
  const values = logs.map((log) => Number(log[keyName] || 0));
  const dynamicMax = Math.max(maxValue, ...values);

  return (
    <div className="flex h-16 items-end gap-1">
      {logs.map((log) => {
        const value = Number(log[keyName] || 0);
        const height = value ? Math.max(10, Math.min(56, (value / dynamicMax) * 56)) : 6;

        return (
          <div className="flex flex-1 flex-col items-center gap-1" key={`${keyName}-${log.id}`}>
            <div className="w-full rounded-t-control opacity-85" style={{ background: color, height }} />
            <span className="text-[9px] text-paw-muted">{value ? `${value}${unit}` : '--'}</span>
          </div>
        );
      })}
    </div>
  );
}

export function HealthTrendDashboard({ logs }) {
  const trendLogs = logs.slice(0, 7).reverse();
  const abnormalDays = trendLogs.filter(isAbnormalLog).length;
  const foodAverage = getAverage(trendLogs, 'food_amount');
  const waterAverage = getAverage(trendLogs, 'water_amount');
  const weightAverage = getAverage(trendLogs, 'weight_kg', 2);
  const stats = [
    ['🍚', '进食均值', foodAverage === '--' ? '--' : `${foodAverage}g`],
    ['💧', '饮水均值', waterAverage === '--' ? '--' : `${waterAverage}ml`],
    ['⚖️', '体重均值', weightAverage === '--' ? '--' : `${weightAverage}kg`],
    ['⚠️', '异常天数', `${abnormalDays}天`],
  ];
  const metrics = [
    { color: '#4A7C59', keyName: 'food_amount', label: '进食', maxValue: 220, unit: 'g' },
    { color: '#4A8FA8', keyName: 'water_amount', label: '饮水', maxValue: 300, unit: 'ml' },
    { color: '#E8A020', keyName: 'weight_kg', label: '体重', maxValue: 8, unit: 'kg' },
  ];

  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-5">
      <h2 className="font-title text-xl font-semibold">近7日健康趋势</h2>
      {trendLogs.length ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {stats.map(([icon, label, value]) => (
              <div className="rounded-control bg-paw-background px-3 py-2" key={label}>
                <p className="text-xs text-paw-muted">
                  {icon} {label}
                </p>
                <p className="mt-1 text-sm font-bold text-paw-primary">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-4">
            {metrics.map((metric) => (
              <div key={metric.keyName}>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-paw-secondary">{metric.label}</span>
                  <span className="text-paw-muted">近7日</span>
                </div>
                <MetricBars {...metric} logs={trendLogs} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-[10px] text-paw-muted">
            {trendLogs.map((log) => (
              <span key={`date-${log.id}`}>{formatLogDate(log.log_date).slice(0, 2)}</span>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-paw-muted">暂无趋势数据。</p>
      )}
      <div className="mt-4 flex gap-4 text-xs text-paw-muted">
        <span>绿色 进食</span>
        <span>蓝色 饮水</span>
        <span>琥珀 体重</span>
      </div>
    </section>
  );
}

export function RecentLogList({ logs }) {
  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-title text-xl font-semibold">最近记录</h2>
        <Link className="text-xs font-semibold text-paw-healthy" to="/history">
          查看全部
        </Link>
      </div>
      <div className="space-y-3">
        {logs.slice(0, 4).map((log) => (
          <div
            className="flex items-center gap-3 border-b border-paw-border pb-3 last:border-0 last:pb-0"
            key={log.id}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-control bg-paw-background text-xl">
              {log.mood || '😐'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{formatLogDate(log.log_date)}</p>
              <p className="mt-1 truncate text-xs text-paw-muted">
                进食{log.food_amount ?? '--'}g · 饮水{log.water_amount ?? '--'}ml · {log.notes || '无备注'}
              </p>
            </div>
          </div>
        ))}
        {!logs.length && <p className="text-sm text-paw-muted">暂无历史记录。</p>}
      </div>
    </section>
  );
}
