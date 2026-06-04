import { Link } from 'react-router-dom';
import { getDailyCareLabel } from '../data/dailyCareOptions.js';
import { getCareFace, getCareStatusLevel } from '../utils/careCalendar.js';

const statusStyles = {
  mild: 'bg-paw-warning/10 text-paw-secondary border-paw-warning/40',
  none: 'bg-paw-background text-paw-muted border-paw-border',
  normal: 'bg-paw-healthy/10 text-paw-healthy border-paw-healthy/30',
  severe: 'bg-paw-danger/10 text-paw-danger border-paw-danger/40',
};

function getFieldStyle(key, value) {
  if (!value) return statusStyles.none;
  if (key === 'stool' && ['soft', 'diarrhea', 'constipation', 'bloody'].includes(value)) return statusStyles.severe;
  if (key === 'appetite' && ['low', 'none'].includes(value)) return statusStyles.mild;
  if (key === 'water' && value === 'low') return statusStyles.mild;
  return statusStyles.normal;
}

function getFoodText(record) {
  if (!record) return '未记录';
  if (record.food_amount_mode === 'grams' && record.food_amount_grams) return `${record.food_amount_grams}g`;
  const base = getDailyCareLabel('appetite', record.food_amount_level || record.appetite);
  if (record.food_serving_count) return `${base} · ${record.food_serving_count}碗`;
  return base;
}

function StatusPill({ label, styleName, value }) {
  return (
    <div className={`rounded-control border px-3 py-2 ${styleName}`}>
      <p className="text-[10px] font-semibold opacity-70">{label}</p>
      <p className="mt-0.5 truncate text-xs font-semibold">{value}</p>
    </div>
  );
}

function HomeTodayStatusCard({ loading, pet, record }) {
  const level = getCareStatusLevel(record);
  const title = record ? '今日状态' : '今天还没记录';
  const summary = record ? `${pet.name}今天${level === 'normal' ? '整体稳定' : '有需要关注的变化'}` : '先补一条吃饭、喝水和便便状态';

  return (
    <Link className="block rounded-card border border-paw-border bg-paw-card p-4" to="/records">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-paw-muted">一眼看懂</p>
          <h2 className="mt-1 font-title text-xl font-semibold text-paw-primary">{title}</h2>
          <p className="mt-1 text-xs text-paw-muted">{loading ? '正在读取今日状态...' : summary}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-card bg-paw-background text-2xl">
          {loading ? '...' : getCareFace(record, pet)}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <StatusPill label="吃饭" styleName={getFieldStyle('appetite', record?.appetite)} value={getFoodText(record)} />
        <StatusPill label="喝水" styleName={getFieldStyle('water', record?.water)} value={record ? getDailyCareLabel('water', record.water) : '未记录'} />
        <StatusPill label="便便" styleName={getFieldStyle('stool', record?.stool)} value={record ? getDailyCareLabel('stool', record.stool) : '未记录'} />
      </div>
    </Link>
  );
}

export default HomeTodayStatusCard;
