import React from 'react';

interface Entry {
  id: string;
  durationSeconds: number | null;
  startedAt: string;
  stoppedAt?: string | null;
  user?: { id: string };
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // monday as first day
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function WeeklyBonusCard({
  entries,
}: {
  entries: Entry[] | undefined;
}) {
  const targetHours = 8;
  const pointsPerHour = 10;
  const targetPoints = 100;

  const now = new Date();
  const weekStart = startOfWeek(now);

  // Build days array for week
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const dayStats = days.map((day) => {
    const dayStart = day.getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    const seconds = (entries || []).reduce((acc, e) => {
      const started = new Date(e.startedAt).getTime();
      if (!e.stoppedAt) return acc;
      const stopped = new Date(e.stoppedAt).getTime();
      // count entry if it starts within the day (approx)
      if (started >= dayStart && started < dayEnd) {
        return acc + (e.durationSeconds || 0);
      }
      return acc;
    }, 0);

    const hours = seconds / 3600;
    const overtime = Math.max(0, hours - targetHours);
    const points = Math.round(overtime * pointsPerHour);

    return {
      date: day,
      hours,
      overtime,
      points,
      reached: hours >= targetHours,
    };
  });

  const totalPoints = dayStats.reduce((s, d) => s + d.points, 0);
  const progress = Math.min(100, Math.round((totalPoints / targetPoints) * 100));

  return (
    <div className="border dark:border-border rounded-lg p-6 bg-card dark:bg-card mb-6">
      <h2 className="text-lg font-semibold mb-2 dark:text-card-foreground">Target Minggu Ini: Kejar Bonus Akhir Pekan!</h2>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-muted-foreground">Progress Poin Anda</div>
          <div className="text-sm font-medium">{totalPoints}/{targetPoints} Poin</div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
          <div className="bg-blue-600 h-3" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="space-y-2">
        {dayStats.map((d) => (
          <div key={d.date.toISOString()} className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{d.date.toLocaleDateString()}</div>
            <div className="text-sm">
              <span className="font-medium mr-2">{d.hours.toFixed(2)}h</span>
              {d.reached ? (
                <span className="text-green-400">Target tercapai</span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
              {d.points > 0 && <span className="ml-3 text-sm text-blue-400">+{d.points} poin</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        Reward: Kumpulkan {targetPoints} poin untuk menerima bonus (otomatis masuk ke invoice).
      </div>
    </div>
  );
}
