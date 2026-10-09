import { z } from 'zod';
import { parseDateOnly, todayUtc } from '@/lib/booking/dates';

export interface DateErrors {
  startDate?: string;
  endDate?: string;
}

/** Pure date rules, shared by the Zod schema (client and server) and the unit tests. */
export function validateBookingDates(
  startDate: string,
  endDate: string,
  today: Date = todayUtc(),
): DateErrors {
  const errors: DateErrors = {};
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);

  if (!start) errors.startDate = 'Choose a start date.';
  else if (start.getTime() < today.getTime()) errors.startDate = 'The start date cannot be in the past.';

  if (!end) errors.endDate = 'Choose an end date.';
  else if (start && end.getTime() <= start.getTime()) errors.endDate = 'The end date must be after the start date.';

  return errors;
}

export const bookingSchema = z
  .object({
    fleetItemId: z.string().min(1, 'Missing item.'),
    startDate: z.string().min(1, 'Choose a start date.'),
    endDate: z.string().min(1, 'Choose an end date.'),
    notes: z.string().trim().max(500, 'Notes must be 500 characters or fewer.').optional(),
  })
  .superRefine((value, ctx) => {
    const errors = validateBookingDates(value.startDate, value.endDate);
    if (errors.startDate) ctx.addIssue({ code: 'custom', path: ['startDate'], message: errors.startDate });
    if (errors.endDate) ctx.addIssue({ code: 'custom', path: ['endDate'], message: errors.endDate });
  });

export type BookingInput = z.infer<typeof bookingSchema>;
