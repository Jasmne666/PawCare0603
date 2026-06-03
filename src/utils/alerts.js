import { calcPetAge } from './petAge.js';

function getAgeMonths(birthDate) {
  if (!birthDate) return 0;
  const birth = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return 0;

  return Math.floor((Date.now() - birth.getTime()) / 2592000000);
}

export function getHomeAlerts(pet, recentLogs) {
  if (!pet) return [];

  const alerts = [];
  const today = new Date().toISOString().slice(0, 10);
  const todayLog = recentLogs.find((log) => log.log_date === today);
  const petName = pet.name || '宠物';
  const ageMonths = getAgeMonths(pet.birth_date);

  if (!pet.neutered && ageMonths >= 10 && ageMonths <= 14) {
    alerts.push({
      type: 'warn',
      icon: '✂️',
      title: '绝育时间到了',
      desc: `${petName}已${calcPetAge(pet.birth_date)}，建议尽快预约兽医安排绝育。`,
      question: `现在适合给${petName}做绝育手术吗？有什么需要提前准备的？`,
    });
  }

  if (todayLog && parseInt(todayLog.food_amount, 10) < 100) {
    alerts.push({
      type: 'danger',
      icon: '🍽️',
      title: '进食量明显偏少',
      desc: '今天进食不足正常水平60%，请关注是否有其他异常症状。',
      question: `${petName}今天进食量很少，请帮我分析原因和应对方法。`,
    });
  }

  if (todayLog && parseInt(todayLog.water_amount, 10) < 180) {
    alerts.push({
      type: 'warn',
      icon: '💧',
      title: '饮水量偏少',
      desc: '饮水不足可能导致泌尿系统问题，建议检查饮水碗。',
      question: `${petName}最近饮水量减少，这会有什么健康影响？`,
    });
  }

  return alerts;
}
