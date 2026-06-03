import { Link } from 'react-router-dom';
import DailyPetTipCard from './DailyPetTipCard.jsx';
import { getHealthScoreColor } from '../utils/healthScore.js';
import { calcPetAge } from '../utils/petAge.js';

function AvatarView({ pet, sizeClass = 'h-16 w-16 text-4xl' }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-card border border-paw-border bg-paw-background ${sizeClass}`}
    >
      {pet.avatar_url ? (
        <img className="h-full w-full object-cover" src={pet.avatar_url} alt={pet.name} />
      ) : (
        pet.avatar || '🐾'
      )}
    </div>
  );
}

function ScoreRing({ score }) {
  const color = getHealthScoreColor(score);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);

  return (
    <svg className="shrink-0" height="88" viewBox="0 0 88 88" width="88">
      <circle cx="44" cy="44" fill="none" r={radius} stroke="#EDE4CE" strokeWidth="7" />
      <circle
        cx="44"
        cy="44"
        fill="none"
        r={radius}
        stroke={color}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        strokeWidth="7"
        transform="rotate(-90 44 44)"
      />
      <text
        fill={color}
        fontFamily="Playfair Display, serif"
        fontSize="20"
        fontWeight="700"
        textAnchor="middle"
        x="44"
        y="51"
      >
        {score}
      </text>
    </svg>
  );
}

export function HomeHeader({ pet }) {
  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-paw-muted">
            今天是{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
          </p>
          <h1 className="mt-2 font-title text-3xl font-semibold leading-tight">你好，{pet.name}的主人</h1>
        </div>
        <Link to="/profile">
          <AvatarView pet={pet} sizeClass="h-11 w-11 text-2xl" />
        </Link>
      </div>
      <DailyPetTipCard />
    </section>
  );
}

export function PetScoreCard({ pet, score }) {
  return (
    <section className="rounded-card bg-paw-primary p-5 text-paw-background">
      <div className="flex items-center gap-4">
        <AvatarView pet={pet} />
        <div className="min-w-0 flex-1">
          <h2 className="font-title text-2xl font-semibold">{pet.name}</h2>
          <p className="mt-1 text-xs text-paw-background/70">
            {pet.species} · {pet.breed || '未填写品种'} · {calcPetAge(pet.birth_date)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
            {pet.vaccinated && <span className="rounded-full bg-paw-healthy/40 px-3 py-1">已接种</span>}
            <span className="rounded-full bg-white/10 px-3 py-1">
              {pet.neutered ? '已绝育' : '未绝育'}
            </span>
          </div>
        </div>
        <div className="text-center">
          <ScoreRing score={score} />
          <p className="-mt-2 text-[11px] text-paw-background/60">健康分</p>
        </div>
      </div>
    </section>
  );
}

export function AlertList({ alerts, onAlertClick }) {
  if (!alerts.length) return null;

  return (
    <section className="space-y-2">
      {alerts.map((alert) => {
        const isDanger = alert.type === 'danger';
        return (
          <button
            className={`w-full rounded-card border p-4 text-left ${
              isDanger
                ? 'border-paw-danger bg-paw-danger/10 text-paw-danger'
                : 'border-paw-warning bg-paw-warning/10 text-paw-secondary'
            }`}
            key={alert.title}
            onClick={() => onAlertClick(alert)}
            type="button"
          >
            <div className="flex gap-3">
              <span className="text-xl">{alert.icon}</span>
              <div>
                <p className="text-sm font-semibold">{alert.title}</p>
                <p className="mt-1 text-xs leading-5 opacity-80">{alert.desc}</p>
              </div>
            </div>
          </button>
        );
      })}
    </section>
  );
}

export function TodayOverview({ todayLog }) {
  if (!todayLog) {
    return (
      <section className="rounded-card border border-paw-border bg-paw-card p-5">
        <h2 className="font-title text-xl font-semibold">今日概况</h2>
        <p className="mt-2 text-sm text-paw-muted">今天还没有记录。先补一条数据，首页会自动更新。</p>
        <Link className="mt-4 inline-flex rounded-control bg-paw-primary px-4 py-3 text-sm font-semibold text-paw-background" to="/log">
          去记录
        </Link>
      </section>
    );
  }

  const stats = [
    ['进食', `${todayLog.food_amount ?? '--'}g`, '🍚'],
    ['饮水', `${todayLog.water_amount ?? '--'}ml`, '💧'],
    ['排便', `${todayLog.poop_count ?? '--'}次`, '💩'],
  ];

  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-title text-xl font-semibold">今日概况</h2>
        <span className="rounded-full bg-paw-healthy/10 px-3 py-1 text-xs font-semibold text-paw-healthy">
          {todayLog.mood || '😐'} {todayLog.activity_level || '正常'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {stats.map(([label, value, icon]) => (
          <div className="rounded-control border border-paw-border bg-paw-background p-3 text-center" key={label}>
            <p className="text-xl">{icon}</p>
            <p className="mt-1 text-[11px] text-paw-muted">{label}</p>
            <p className="mt-1 text-sm font-bold">{value}</p>
          </div>
        ))}
      </div>
      {todayLog.ai_feedback && (
        <p className="mt-4 rounded-control bg-paw-background p-3 text-xs leading-5 text-paw-secondary">
          {todayLog.ai_feedback}
        </p>
      )}
    </section>
  );
}
