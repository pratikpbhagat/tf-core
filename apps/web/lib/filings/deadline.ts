const ONE_DAY_MS = 1000 * 60 * 60 * 24;

// Calendar-day difference between a plain "YYYY-MM-DD" due date and `now`,
// both normalized to UTC midnight — not a raw millisecond diff, which would
// make "due today" flip to "due tomorrow" for any time of day after
// midnight. Parsed explicitly as UTC (not local time) so the result doesn't
// depend on the host machine's timezone — a simplification for a portfolio
// project; a production version would anchor this to IST specifically.
export function daysUntil(dueDateIso: string, now: Date): number {
  const dueMidnightUtc = new Date(`${dueDateIso}T00:00:00Z`).getTime();
  const todayMidnightUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((dueMidnightUtc - todayMidnightUtc) / ONE_DAY_MS);
}

export function formatDeadlineCountdown(dueDateIso: string, now: Date = new Date()): string {
  const diffDays = daysUntil(dueDateIso, now);

  if (diffDays < 0) {
    const overdueBy = Math.abs(diffDays);
    return `Overdue by ${overdueBy} day${overdueBy === 1 ? "" : "s"}`;
  }
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  return `${diffDays} days left`;
}

// Used by the admin deadline-risk view: true for anything overdue or due
// within `thresholdDays`, so already-overdue filings are always flagged
// regardless of the threshold.
export function isAtRisk(dueDateIso: string, now: Date = new Date(), thresholdDays = 30): boolean {
  return daysUntil(dueDateIso, now) <= thresholdDays;
}
