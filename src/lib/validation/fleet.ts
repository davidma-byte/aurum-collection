import { z } from 'zod';

export const fleetItemSchema = z.object({
  name: z.string().trim().min(2, 'Enter a name.').max(120),
  collection: z.enum(['CLASSIC', 'MODERN', 'YACHT'], { message: 'Choose a collection.' }),
  description: z.string().trim().min(10, 'Add a description (at least 10 characters).').max(2000),
  specifications: z.string().trim().min(3, 'Add specifications.').max(2000),
  history: z.string().trim().min(3, 'Add history.').max(3000),
  condition: z.string().trim().min(3, 'Describe the condition.').max(1000),
  pricePerDay: z.coerce
    .number({ message: 'Enter a price.' })
    .positive('Price must be greater than zero.')
    .max(1_000_000, 'Price is too high.'),
  imageUrl: z
    .string()
    .trim()
    .min(1, 'Enter an image path.')
    .regex(/^\/images\/[A-Za-z0-9._-]+$/, 'Use a path like /images/classic-7-main.jpg'),
  isActive: z.boolean(),
});

export type FleetItemInput = z.infer<typeof fleetItemSchema>;

export const inquirySchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(254),
  message: z.string().trim().min(10, 'Tell us a little more (at least 10 characters).').max(2000),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

/** Flatten a Zod error into { field: firstMessage } for inline display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
