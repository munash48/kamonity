const units: Array<[number, string]> = [
  [365 * 24 * 60 * 60, 'year'],
  [30 * 24 * 60 * 60, 'month'],
  [7 * 24 * 60 * 60, 'week'],
  [24 * 60 * 60, 'day'],
  [60 * 60, 'hour'],
  [60, 'minute'],
];

export function formatRelativeTime(value: string | Date, now: Date = new Date()): string {
  const timestamp = value instanceof Date ? value.getTime() : new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return 'time unknown';
  const deltaSeconds = Math.round((timestamp - now.getTime()) / 1000);
  if (Math.abs(deltaSeconds) < 45) return deltaSeconds > 0 ? 'in a moment' : 'just now';
  const future = deltaSeconds > 0;
  const elapsed = Math.abs(deltaSeconds);
  for (const [secondsPerUnit, unit] of units) {
    if (elapsed >= secondsPerUnit) {
      const amount = Math.floor(elapsed / secondsPerUnit);
      const label = `${amount} ${unit}${amount === 1 ? '' : 's'}`;
      return future ? `in ${label}` : `${label} ago`;
    }
  }
  return future ? 'in 1 minute' : '1 minute ago';
}
