const tagStyles = {
  danger: 'bg-[#FDEAEA] text-[#D95F5F]',
  muted: 'bg-paw-background text-paw-muted',
  normal: 'bg-[#EEF6F1] text-[#4A7C59]',
  warn: 'bg-[#FDF0D8] text-[#E8A020]',
};

function getFoodStatus(value) {
  if (value === null || value === undefined) return { label: '未记录', tone: 'muted' };
  if (Number(value) >= 130) return { label: '正常', tone: 'normal' };
  if (Number(value) >= 90) return { label: '偏少', tone: 'warn' };
  return { label: '异常', tone: 'danger' };
}

function getWaterStatus(value) {
  if (value === null || value === undefined) return { label: '未记录', tone: 'muted' };
  if (Number(value) >= 200) return { label: '正常', tone: 'normal' };
  if (Number(value) >= 150) return { label: '偏少', tone: 'warn' };
  return { label: '异常', tone: 'danger' };
}

function getPoopStatus(value) {
  if (value === null || value === undefined) return { label: '未记录', tone: 'muted' };
  if (Number(value) >= 1) return { label: '正常', tone: 'normal' };
  return { label: '异常', tone: 'danger' };
}

function getSummary(log, petName) {
  if (!log) return { color: 'text-paw-muted', text: `还没有记录今天哦，${petName}在等你 🐾` };

  const food = getFoodStatus(log.food_amount);
  const water = getWaterStatus(log.water_amount);
  const poop = getPoopStatus(log.poop_count);
  const hasSymptoms = (log.symptoms || []).length > 0;
  const statuses = [food, water, poop];

  if (hasSymptoms || statuses.some((status) => status.tone === 'danger')) {
    return { color: 'text-[#D95F5F]', text: '今天需要注意 🔴' };
  }
  if (statuses.some((status) => status.tone === 'warn' || status.tone === 'muted')) {
    return { color: 'text-[#E8A020]', text: '今天需要多关注 🟡' };
  }
  return { color: 'text-[#4A7C59]', text: '今天状态很棒 🟢' };
}

function MetricItem({ label, status, unit, value }) {
  const displayValue = value === null || value === undefined ? '--' : value;

  return (
    <div className="rounded-control border border-paw-border bg-paw-background px-3 py-3">
      <p className="text-[10px] font-semibold text-paw-muted">{label}</p>
      <p className="mt-1 font-title text-lg font-semibold text-paw-primary">
        {displayValue}
        <span className="ml-0.5 font-body text-[11px] font-medium text-paw-muted">{unit}</span>
      </p>
      <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${tagStyles[status.tone]}`}>
        {status.label}
      </span>
    </div>
  );
}

function HomeTodayStatusCard({ loading, log, pet }) {
  const petName = pet?.name || '宠物';
  const summary = getSummary(log, petName);
  const foodStatus = getFoodStatus(log?.food_amount);
  const waterStatus = getWaterStatus(log?.water_amount);
  const poopStatus = getPoopStatus(log?.poop_count);

  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-paw-muted">今日状态</p>
          <h2 className="mt-1 font-title text-xl font-semibold text-paw-primary">一眼看懂{petName}</h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-card bg-paw-background text-2xl">
          {pet?.avatar || '🐾'}
        </div>
      </div>

      <p className={`mt-3 text-sm font-semibold ${summary.color}`}>
        {loading ? '正在读取今日健康记录...' : summary.text}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <MetricItem label="进食量" status={foodStatus} unit="g" value={log?.food_amount} />
        <MetricItem label="饮水量" status={waterStatus} unit="ml" value={log?.water_amount} />
        <MetricItem label="排便" status={poopStatus} unit="次" value={log?.poop_count} />
      </div>
    </section>
  );
}

export default HomeTodayStatusCard;
