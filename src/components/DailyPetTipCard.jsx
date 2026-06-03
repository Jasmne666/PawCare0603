import { getDailyPetTip } from '../data/dailyPetTips.js';

function DailyPetTipCard() {
  const tip = getDailyPetTip();

  return (
    <section className="flex items-center gap-3 rounded-card border border-paw-border bg-paw-card p-3 shadow-sm">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-card bg-paw-background text-4xl">
        {tip.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold text-paw-healthy">今日科普</p>
          <span className="shrink-0 rounded-full bg-paw-healthy/10 px-2 py-1 text-[10px] font-semibold text-paw-healthy">
            每日轮换
          </span>
        </div>
        <h2 className="mt-1 truncate text-sm font-bold text-paw-primary">{tip.title}</h2>
        <p className="mt-1 text-xs leading-5 text-paw-muted">{tip.text}</p>
      </div>
    </section>
  );
}

export default DailyPetTipCard;
