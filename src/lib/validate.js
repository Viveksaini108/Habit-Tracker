import { asInt, cleanText, isDateKey, isHexColor } from './api.js';

/**
 * Validate + normalize a habit payload.
 * Returns { data } or { error }.
 */
export function habitPayload(body, { partial = false } = {}) {
  const data = {};

  if (!partial || body.name !== undefined) {
    const name = cleanText(body.name, 100);
    if (!name) return { error: 'Habit name is required' };
    data.name = name;
  }

  if (!partial || body.description !== undefined) {
    data.description = cleanText(body.description, 400);
  }

  if (!partial || body.category_id !== undefined) {
    if (body.category_id === null || body.category_id === '' || body.category_id === undefined) {
      data.category_id = null;
    } else {
      const id = asInt(body.category_id);
      if (!id) return { error: 'Invalid category' };
      data.category_id = id;
    }
  }

  if (!partial || body.color !== undefined) {
    if (body.color === undefined || body.color === null || body.color === '') {
      data.color = '#6366f1';
    } else if (!isHexColor(body.color)) {
      return { error: 'Invalid color' };
    } else {
      data.color = body.color;
    }
  }

  if (!partial || body.target_per_week !== undefined) {
    const t = asInt(body.target_per_week ?? 7, 7);
    if (t < 1 || t > 7) return { error: 'Weekly target must be between 1 and 7' };
    data.target_per_week = t;
  }

  if (!partial || body.start_date !== undefined) {
    if (!isDateKey(body.start_date)) return { error: 'Start date must be YYYY-MM-DD' };
    data.start_date = body.start_date;
  }

  if (!partial || body.end_date !== undefined) {
    if (body.end_date === null || body.end_date === '' || body.end_date === undefined) {
      data.end_date = null;
    } else {
      if (!isDateKey(body.end_date)) return { error: 'End date must be YYYY-MM-DD' };
      data.end_date = body.end_date;
    }
  }

  if (data.start_date && data.end_date && data.end_date < data.start_date) {
    return { error: 'End date cannot be before the start date' };
  }

  if (body.archived !== undefined) data.archived = body.archived ? 1 : 0;

  return { data };
}
