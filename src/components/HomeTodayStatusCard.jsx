import { analyzeTodayHealth } from '../utils/healthInsights.js';

const tagStyles = {
  danger: 'bg-[#FDEAEA] text-[#D95F5F]',
  muted: 'bg-paw-background text-paw-muted',
  normal: 'bg-[#EEF6F1] text-[#4A7C59]',
  warn: 'bg-[#FDF0D8] text-[#E8A020]',
};

const statusStyles = {
  danger: { border: 'border-[#D95F5F]/40', text: 'text-[#D95F5F]' },
  normal: { border: 'border-[#4A7C59]/30', text: 'text-[#4A7C59]' },
  warning: { border: 'border-[#E8A020]/40', text: 'text-[#E8A020]' },
};

function MetricItem({ item }) {
  const displayValue = item.value === null || item.value === undefined ? '--' : item.value;

  return (
    <div className="rounded-control border border-paw-border bg-paw-background px-3 py-3">
      <p className="text-[10px] font-semibold text-paw-muted">{item.label}</p>
      <p className="mt-1 font-title text-lg font-semibold text-paw-primary">
        {displayValue}
        {item.unit && <span className="ml-0.5 font-body text-[11px] font-medium text-paw-muted">{item.unit}</span>}
      </p>
      <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${tagStyles[item.tone]}`}>
        {item.note}
      </span>
    </div>
  );
}

function HomeTodayStatusCard({ loading, log, pet, recentLogs = [], todos = [] }) {
  const petName = pet?.name || '宠物';
  const insight = analyzeTodayHealth({ pet, recentRecords: recentLogs, todayRecord: log, todos });
  const statusStyle = statusStyles[insight.status] || statusStyles.warning;

  return (
    <section className={`rounded-card border bg-paw-card p-4 ${statusStyle.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-paw-muted">今日照护中心</p>
          <h2 className="mt-1 font-title text-xl font-semibold text-paw-primary">{petName}今日状态</h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-card bg-paw-background text-2xl">
          {pet?.avatar_url ? <img className="h-full w-full object-cover" src={pet.avatar_url} alt={petName} /> : pet?.avatar || '🐾'}
        </div>
      </div>

      <p className={`mt-3 text-base font-semibold ${statusStyle.text}`}>
        {loading ? '正在读取今日健康记录...' : insight.title}
      </p>
      {!loading && <p className="mt-2 text-xs leading-5 text-paw-muted">{insight.reason}</p>}

      <div className="mt-3 grid grid-cols-4 gap-2">
        {insight.summaryItems.map((item) => (
          <MetricItem item={item} key={item.label} />
        ))}
      </div>

      {insight.disclaimer && (
        <p className="mt-3 rounded-control bg-[#FDEAEA] px-3 py-2 text-[11px] leading-5 text-[#D95F5F]">
          {insight.disclaimer}
        </p>
      )}
    </section>
  );
}

export default HomeTodayStatusCard;
