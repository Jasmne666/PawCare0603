import { dailyCareSummaryFields } from '../data/dailyCareOptions.js';

export function formatMonthTitle(date) {
  return date.toLocaleDateString('zh-CN', { month: 'long', year: 'numeric' });
}

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function moveMonth(date, offset) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

export function getCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const start = new Date(year, month, 1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date,
      dateKey: getLocalDateString(date),
      day: date.getDate(),
      inMonth: date.getMonth() === month,
    };
  });
}

export function getPetFaceBase(pet) {
  if (pet?.species?.includes('狗')) return '🐶';
  if (pet?.species?.includes('猫')) return '🐱';
  return pet?.avatar || '🐾';
}

export function getCareStatusLevel(record) {
  if (!record) return 'none';
  if (
    record.mood === 'tired' ||
    record.mood === 'uncomfortable' ||
    ['soft', 'diarrhea', 'constipation', 'bloody'].includes(record.stool)
  ) {
    return 'severe';
  }
  if (
    record.appetite === 'low' ||
    record.appetite === 'none' ||
    record.water === 'low' ||
    record.activity === 'low'
  ) {
    return 'mild';
  }
  return 'normal';
}

export function getCareFace(record, pet) {
  const level = getCareStatusLevel(record);
  if (level === 'none') return '🐾';
  const base = getPetFaceBase(pet);
  if (level === 'severe') return `${base}🤢`;
  if (level === 'mild') return `${base}😐`;
  return `${base}😊`;
}

export function getCareRecordIcons(record) {
  if (!record) return [];
  return dailyCareSummaryFields
    .filter((field) => record[field.key])
    .map((field) => field.icon)
    .slice(0, 5);
}
