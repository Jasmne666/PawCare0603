import { getHealthScoreColor } from '../utils/healthScore.js';

function StatCell({ color = '#2C1810', suffix, title, value }) {
  return (
    <div className="rounded-control bg-paw-background px-2 py-3 text-center">
      <p className="font-title text-[22px] font-semibold leading-none" style={{ color }}>
        {value}
        <span className="ml-0.5 text-xs font-body font-semibold">{suffix}</span>
      </p>
      <p className="mt-2 text-[11px] text-paw-muted">{title}</p>
    </div>
  );
}

function ProfileDataCard({ healthScore, loading, monthRecordDays, petName, streakDays }) {
  const scoreColor = getHealthScoreColor(healthScore);

  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-paw-muted">我的数据</p>
          <h2 className="mt-1 font-title text-xl font-semibold">{petName || '宠物'}的照护进度</h2>
        </div>
        {loading && <span className="text-xs text-paw-muted">读取中...</span>}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatCell suffix="天" title="本月记录" value={monthRecordDays} />
        <StatCell suffix="天" title="连续打卡 🔥" value={streakDays} />
        <StatCell color={scoreColor} suffix="分" title="健康评分" value={healthScore} />
      </div>
    </section>
  );
}

export default ProfileDataCard;
