export const petTodoTemplates = [
  { category: 'health', icon: '💉', repeatDays: 365, title: '疫苗', type: 'vaccine' },
  { category: 'health', icon: '🪱', repeatDays: 90, title: '体内驱虫', type: 'internal_deworming' },
  { category: 'health', icon: '🛡️', repeatDays: 30, title: '体外驱虫', type: 'external_deworming' },
  { category: 'health', icon: '🏥', repeatDays: 365, title: '体检', type: 'checkup' },
  { category: 'care', icon: '🛁', repeatDays: 30, title: '洗澡', type: 'bath' },
  { category: 'care', icon: '✂️', repeatDays: 14, title: '剪指甲', type: 'nail' },
  { category: 'care', icon: '🎀', repeatDays: 45, title: '美容', type: 'grooming' },
  { category: 'care', icon: '🪮', repeatDays: 3, title: '梳毛', type: 'brushing' },
  { category: 'care', icon: '👂', repeatDays: 14, title: '清洁耳朵', type: 'ear_cleaning' },
  { category: 'care', icon: '🦷', repeatDays: 1, title: '刷牙', type: 'teeth' },
  { category: 'care', icon: '⚖️', repeatDays: 7, title: '称体重', type: 'weight' },
  { category: 'medicine', icon: '💊', repeatDays: null, title: '用药', type: 'medicine' },
  { category: 'medicine', icon: '📋', repeatDays: null, title: '复查', type: 'revisit' },
  { category: 'custom', icon: '🐾', repeatDays: null, title: '自定义', type: 'custom' },
];

export const petTodoCategoryLabels = {
  care: '日常护理',
  custom: '自定义',
  health: '健康预防',
  medicine: '医疗用药',
};

export function getPetTodoTemplate(type) {
  return petTodoTemplates.find((template) => template.type === type) || petTodoTemplates.at(-1);
}

export function getPetTodoIcon(type) {
  return getPetTodoTemplate(type)?.icon || '🐾';
}

export function getPetTodoCategoryLabel(category) {
  return petTodoCategoryLabels[category] || '照护事项';
}
