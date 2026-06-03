export const petSpeciesOptions = [
  { label: '猫', value: 'cat' },
  { label: '狗', value: 'dog' },
  { label: '兔子', value: 'rabbit' },
  { label: '仓鼠', value: 'hamster' },
  { label: '鸟', value: 'bird' },
  { label: '蛇', value: 'snake' },
  { label: '乌龟', value: 'turtle' },
  { label: '鱼', value: 'fish' },
  { label: '蜥蜴', value: 'lizard' },
  { label: '其他', value: 'other' },
];

export const petBreedOptions = {
  cat: ['英国短毛猫', '美国短毛猫', '布偶猫', '暹罗猫', '橘猫', '狸花猫', '缅因猫', '其他'],
  dog: ['金毛', '拉布拉多', '柯基', '柴犬', '边牧', '贵宾犬', '哈士奇', '其他'],
  rabbit: ['荷兰垂耳兔', '侏儒兔', '安哥拉兔', '狮子兔', '其他'],
  hamster: ['金丝熊', '三线仓鼠', '一线仓鼠', '布丁仓鼠', '其他'],
  bird: ['虎皮鹦鹉', '玄凤鹦鹉', '金丝雀', '文鸟', '八哥', '其他'],
  snake: ['玉米蛇', '球蟒', '王蛇', '奶蛇', '其他'],
  turtle: ['巴西龟', '草龟', '地图龟', '黄缘闭壳龟', '其他'],
  fish: ['金鱼', '锦鲤', '孔雀鱼', '斗鱼', '神仙鱼', '其他'],
  lizard: ['豹纹守宫', '鬃狮蜥', '蓝舌石龙子', '绿鬣蜥', '其他'],
};

export function getSpeciesLabel(value) {
  return petSpeciesOptions.find((option) => option.value === value)?.label || '';
}

export function normalizeSpeciesValue(species) {
  if (!species) return '';
  const matchedOption = petSpeciesOptions.find(
    (option) => option.value === species || option.label === species,
  );
  return matchedOption?.value || 'other';
}

export function getBreedOptions(speciesValue) {
  if (!speciesValue) return [];
  return petBreedOptions[speciesValue] || ['其他'];
}
