
/**
 * getExpiryDate
 * - If both expiryDate (e.g. "2025-11-23") and expiryTime (e.g. "14:30" or "14:30:00") are provided,
 *   combines them into a single Date (UTC/local depends on input; using ISO-like string).
 * - If expiryTime is a numeric string/number, treats it as minutes from now.
 * - Returns undefined when no valid expiry provided.
 */
export function getExpiryDate(expiryTime?: string | number, expiryDate?: string): Date | undefined {
  if (expiryDate && expiryTime) {
    // expiryDate expected like "YYYY-MM-DD", expiryTime like "HH:mm" or "HH:mm:ss" (24h)
    const combinedIso = `${expiryDate}T${String(expiryTime)}`;
    const d = new Date(combinedIso);
    if (!isNaN(d.getTime())) return d;
    // try with a space separator (in case input expects local parse)
    const d2 = new Date(`${expiryDate} ${String(expiryTime)}`);
    if (!isNaN(d2.getTime())) return d2;
  }

  // If expiryTime is numeric (minutes from now)
  if (expiryTime !== undefined && expiryTime !== null) {
    const num = typeof expiryTime === "number" ? expiryTime : parseInt(String(expiryTime), 10);
    if (!Number.isNaN(num)) {
      const now = new Date();
      now.setMinutes(now.getMinutes() + num);
      return now;
    }
  }

  return undefined;
}