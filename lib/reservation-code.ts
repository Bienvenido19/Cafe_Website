import { siteConfig } from "./site-config";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I ambiguity

/** Returns today's date as YYYYMMDD in the café's timezone. */
function todayStamp(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: siteConfig.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(new Date())
    .reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
  return `${parts.year}${parts.month}${parts.day}`;
}

/**
 * Generates a short, unique, human-readable reservation code such as
 * BB-20260905-A1B2 using cryptographically secure randomness (Web Crypto,
 * available in the Next.js server runtime).
 */
export function generateReservationCode(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);

  let suffix = "";
  for (const byte of bytes) {
    suffix += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  }

  return `BB-${todayStamp()}-${suffix}`;
}
