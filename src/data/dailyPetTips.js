export const dailyPetTips = [
  {
    title: '喝水小雷达启动',
    text: '把水碗放远一点点，很多小猫小狗会更愿意咕噜咕噜喝水哦。',
    emoji: '💧',
  },
  {
    title: '少吃一天要留意',
    text: '如果连续两天饭量明显变少，要把精神、便便和喝水一起记下来。',
    emoji: '🍚',
  },
  {
    title: '体重看趋势更准',
    text: '每周固定时间称一次，比偶尔称一次更容易发现悄悄变化。',
    emoji: '⚖️',
  },
  {
    title: '便便也会报信',
    text: '腹泻、便秘或频繁如厕都别忽略，它们经常比宠物先开口。',
    emoji: '💩',
  },
  {
    title: '小鸟也要玩具',
    text: '站杆、啃咬玩具和规律互动，可以帮鸟宝少一点无聊和焦虑。',
    emoji: '🐦',
  },
  {
    title: '爬宠爱稳定环境',
    text: '蛇和蜥蜴的食欲、蜕皮状态，常常和温湿度变化关系很大。',
    emoji: '🐍',
  },
  {
    title: '情绪变化要记账',
    text: '突然躲起来、变凶或特别嗜睡，可能是身体不舒服的小暗号。',
    emoji: '😿',
  },
];

export function getDailyPetTip(date = new Date()) {
  const dayIndex = Math.floor(
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86400000,
  );
  return dailyPetTips[dayIndex % dailyPetTips.length];
}
