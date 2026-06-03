export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function addDays(dateValue, days) {
  const date = parseLocalDate(dateValue) || new Date();
  date.setDate(date.getDate() + Number(days || 0));
  return getLocalDateString(date);
}

export function getMonthEnd(date = new Date()) {
  return getLocalDateString(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function getDaysUntil(dateValue) {
  const target = parseLocalDate(dateValue);
  if (!target) return 0;
  const today = parseLocalDate(getLocalDateString());
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function formatDueText(dateValue) {
  const days = getDaysUntil(dateValue);
  if (days < 0) return `已逾期 ${Math.abs(days)} 天`;
  if (days === 0) return '今天到期';
  if (days === 1) return '明天到期';
  return `还有 ${days} 天`;
}

export function isWithinDays(dateValue, days) {
  const dayDiff = getDaysUntil(dateValue);
  return dayDiff <= days;
}

export function isWithinThisMonth(dateValue) {
  return dateValue <= getMonthEnd();
}
