import { Link } from 'react-router-dom';
import { getLocalDateString, parseLocalDate } from '../utils/todoDates.js';

function getRecordStreak(records) {
  const days = new Set(records.map((record) => record.record_date));
  let streak = 0;
  let cursor = parseLocalDate(getLocalDateString());

  while (cursor && days.has(getLocalDateString(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function ProfileAchievementCard({ pet, records }) {
  const monthCount = new Set(records.map((record) => record.record_date)).size;
  const streak = getRecordStreak(records);
  const badges = [
    { label: '健康手账', unlocked: monthCount >= 1 },
    { label: '连续照护', unlocked: streak >= 3 },
    { label: '贴纸收藏', unlocked: false },
  ];

  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-paw-muted">手账成就</p>
          <h2 className="mt-1 font-title text-xl font-semibold">{pet?.name || '宠物'}的小进度</h2>
        </div>
        <Link className="rounded-control bg-paw-background px-3 py-2 text-xs font-semibold text-paw-secondary" to="/records">
          查看报告
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-control bg-paw-background px-3 py-3">
          <p className="text-lg font-semibold text-paw-primary">🔥 {streak}天</p>
          <p className="mt-1 text-xs text-paw-muted">连续记录</p>
        </div>
        <div className="rounded-control bg-paw-background px-3 py-3">
          <p className="text-lg font-semibold text-paw-primary">{monthCount}天</p>
          <p className="mt-1 text-xs text-paw-muted">本月记录</p>
        </div>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {badges.map((badge) => (
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              badge.unlocked ? 'bg-paw-healthy/10 text-paw-healthy' : 'bg-paw-background text-paw-muted'
            }`}
            key={badge.label}
          >
            {badge.unlocked ? '✓ ' : '○ '}
            {badge.label}
          </span>
        ))}
      </div>
    </section>
  );
}

export default ProfileAchievementCard;
