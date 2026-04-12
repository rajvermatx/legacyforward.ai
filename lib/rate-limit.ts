interface Attempt { count: number; lockedUntil: number; }
const attempts = new Map<string, Attempt>();

const MAX_ATTEMPTS = 5;
const LOCK_DURATIONS = [30, 60, 300, 900]; // seconds: 30s, 1m, 5m, 15m

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (entry && entry.lockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((entry.lockedUntil - now) / 1000) };
  }

  return { allowed: true };
}

export function recordFailure(ip: string): void {
  const now = Date.now();
  const entry = attempts.get(ip) ?? { count: 0, lockedUntil: 0 };
  entry.count += 1;

  if (entry.count >= MAX_ATTEMPTS) {
    const lockIndex = Math.min(Math.floor(entry.count / MAX_ATTEMPTS) - 1, LOCK_DURATIONS.length - 1);
    entry.lockedUntil = now + LOCK_DURATIONS[lockIndex] * 1000;
  }

  attempts.set(ip, entry);
}

export function recordSuccess(ip: string): void {
  attempts.delete(ip);
}
