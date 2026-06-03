export function isAbnormalLog(log) {
  return (
    log.symptoms?.length > 0 ||
    log.mood === '🤒' ||
    log.mood === '😞' ||
    Number(log.food_amount || 0) < 100 ||
    Number(log.water_amount || 0) < 180 ||
    Number(log.poop_count || 0) < 1 ||
    (log.poop_status && log.poop_status !== '正常')
  );
}
