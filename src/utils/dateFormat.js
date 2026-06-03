export function formatLogDate(date) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (date === today) return '今天';
  if (date === yesterday) return '昨天';
  if (!date) return '未记录';

  return `${date.slice(5, 7)}月${date.slice(8, 10)}日`;
}
