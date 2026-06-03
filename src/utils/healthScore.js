export function calcHealthScore(logs) {
  if (!logs.length) return 80;

  let score = 90;
  const last3 = logs.slice(0, 3);

  last3.forEach((log) => {
    if (parseInt(log.food_amount, 10) < 100) score -= 8;
    if (parseInt(log.water_amount, 10) < 180) score -= 5;
    if (parseInt(log.poop_count, 10) < 1) score -= 6;
    if (log.mood === '🤒') score -= 12;
    if (log.mood === '😞') score -= 6;
    if (log.symptoms?.length > 0) score -= log.symptoms.length * 3;
  });

  return Math.max(30, Math.min(99, score));
}

export function getHealthScoreColor(score) {
  if (score >= 80) return '#4A7C59';
  if (score >= 60) return '#E8A020';
  return '#D95F5F';
}
