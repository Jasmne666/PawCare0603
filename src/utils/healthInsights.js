const dangerWords = ['拉血', '尿不出', '频繁呕吐', '呼吸困难', '抽搐', '误食', '持续不吃不喝', '极度萎靡'];
const disclaimer = 'PawCare 不能替代兽医诊断。AI 建议仅供日常照护参考，如症状持续或加重，请及时就医。';

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getAverage(records, key) {
  const values = records.map((record) => toNumber(record[key])).filter((value) => value !== null && value > 0);
  if (values.length < 3) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function includesDangerSignal(record) {
  const content = [...(record?.symptoms || []), record?.notes || ''].join(' ');
  return dangerWords.some((word) => content.includes(word));
}

function getTargetValue(pet, keys) {
  for (const key of keys) {
    const value = toNumber(pet?.[key]);
    if (value && value > 0) return value;
  }
  return null;
}

function evaluateAmount({ baseline, label, target, unit, value }) {
  const number = toNumber(value);
  if (number === null) return { label, note: '未记录', tone: 'muted', unit, value: '--' };

  const reference = target || baseline;
  if (!reference) return { label, note: '已记录', tone: 'normal', unit, value: number };

  const ratio = number / reference;
  if (ratio < 0.6) return { label, note: '明显偏少', tone: 'danger', unit, value: number };
  if (ratio < 0.7) return { label, note: target ? '低于目标' : '比平时少', tone: 'warn', unit, value: number };
  return { label, note: target ? '接近目标' : '接近平时', tone: 'normal', unit, value: number };
}

function evaluatePoop(record) {
  const count = toNumber(record?.poop_count);
  const status = record?.poop_status;
  const abnormalStatus = ['soft', 'diarrhea', 'constipation', 'bloody'].includes(status);

  if (count === null && !status) return { label: '排便', note: '未记录', tone: 'muted', unit: '次', value: '--' };
  if (abnormalStatus || count === 0) return { label: '排便', note: '需要观察', tone: 'warn', unit: '次', value: count ?? '--' };
  return { label: '排便', note: '已记录', tone: 'normal', unit: '次', value: count ?? '--' };
}

function evaluateMood(record) {
  const mood = record?.mood;
  if (!mood) return { label: '精神', note: '未记录', tone: 'muted', unit: '', value: '--' };
  if (['😞', '🤒'].includes(mood)) return { label: '精神', note: '需要观察', tone: 'warn', unit: '', value: mood };
  return { label: '精神', note: '已记录', tone: 'normal', unit: '', value: mood };
}

function getHealthTitle(status) {
  if (status === 'danger') return '今天需要注意';
  if (status === 'warning') return '今天需要多关注';
  return '今天状态不错';
}

export function analyzeTodayHealth({ pet, recentRecords = [], todayRecord }) {
  const petName = pet?.name || '宠物';
  if (!todayRecord) {
    return {
      disclaimer: '',
      reason: `花 30 秒告诉 PawCare ${petName}今天吃得怎么样、喝水多不多、便便正不正常。`,
      status: 'warning',
      suggestions: ['先完成今日快捷记录，连续记录 3 天后会开始形成个人基线。'],
      summaryItems: [
        { label: '吃饭', note: '未记录', tone: 'muted', unit: 'g', value: '--' },
        { label: '喝水', note: '未记录', tone: 'muted', unit: 'ml', value: '--' },
        { label: '便便', note: '未记录', tone: 'muted', unit: '次', value: '--' },
        { label: '精神', note: '未记录', tone: 'muted', unit: '', value: '--' },
      ],
      title: '还没有记录今天哦',
    };
  }

  const baselineRecords = recentRecords.filter((record) => record.id !== todayRecord.id);
  const food = evaluateAmount({
    baseline: getAverage(baselineRecords, 'food_amount'),
    label: '吃饭',
    target: getTargetValue(pet, ['food_target_grams', 'daily_food_target']),
    unit: 'g',
    value: todayRecord.food_amount,
  });
  const water = evaluateAmount({
    baseline: getAverage(baselineRecords, 'water_amount'),
    label: '喝水',
    target: getTargetValue(pet, ['water_target_ml', 'daily_water_target']),
    unit: 'ml',
    value: todayRecord.water_amount,
  });
  const poop = evaluatePoop(todayRecord);
  const mood = evaluateMood(todayRecord);
  const summaryItems = [food, water, poop, mood];
  const tones = summaryItems.map((item) => item.tone);
  const hasDanger = includesDangerSignal(todayRecord);
  const hasCombinedRisk = food.tone === 'danger' && mood.tone === 'warn' && poop.tone === 'warn';

  const status = hasDanger || hasCombinedRisk || tones.includes('danger')
    ? 'danger'
    : tones.includes('warn') || tones.includes('muted')
      ? 'warning'
      : 'normal';

  const reasonMap = {
    danger: `${petName}今天有明显异常信号，建议尽快观察并咨询兽医。`,
    normal: `${petName}今天的核心记录没有明显异常，继续保持。`,
    warning: `${petName}有记录缺失或偏离平时状态，建议今天再观察一次。`,
  };

  return {
    disclaimer: status === 'danger' ? disclaimer : '',
    reason: reasonMap[status],
    status,
    suggestions: status === 'danger' ? ['如果持续不吃、精神差、呕吐、腹泻或排尿异常，请及时联系兽医。'] : [],
    summaryItems,
    title: getHealthTitle(status),
  };
}
