import { ok, fail, guard, asInt, isMonthKey } from '@/lib/api';
import { analyticsData } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { user, response } = await guard();
  if (!user) return response;

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') === 'month' ? 'month' : 'week';

  if (period === 'week') {
    const offset = Math.max(-52, Math.min(0, asInt(searchParams.get('offset'), 0)));
    return ok({ data: analyticsData(user.id, { period, offset }) });
  }

  const month = searchParams.get('month');
  if (!isMonthKey(month ?? '')) return fail('month must be YYYY-MM');
  return ok({ data: analyticsData(user.id, { period, month }) });
}
