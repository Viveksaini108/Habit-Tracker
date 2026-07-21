'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TodayChecklist from './TodayChecklist';
import HabitForm from './HabitForm';
import { Button } from './ui';
import { IconPlus } from './icons';

/** Client wrapper: owns the "new habit" modal + list refresh. */
export default function TodayCard({ todayList, today, categories }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink">Today’s habits</h3>
        <Button size="sm" variant="soft" onClick={() => setFormOpen(true)}>
          <IconPlus className="h-4 w-4" /> New habit
        </Button>
      </div>

      <TodayChecklist initialList={todayList} today={today} onNewHabit={() => setFormOpen(true)} />

      <HabitForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => router.refresh()}
        habit={null}
        categories={categories}
        today={today}
      />
    </div>
  );
}
