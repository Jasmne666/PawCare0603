import { addDays, getLocalDateString, parseLocalDate } from './todoDates.js';

const catHeatTags = ['发情表现', '频繁叫春', '频繁蹭人', '乱尿'];
const dogHeatTags = ['发情/出血', '外阴肿胀', '频繁舔舐'];
const hamsterCycleTags = ['发情气味明显', '攻击性增强'];

function hasAnyTag(record, tags) {
  return (record?.species_care_tags || []).some((tag) => tags.includes(tag));
}

function getSpeciesKind(pet) {
  if (pet.species?.includes('猫')) return 'cat';
  if (pet.species?.includes('狗')) return 'dog';
  if (pet.species?.includes('仓鼠')) return 'hamster';
  if (pet.species?.includes('鸟')) return 'bird';
  return 'other';
}

function getMonthRange(monthDate) {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  return { end: getLocalDateString(end), start: getLocalDateString(start) };
}

function addWindow(map, start, end, marker) {
  let cursor = parseLocalDate(start);
  const last = parseLocalDate(end);
  while (cursor && last && cursor <= last) {
    const dateKey = getLocalDateString(cursor);
    map[dateKey] = marker;
    cursor.setDate(cursor.getDate() + 1);
  }
}

function getLastTaggedDate(records, tags) {
  return [...records]
    .filter((record) => hasAnyTag(record, tags))
    .sort((a, b) => b.record_date.localeCompare(a.record_date))[0]?.record_date;
}

export function getCycleMarkers({ monthDate, pet, records }) {
  const kind = getSpeciesKind(pet);
  const markers = {};
  const notes = [];
  const monthRange = getMonthRange(monthDate);

  if (pet.neutered) {
    return { markers, notes: ['已绝育宠物通常不需要预测发情周期。'] };
  }

  if (kind === 'cat') {
    records.filter((record) => hasAnyTag(record, catHeatTags)).forEach((record) => {
      markers[record.record_date] = { color: 'rose', label: '已记录发情表现' };
    });
    const lastDate = getLastTaggedDate(records, catHeatTags);
    if (lastDate) {
      addWindow(markers, addDays(lastDate, 14), addDays(lastDate, 21), {
        color: 'amber',
        label: '可能发情窗口',
      });
      notes.push('猫未绝育时可能每 2-3 周进入一次发情周期，日历仅按已记录日期给出窗口提示。');
    } else {
      notes.push('猫的发情预测需要先在“特殊症状”里记录发情表现、频繁叫春或频繁蹭人。');
    }
  }

  if (kind === 'dog') {
    records.filter((record) => hasAnyTag(record, dogHeatTags)).forEach((record) => {
      markers[record.record_date] = { color: 'rose', label: '已记录发情/出血' };
    });
    const lastDate = getLastTaggedDate(records, dogHeatTags);
    if (lastDate) {
      addWindow(markers, addDays(lastDate, 150), addDays(lastDate, 210), {
        color: 'amber',
        label: '下次发情大致窗口',
      });
      notes.push('狗的发情周期通常按数月计算，不会按每月预测；这里仅给 5-7 个月后的大致窗口。');
    } else {
      notes.push('狗的发情/出血需要先记录开始日期，之后才会提示下一次大致窗口。');
    }
  }

  if (kind === 'hamster') {
    const lastDate = getLastTaggedDate(records, hamsterCycleTags);
    if (lastDate) {
      let cursor = addDays(lastDate, 4);
      while (cursor <= monthRange.end) {
        if (cursor >= monthRange.start) {
          markers[cursor] = { color: 'violet', label: '仓鼠可能特殊周期' };
        }
        cursor = addDays(cursor, 4);
      }
      notes.push('雌性仓鼠动情周期约 4 天，提示只用于观察行为变化。');
    } else {
      notes.push('仓鼠周期提示需要先记录一次发情气味明显或攻击性增强等表现。');
    }
  }

  if (kind === 'bird') {
    notes.push('鸟类换羽、剪羽和护理更适合用待办提醒，不按固定生理周期硬预测。');
  }

  return { markers, notes };
}
