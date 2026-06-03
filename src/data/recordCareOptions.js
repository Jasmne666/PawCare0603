export const foodLevels = [
  ['normal', '和平常差不多'],
  ['low', '比平常少'],
  ['high', '比平常多'],
  ['none', '几乎没吃'],
  ['unknown', '不确定'],
];

const speciesCareMap = {
  bird: ['叫声正常', '羽毛顺滑', '站杆稳定', '便便需观察'],
  cat: ['猫砂盆已清理', '抓挠/磨爪正常', '躲藏变多', '有吐毛球'],
  default: ['今日陪玩', '已清洁环境', '精神需观察', '拍照记录'],
  dog: ['已遛狗', '出门排尿', '牵引状态稳定', '有拆家/焦躁'],
  hamster: ['跑轮活跃', '藏粮正常', '笼舍已清理', '啃咬正常'],
  reptile: ['温湿度已检查', '蜕皮状态正常', '加热灯正常', '进食需观察'],
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
