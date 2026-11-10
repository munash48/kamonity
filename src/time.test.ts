import { describe, expect, it } from 'vitest';
import { formatRelativeTime } from './time';

describe('formatRelativeTime', () => {
  const now = new Date('2026-01-01T12:00:00Z');
  it('formats minute and hour activity', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 5 * 60_000), now)).toBe('5 minutes ago');
    expect(formatRelativeTime(new Date(now.getTime() - 60 * 60_000), now)).toBe('1 hour ago');
  });
  it('formats days, weeks, months, and years', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 2 * 86400_000), now)).toBe('2 days ago');
    expect(formatRelativeTime(new Date(now.getTime() - 14 * 86400_000), now)).toBe('2 weeks ago');
    expect(formatRelativeTime(new Date(now.getTime() - 60 * 86400_000), now)).toBe('2 months ago');
    expect(formatRelativeTime(new Date(now.getTime() - 730 * 86400_000), now)).toBe('2 years ago');
  });
  it('handles recent, future, and invalid timestamps', () => {
    expect(formatRelativeTime(now, now)).toBe('just now');
    expect(formatRelativeTime(new Date(now.getTime() + 5 * 60_000), now)).toBe('in 5 minutes');
    expect(formatRelativeTime('not a date', now)).toBe('time unknown');
  });
});
