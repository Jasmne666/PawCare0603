export const quickHealthRecordGroups = [
  {
    id: 'food',
    label: '吃饭',
    options: [
      { label: '正常', patch: { food_amount: 150 }, value: 'normal' },
      { label: '少了', patch: { food_amount: 90, symptoms: ['食欲偏少'] }, value: 'low' },
      { label: '没吃', patch: { food_amount: 0, symptoms: ['没有进食'] }, value: 'none' },
      { label: '多了', patch: { food_amount: 190 }, value: 'high' },
    ],
  },
  {
    id: 'water',
    label: '喝水',
    options: [
      { label: '正常', patch: { water_amount: 200 }, value: 'normal' },
      { label: '少了', patch: { symptoms: ['饮水偏少'], water_amount: 120 }, value: 'low' },
      { label: '多了', patch: { water_amount: 260 }, value: 'high' },
    ],
  },
  {
    id: 'poop',
    label: '便便',
    options: [
      { label: '正常', patch: { poop_count: 1 }, value: 'normal' },
      { label: '软便', patch: { poop_count: 1, symptoms: ['软便'] }, value: 'soft' },
      { label: '拉稀', patch: { poop_count: 1, symptoms: ['腹泻'] }, value: 'diarrhea' },
      { label: '便秘', patch: { poop_count: 0, symptoms: ['便秘'] }, value: 'constipation' },
    ],
  },
  {
    id: 'mood',
    label: '精神',
    options: [
      { label: '活跃', patch: { mood: '😊' }, value: 'active' },
      { label: '一般', patch: { mood: '😐' }, value: 'normal' },
      { label: '低落', patch: { mood: '😞', symptoms: ['精神低落'] }, value: 'low' },
    ],
  },
];

export const quickHealthRecordSymptoms = [
  '食欲偏少',
  '没有进食',
  '饮水偏少',
  '软便',
  '腹泻',
  '便秘',
  '精神低落',
];

export function buildQuickHealthPatch(selection) {
  const nextPatch = {};
  const symptomSet = new Set();

  quickHealthRecordGroups.forEach((group) => {
    const selectedOption = group.options.find((option) => option.value === selection[group.id]);
    if (!selectedOption) return;

    Object.entries(selectedOption.patch).forEach(([key, value]) => {
      if (key === 'symptoms') {
        value.forEach((symptom) => symptomSet.add(symptom));
        return;
      }
      nextPatch[key] = value;
    });
  });

  nextPatch.symptoms = [...symptomSet];
  return nextPatch;
}

export function getQuickRecordStampName(selection) {
  if (selection.food === 'none' || selection.mood === 'low' || ['diarrhea', 'constipation'].includes(selection.poop)) {
    return '需要观察爪印';
  }
  if (selection.food === 'normal' && selection.water === 'normal' && selection.poop === 'normal') {
    return '认真照顾爪印';
  }
  if (selection.mood === 'active') return '活力满格爪印';
  return '今日照护爪印';
}
