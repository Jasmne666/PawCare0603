import { getDailyCareLabel } from './dailyCareOptions.js';
import { getSpeciesCareTags } from './recordCareOptions.js';

export const recordEntrySections = [
  { icon: '🍚', id: 'food', label: '吃饭' },
  { icon: '💧', id: 'water', label: '喝水' },
  { icon: '💩', id: 'stool', label: '便便' },
  { icon: '😊', id: 'mood', label: '心情' },
  { icon: '⚡', id: 'activity', label: '活动量' },
  { icon: '🎾', id: 'interaction', label: '互动' },
  { icon: '🩺', id: 'symptoms', label: '特殊症状' },
  { icon: '➕', id: 'custom', label: '更多记录' },
];

const normalCareTags = ['没有异常', '猫砂盆已清理', '抓挠/磨爪正常', '叫声正常', '羽毛顺滑', '站杆稳定', '已遛狗', '出门排尿', '牵引状态稳定', '跑轮活跃', '藏粮正常', '笼舍已清理', '啃咬正常', '温湿度已检查', '蜕皮状态正常', '加热灯正常'];

export const sectionChoices = {
  activity: [
    ['normal', '正常'],
    ['low', '偏少'],
    ['high', '特别活跃'],
  ],
  foodLevel: [
    ['normal', '和平常差不多'],
    ['low', '比平常少'],
    ['high', '比平常多'],
    ['none', '几乎没吃'],
    ['unknown', '不确定'],
  ],
  interaction: [
    ['played', '玩耍'],
    ['walked', '散步'],
    ['groomed', '梳毛'],
    ['photo', '拍照'],
    ['none', '无'],
  ],
  mood: [
    ['happy', '开心'],
    ['normal', '正常'],
    ['tired', '蔫蔫'],
    ['uncomfortable', '不舒服'],
  ],
  stool: [
    ['normal', '正常'],
    ['soft', '偏软'],
    ['diarrhea', '拉稀'],
    ['constipation', '便秘'],
    ['bloody', '带血'],
  ],
  water: [
    ['normal', '正常'],
    ['low', '偏少'],
    ['high', '偏多'],
  ],
};

export function getRecordSectionSummary(sectionId, record, pet) {
  if (!record) return '未记录';
  if (sectionId === 'food') {
    const amount =
      record.food_amount_mode === 'grams' && record.food_amount_grams
        ? `${record.food_amount_grams}g`
        : getDailyCareLabel('appetite', record.food_amount_level || record.appetite);
    const brand = record.food_brand ? ` · ${record.food_brand}` : '';
    const serving = record.food_serving_count ? ` · ${record.food_serving_count}碗` : '';
    return `${amount}${serving}${brand}`;
  }
  if (sectionId === 'symptoms') {
    const tags = (record.species_care_tags || []).filter((tag) => !normalCareTags.includes(tag));
    return tags.length ? tags.slice(0, 3).join('、') : `${pet.name}暂无特殊症状`;
  }
  if (sectionId === 'custom') {
    const items = record.custom_care_items || [];
    return items.length ? items.slice(0, 2).join('、') : record.abnormal_notes || '可添加自定义记录';
  }
  return getDailyCareLabel(sectionId, record[sectionId]);
}

export function getSymptomOptions(pet) {
  const base = ['没有异常', '食欲不振', '打喷嚏', '咳嗽', '呕吐', '腹泻', '便秘', '嗜睡'];
  const species = getSpeciesCareTags(pet.species);
  return [...new Set([...base, ...species])];
}
