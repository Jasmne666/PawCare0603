export function calcPetAge(birthDate) {
  if (!birthDate) return '未知';

  const birth = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return '未知';

  const now = new Date();
  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    now.getMonth() -
    birth.getMonth();

  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) return '未知';
  if (months < 12) return `${months}个月`;

  const years = Math.floor(months / 12);
  const restMonths = months % 12;
  return restMonths > 0 ? `${years}岁${restMonths}个月` : `${years}岁`;
}

