function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getAgeMonths(birthDate) {
  const birth = parseDate(birthDate);
  if (!birth) return null;

  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  return months >= 0 ? months : null;
}

function hasRecentWeightLog(logs) {
  return logs.some((log) => Number(log.weight_kg) > 0);
}

function hasAbnormalLog(log) {
  return (
    Number(log.food_amount || 0) < 100 ||
    Number(log.water_amount || 0) < 180 ||
    Number(log.poop_count || 0) < 1 ||
    log.poop_status === '异常' ||
    log.mood === '🤒' ||
    log.mood === '😞' ||
    (log.symptoms?.length || 0) > 0
  );
}

export function getCareReminders(pet, logs) {
  const reminders = [];
  const today = getLocalDateString();
  const ageMonths = getAgeMonths(pet.birth_date);
  const recentLogs = logs.slice(0, 7);

  if (!recentLogs.some((log) => log.log_date === today)) {
    reminders.push({
      type: 'info',
      icon: '📝',
      title: '今天还没打卡',
      desc: `给${pet.name}补一条记录，健康趋势会更准。`,
    });
  }

  if (!pet.vaccinated) {
    reminders.push({
      type: 'warn',
      icon: '💉',
      title: '疫苗状态待确认',
      desc: '如果还没接种或不确定日期，建议翻一下免疫本或问兽医。',
    });
  }

  if (!hasRecentWeightLog(recentLogs)) {
    reminders.push({
      type: 'info',
      icon: '⚖️',
      title: '该称一次体重了',
      desc: '每周固定时间称重一次，更容易发现慢性变化。',
    });
  }

  if (!pet.neutered && ageMonths !== null && ageMonths >= 6) {
    reminders.push({
      type: 'warn',
      icon: '✂️',
      title: '绝育计划可咨询',
      desc: `${pet.name}已经进入可咨询绝育的年龄段，具体时间以兽医评估为准。`,
    });
  }

  if (recentLogs.filter(hasAbnormalLog).length >= 2) {
    reminders.push({
      type: 'danger',
      icon: '🏥',
      title: '近期异常偏多',
      desc: '这周已有多天出现吃喝、排便或精神异常，建议重点观察。',
    });
  }

  return reminders.slice(0, 4);
}
