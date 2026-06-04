export const foodLevels = [
  ['normal', '和平常差不多'],
  ['low', '比平常少'],
  ['high', '比平常多'],
  ['none', '几乎没吃'],
  ['unknown', '不确定'],
];

const speciesCareMap = {
  bird: ['换羽明显', '啄羽变多', '不爱叫', '鼻孔有分泌物', '便便异常', '食欲下降'],
  cat: ['发情表现', '频繁叫春', '频繁蹭人', '乱尿', '吐毛球', '打喷嚏', '掉毛明显增多', '频繁舔毛'],
  default: ['今日陪玩', '已清洁环境', '精神需观察', '拍照记录'],
  dog: ['发情/出血', '外阴肿胀', '频繁舔舐', '情绪焦躁', '拆家变多', '食欲变化', '咳嗽', '腹泻'],
  hamster: ['发情气味明显', '咬笼频繁', '掉毛异常', '湿尾/腹泻', '不爱跑轮', '攻击性增强'],
  reptile: ['蜕皮异常', '拒食', '精神低', '呼吸异常', '温湿度异常', '排便异常'],
};

export function getSpeciesKey(species = '') {
  if (species.includes('狗')) return 'dog';
  if (species.includes('猫')) return 'cat';
  if (species.includes('仓鼠')) return 'hamster';
  if (species.includes('鸟')) return 'bird';
  if (['蛇', '蜥蜴', '乌龟'].some((name) => species.includes(name))) return 'reptile';
  return 'default';
}

export function getSpeciesCareTags(species) {
  return speciesCareMap[getSpeciesKey(species)];
}
