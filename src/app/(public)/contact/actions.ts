'use server';

import { prisma } from '@/lib/prisma';
import { fieldErrors, inquirySchema } from '@/lib/validation/fleet';

export type InquiryResult = { ok: true } | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function sendInquiry(input: unknown): Promise<InquiryResult> {
  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: 'Please correct the highlighted fields.', fieldErrors: fieldErrors(parsed.error) };
  try {
    await prisma.inquiry.create({ data: parsed.data });
    return { ok: true };
  } catch {
    return { ok: false, message: 'We could not send your enquiry. Please try again.' };
  }
}
