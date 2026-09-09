import { z } from "zod";
import { siteConfig } from "./site-config";

/**
 * Shared reservation schema. Used on the client (for inline errors) and on
 * the server (POST /api/reservations) so both sides enforce identical rules.
 * Server-side validation is authoritative; client-side validation only
 * improves UX.
 */

const seatingWindowValues = siteConfig.seatingWindows.map((w) => w.value) as [
  string,
  ...string[],
];
const guestCountValues = siteConfig.guestCountOptions.map((g) => g.value) as [
  string,
  ...string[],
];

// Accepts 09XXXXXXXXX, 9XXXXXXXXX, or +63 9XXXXXXXXX / 63 9XXXXXXXXX,
// optionally with spaces or hyphens, which we strip before checking.
const PH_MOBILE_REGEX = /^(?:\+?63|0)9\d{9}$/;

function normalizePhoneForCheck(value: string): string {
  return value.replace(/[\s-]/g, "");
}

/** Returns true if the given YYYY-MM-DD date is today or later in Asia/Manila. */
export function isTodayOrLaterInManila(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

  const [year, month, day] = dateStr.split("-").map(Number);
  const candidate = Date.UTC(year, month - 1, day);

  const nowInManila = new Date(
    new Date().toLocaleString("en-US", { timeZone: siteConfig.timezone }),
  );
  const todayManila = Date.UTC(
    nowInManila.getFullYear(),
    nowInManila.getMonth(),
    nowInManila.getDate(),
  );

  return candidate >= todayManila;
}

export const reservationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(100, "Name is too long."),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number is too long.")
    .refine(
      (v) => PH_MOBILE_REGEX.test(normalizePhoneForCheck(v)),
      "Enter a valid Philippine mobile number (e.g. 0942 652 9501).",
    ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .max(254, "Email is too long."),
  dateOfVisit: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date.")
    .refine(
      (v) => isTodayOrLaterInManila(v),
      "Choose today or a future date (Asia/Manila).",
    ),
  arrivalTime: z.enum(seatingWindowValues, {
    message: "Choose a seating window.",
  }),
  guestCount: z.enum(guestCountValues, {
    message: "Choose the number of guests.",
  }),
  occasion: z
    .string()
    .trim()
    .max(120, "Keep the occasion under 120 characters.")
    .optional()
    .or(z.literal("")),
  specialRequests: z
    .string()
    .trim()
    .max(500, "Keep special requests under 500 characters.")
    .optional()
    .or(z.literal("")),
  // Honeypot: real users never fill this in. Bots often do.
  companyWebsite: z.string().max(0, "Invalid submission.").optional().or(z.literal("")),
});

export type ReservationInput = z.infer<typeof reservationSchema>;

/**
 * Neutralizes spreadsheet formula injection. Any user-controlled string
 * that starts with a character a spreadsheet would interpret as the start
 * of a formula (=, +, -, @, tab, CR) is prefixed with a leading apostrophe
 * so it is always stored and displayed as plain text.
 */
export function sanitizeForSpreadsheet(value: string): string {
  const trimmed = value.trim();
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    return `'${trimmed}`;
  }
  return trimmed;
}
