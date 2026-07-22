import {
  format,
  addDays,
  parseISO,
  startOfWeek,
  differenceInCalendarDays,
  isBefore,
} from 'date-fns';

/** 'yyyy-MM-dd' key for a Date (local time). */
export const toKey = (d) => format(d, 'yyyy-MM-dd');

export const todayKey = () => toKey(new Date());

export const parseKey = (key) => parseISO(key);

export const addDaysKey = (key, n) => toKey(addDays(parseISO(key), n));

export const monthKeyOf = (d = new Date()) => format(d, 'yyyy-MM');

export const shiftMonth = (monthKey, delta) =>
  format(
    new Date(Number(monthKey.slice(0, 4)), Number(monthKey.slice(5, 7)) - 1 + delta, 1),
    'yyyy-MM'
  );

/** All date keys of a 'yyyy-MM' month. */
export function daysOfMonth(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  const count = new Date(y, m, 0).getDate();
  return Array.from({ length: count }, (_, i) => `${monthKey}-${String(i + 1).padStart(2, '0')}`);
}

/** 7 keys representing the week (Mon-Sun) `offset` weeks from the current one. */
export function weekKeys(offset = 0) {
  const monday = startOfWeek(addDays(new Date(), offset * 7), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => toKey(addDays(monday, i)));
}

export function lastNDays(n, endKey = todayKey()) {
  return Array.from({ length: n }, (_, i) => addDaysKey(endKey, -(n - 1 - i)));
}

export const diffDays = (a, b) => differenceInCalendarDays(parseISO(a), parseISO(b));

export const isBeforeKey = (a, b) =>
  a === b ? false : isBefore(parseISO(a), parseISO(b));

export const shortDay = (key) => format(parseISO(key), 'EEE');
export const shortDate = (key) => format(parseISO(key), 'MMM d');
export const monthLabel = (monthKey) =>
  format(new Date(Number(monthKey.slice(0, 4)), Number(monthKey.slice(5, 7)) - 1, 1), 'MMMM yyyy');

export const prettyDateTime = (iso) => {
  try {
    return format(new Date(iso.replace(' ', 'T')), 'MMM d, yyyy · h:mm a');
  } catch {
    return iso;
  }
};
