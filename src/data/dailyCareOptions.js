export const dailyCareLabels = {
  activity: {
    high: '特别活跃',
    low: '活动偏少',
    normal: '活动正常',
  },
  appetite: {
    high: '胃口很好',
    low: '食欲偏少',
    none: '没有吃饭',
    normal: '胃口正常',
  },
  interaction: {
    groomed: '梳毛护理',
    none: '暂无互动',
    photo: '拍了照片',
    played: '玩耍互动',
    walked: '出门散步',
  },
  mood: {
    happy: '心情很好',
    normal: '精神正常',
    tired: '精神偏弱',
    uncomfortable: '不太舒服',
  },
  stool: {
    bloody: '便便带血',
    constipation: '有点便秘',
    diarrhea: '有点腹泻',
    normal: '便便正常',
    soft: '便便偏软',
  },
  water: {
    high: '喝水较多',
    low: '喝水偏少',
    normal: '喝水正常',
  },
};

export const dailyCareQuickActions = [
  {
    feedback: '饭饭的小报告已记录，今天也是被好好照顾的一天 🐾',
    icon: '🌿',
    label: '今天正常',
    patch: {
      activity: 'normal',
      appetite: 'normal',
      mood: 'happy',
      stool: 'normal',
      water: 'normal',
    },
    value: 'normal',
  },
  {
    feedback: '食欲偏少已记录，今晚可以多观察一下饭碗变化 🍚',
    icon: '🍚',
    label: '食欲偏少',
    patch: { appetite: 'low' },
    value: 'low_appetite',
  },
  {
    feedback: '喝水偏少已记录，记得把水碗放在更顺路的位置 💧',
    icon: '💧',
    label: '喝水偏少',
    patch: { water: 'low' },
    value: 'low_water',
  },
  {
    feedback: '便便小雷达已记录，接下来留意次数和状态就好 💩',
    icon: '💩',
    label: '便便异常',
    patch: { stool: 'soft' },
    value: 'stool_abnormal',
  },
  {
    feedback: '精神状态已记录，今天给它多一点安静和陪伴 😿',
    icon: '😿',
    label: '精神不好',
    patch: { activity: 'low', mood: 'tired' },
    value: 'low_mood',
  },
  {
    feedback: '今日互动已记录，小小陪伴也会让它很开心 ✨',
    icon: '✨',
    label: '今日互动',
    patch: { interaction: 'played', mood: 'happy' },
    value: 'interaction',
  },
];

export const dailyCareSummaryFields = [
  { icon: '🍚', key: 'appetite', label: '吃饭' },
  { icon: '💧', key: 'water', label: '喝水' },
  { icon: '💩', key: 'stool', label: '便便' },
  { icon: '😊', key: 'mood', label: '精神' },
  { icon: '⚡', key: 'activity', label: '活动' },
  { icon: '🎾', key: 'interaction', label: '互动' },
];

export function getDailyCareLabel(key, value) {
  return dailyCareLabels[key]?.[value] || '未记录';
}
