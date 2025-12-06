
import crypto from 'crypto';
export const generateShortCode = (): string => {
    return crypto.randomBytes(3).toString('hex');
}
 
export const CODE_REGEX = /^[A-Za-z0-9_-]{3,20}$/

export const isValidUrl = (url: string) => {
  try { new URL(url); return true; } catch { return false; }
};

