const requiredFields = ['appetite', 'water', 'mood'];

export function isRewardStickerUnlocked(record) {
  if (!record) return false;
  return requiredFields.every((field) => Boolean(record[field]));
}

export function getRewardStickerMeta(record, pet) {
  if (record?.mood === 'happy') {
    return {
      accent: '#4A7C59',
      emoji: '✨',
      note: `${pet.name}今天心情很好，值得收藏一下。`,
      series: '快乐系列',
      title: `${pet.name}的快乐贴纸`,
    };
  }
  if (record?.appetite === 'high' || record?.food_amount_level === 'high') {
    return {
      accent: '#E8A020',
      emoji: '🍚',
      note: `${pet.name}今天是认真吃饭的小朋友。`,
      series: '美食家系列',
      title: `${pet.name}的美食家贴纸`,
    };
  }
  if (record?.mood === 'tired' || record?.mood === 'uncomfortable') {
    return {
      accent: '#D95F5F',
      emoji: '🤍',
      note: `${pet.name}今天需要多一点温柔照顾。`,
      series: '关怀系列',
      title: `${pet.name}的关怀贴纸`,
    };
  }
  return {
    accent: '#5C3D2E',
    emoji: '🐾',
    note: `${pet.name}今天的小报告已完成。`,
    series: '日常系列',
    title: `${pet.name}的今日贴纸`,
  };
}
