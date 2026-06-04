export const petTodoTemplates = [
  { category: 'health', icon: '💉', repeatDays: 365, species: ['all'], title: '疫苗', type: 'vaccine' },
  { category: 'health', icon: '🪱', repeatDays: 90, species: ['猫', '狗'], title: '体内驱虫', type: 'internal_deworming' },
  { category: 'health', icon: '🛡️', repeatDays: 30, species: ['猫', '狗'], title: '体外驱虫', type: 'external_deworming' },
  { category: 'health', icon: '🏥', repeatDays: 365, species: ['all'], title: '体检', type: 'checkup' },
  { category: 'care', icon: '🛁', repeatDays: 30, species: ['狗', '鸟'], title: '洗澡', type: 'bath' },
  { category: 'care', icon: '✂️', repeatDays: 14, species: ['猫', '狗', '兔子', '鸟'], title: '剪指甲', type: 'nail' },
  { category: 'care', icon: '🎀', repeatDays: 45, species: ['猫', '狗'], title: '美容', type: 'grooming' },
  { category: 'care', icon: '🪮', repeatDays: 3, species: ['猫', '狗', '兔子'], title: '梳毛', type: 'brushing' },
  { category: 'care', icon: '👂', repeatDays: 14, species: ['猫', '狗', '兔子'], title: '清洁耳朵', type: 'ear_cleaning' },
  { category: 'care', icon: '🦷', repeatDays: 1, species: ['猫', '狗'], title: '刷牙', type: 'teeth' },
  { category: 'care', icon: '⚖️', repeatDays: 7, species: ['all'], title: '称体重', type: 'weight' },
  { category: 'care', icon: '🧹', repeatDays: 7, species: ['仓鼠', '鸟', '蛇', '乌龟', '鱼', '蜥蜴'], title: '清洁饲养环境', type: 'habitat_cleaning' },
  { category: 'care', icon: '🏃', repeatDays: 1, species: ['狗'], title: '遛狗', type: 'walk' },
  { category: 'care', icon: '🏖️', repeatDays: 3, species: ['仓鼠'], title: '沙浴/浴沙检查', type: 'sand_bath' },
  { category: 'care', icon: '🪶', repeatDays: 30, species: ['鸟'], title: '羽毛状态检查', type: 'feather_check' },
  { category: 'care', icon: '🐍', repeatDays: 30, species: ['蛇', '蜥蜴'], title: '蜕皮状态检查', type: 'shed_check' },
  { category: 'care', icon: '💧', repeatDays: 7, species: ['鱼', '乌龟'], title: '换水/水质检查', type: 'water_change' },
  { category: 'medicine', icon: '💊', repeatDays: null, species: ['all'], title: '用药', type: 'medicine' },
  { category: 'medicine', icon: '📋', repeatDays: null, species: ['all'], title: '复查', type: 'revisit' },
  { category: 'custom', icon: '🐾', repeatDays: null, species: ['all'], title: '自定义', type: 'custom' },
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

export function getPetTodoTemplatesForSpecies(species) {
  if (!species) return petTodoTemplates;
  const speciesTemplates = petTodoTemplates.filter((template) => template.species.includes(species));
  const generalTemplates = petTodoTemplates.filter((template) => template.species.includes('all'));
  return [...speciesTemplates, ...generalTemplates];
}

export function getPetTodoSpeciesHint(species) {
  if (species === '狗') return '已优先推荐遛狗、美容、洗澡、驱虫和疫苗周期。';
  if (species === '猫') return '已优先推荐驱虫、剪指甲、梳毛、刷牙和疫苗周期。';
  if (species === '仓鼠') return '已优先推荐清洁饲养环境、沙浴检查和称体重。';
  if (species === '鸟') return '已优先推荐羽毛状态、洗澡、剪指甲和环境清洁。';
  if (['蛇', '蜥蜴'].includes(species)) return '已优先推荐蜕皮状态、环境清洁和体重检查。';
  if (['鱼', '乌龟'].includes(species)) return '已优先推荐换水/水质、环境清洁和体检提醒。';
  return '可按宠物实际情况设置周期，到期后完成一次会自动计算下次提醒。';
}

export function getPetTodoIcon(type) {
  return getPetTodoTemplate(type)?.icon || '🐾';
}

export function getPetTodoCategoryLabel(category) {
  return petTodoCategoryLabels[category] || '照护事项';
}
