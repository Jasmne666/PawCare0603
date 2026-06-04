export const healthLogEntrySections = [
  { icon: '🍚', id: 'food', label: '吃饭' },
  { icon: '💧', id: 'water', label: '喝水' },
  { icon: '💩', id: 'poop', label: '便便' },
  { icon: '😊', id: 'mood', label: '心情' },
  { icon: '⚡', id: 'activity', label: '活动量' },
  { icon: '🎾', id: 'interaction', label: '互动' },
  { icon: '🩺', id: 'symptoms', label: '特殊症状' },
];

export const healthLogMoodChoices = [
  ['😊', '开心'],
  ['😐', '一般'],
  ['😞', '低落'],
  ['🤒', '生病'],
  ['😨', '焦虑'],
];

export const healthLogPoopChoices = ['正常', '偏软', '腹泻', '便秘', '异常'];

export const healthLogSymptomChoices = [
  '食欲不振',
  '饮水减少',
  '精神萎靡',
  '频繁如厕',
  '咳嗽/打喷嚏',
  '呕吐',
  '腹泻',
  '过度舔毛',
  '攻击性增强',
  '嗜睡',
  '便秘',
];

export function getHealthLogSectionSummary(sectionId, log) {
  if (!log) return '点击记录今天的数据';
  if (sectionId === 'food') return log.food_amount === null || log.food_amount === undefined ? '点击记录今天的数据' : `${log.food_amount}g`;
  if (sectionId === 'water') return log.water_amount === null || log.water_amount === undefined ? '点击记录今天的数据' : `${log.water_amount}ml`;
  if (sectionId === 'poop') return log.poop_count === null || log.poop_count === undefined ? '点击记录今天的数据' : `${log.poop_count}次 · ${log.poop_status || '未记录状态'}`;
  if (sectionId === 'mood') return log.mood || '点击记录今天的数据';
  if (sectionId === 'activity') return log.activity_minutes === null || log.activity_minutes === undefined ? '点击记录今天的数据' : `${log.activity_minutes}分钟`;
  if (sectionId === 'interaction') return log.interaction_minutes === null || log.interaction_minutes === undefined ? '点击记录今天的数据' : `${log.interaction_minutes}分钟`;
  if (sectionId === 'symptoms') return log.symptoms?.length ? log.symptoms.slice(0, 3).join('、') : '点击记录今天的数据';
  return '点击记录今天的数据';
}

export function hasHealthLogSectionValue(sectionId, log) {
  if (!log) return false;
  if (sectionId === 'symptoms') return (log.symptoms || []).length > 0;
  return getHealthLogSectionSummary(sectionId, log) !== '点击记录今天的数据';
}
