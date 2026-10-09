import { describe, expect, it } from 'vitest';
import { addDays, blockedRange, parseDateOnly, rangesConflict, todayUtc } from '@/lib/booking/dates';
import { bookingSchema, validateBookingDates } from '@/lib/validation/booking';

const d = (s: string) => parseDateOnly(s)!;
const r = (a: string, b: string) => ({ start: d(a), end: d(b) });

describe('parseDateOnly', () => {
  it('accepts real calendar dates only', () => {
    expect(parseDateOnly('2026-11-10')).toBeInstanceOf(Date);
    expect(parseDateOnly('2026-02-30')).toBeNull();
    expect(parseDateOnly('10/11/2026')).toBeNull();
    expect(parseDateOnly('')).toBeNull();
  });
});

describe('validateBookingDates', () => {
  const today = d('2026-10-07');

  it('accepts a start of today and a later end', () => {
    expect(validateBookingDates('2026-10-07', '2026-10-08', today)).toEqual({});
  });
  it('rejects a start date in the past', () => {
    expect(validateBookingDates('2026-10-06', '2026-10-09', today).startDate).toMatch(/past/);
  });
  it('rejects an end date equal to the start date', () => {
    expect(validateBookingDates('2026-10-10', '2026-10-10', today).endDate).toMatch(/after the start/);
  });
  it('rejects an end date before the start date', () => {
    expect(validateBookingDates('2026-10-10', '2026-10-09', today).endDate).toMatch(/after the start/);
  });
  it('rejects missing or malformed dates', () => {
    expect(validateBookingDates('', '', today)).toEqual({ startDate: 'Choose a start date.', endDate: 'Choose an end date.' });
    expect(validateBookingDates('2026-13-01', '2026-13-02', today).startDate).toBeDefined();
  });
});

describe('bookingSchema (shared by client and server)', () => {
  it('rejects a past start date', () => {
    const res = bookingSchema.safeParse({ fleetItemId: 'x', startDate: '2000-01-01', endDate: '2000-01-05' });
    expect(res.success).toBe(false);
  });
  it('accepts a valid future range', () => {
    const start = addDays(todayUtc(), 3).toISOString().slice(0, 10);
    const end = addDays(todayUtc(), 5).toISOString().slice(0, 10);
    expect(bookingSchema.safeParse({ fleetItemId: 'x', startDate: start, endDate: end }).success).toBe(true);
  });
  it('rejects overly long notes', () => {
    const start = addDays(todayUtc(), 3).toISOString().slice(0, 10);
    const end = addDays(todayUtc(), 5).toISOString().slice(0, 10);
    expect(bookingSchema.safeParse({ fleetItemId: 'x', startDate: start, endDate: end, notes: 'a'.repeat(501) }).success).toBe(false);
  });
});

describe('rangesConflict with a 1-day preparation buffer', () => {
  const existing = r('2026-11-10', '2026-11-12'); // days 10, 11, 12; day 13 is preparation

  it('conflicts when the new hire overlaps the existing one', () => {
    expect(rangesConflict(r('2026-11-11', '2026-11-14'), existing)).toBe(true);
  });
  it('conflicts when the new hire starts on the existing end date', () => {
    expect(rangesConflict(r('2026-11-12', '2026-11-14'), existing)).toBe(true);
  });
  it('conflicts when the new start falls inside the buffer day after the existing hire', () => {
    expect(rangesConflict(r('2026-11-13', '2026-11-15'), existing)).toBe(true);
  });
  it('allows a back-to-back booking that starts after the buffer day', () => {
    expect(rangesConflict(r('2026-11-14', '2026-11-16'), existing)).toBe(false);
  });
  it('protects the other side: a new hire ending on the day before the existing start conflicts', () => {
    expect(rangesConflict(r('2026-11-07', '2026-11-09'), existing)).toBe(true);
  });
  it('allows a new hire that ends with one free day before the existing start', () => {
    expect(rangesConflict(r('2026-11-06', '2026-11-08'), existing)).toBe(false);
  });
  it('conflicts when the new hire fully contains the existing one', () => {
    expect(rangesConflict(r('2026-11-01', '2026-11-30'), existing)).toBe(true);
  });
  it('conflicts when the new hire sits fully inside the existing one', () => {
    expect(rangesConflict(r('2026-11-11', '2026-11-11'), existing)).toBe(true);
  });
  it('allows far-apart ranges', () => {
    expect(rangesConflict(r('2027-01-01', '2027-01-05'), existing)).toBe(false);
  });
  it('honours a different buffer length', () => {
    expect(rangesConflict(r('2026-11-14', '2026-11-16'), existing, 2)).toBe(true);
    expect(rangesConflict(r('2026-11-15', '2026-11-16'), existing, 2)).toBe(false);
    expect(rangesConflict(r('2026-11-13', '2026-11-15'), existing, 0)).toBe(false);
  });
});

describe('blockedRange', () => {
  it('extends the existing booking by the buffer', () => {
    const b = blockedRange(r('2026-11-10', '2026-11-12'));
    expect(b.start.toISOString().slice(0, 10)).toBe('2026-11-10');
    expect(b.end.toISOString().slice(0, 10)).toBe('2026-11-13');
  });
});
