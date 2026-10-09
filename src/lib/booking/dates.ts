/**
 * Date-only helpers. Every booking date is a calendar day stored as a UTC
 * midnight (`@db.Date` in Postgres), so day arithmetic never drifts with
 * time zones or daylight saving.
 */
export const DAY_MS = 86_400_000;

/** Free preparation days that follow every hire. Change this one constant to alter the policy. */
export const BUFFER_DAYS = 1;

export function parseDateOnly(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) return null;
  return d;
}

export function toDateOnlyString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function todayUtc(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * DAY_MS);
}

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * A hire occupies every calendar day from `start` to `end` inclusive, and the
 * item then needs `bufferDays` free days for preparation. Two hires conflict
 * when the new one touches the existing one's days or its buffer, or the
 * existing one touches the new one's buffer, so the buffer protects both sides:
 *
 *   newStart <= existingEnd + buffer  AND  newEnd + buffer >= existingStart
 */
export function rangesConflict(
  candidate: DateRange,
  existing: DateRange,
  bufferDays: number = BUFFER_DAYS,
): boolean {
  return (
    candidate.start.getTime() <= addDays(existing.end, bufferDays).getTime() &&
    addDays(candidate.end, bufferDays).getTime() >= existing.start.getTime()
  );
}

/** The days an existing booking makes unavailable: its own days plus the buffer. */
export function blockedRange(existing: DateRange, bufferDays: number = BUFFER_DAYS): DateRange {
  return { start: existing.start, end: addDays(existing.end, bufferDays) };
}
