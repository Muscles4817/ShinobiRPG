import { describe, expect, it } from 'vitest';

import { buildLine, buildStamp } from './buildStamp';

describe('the build stamp', () => {
  it('reads the commit and day Vite stamped in', () => {
    const stamp = buildStamp();
    expect(stamp.commit.length).toBeGreaterThan(0);
    expect(stamp.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('says a build in words', () => {
    expect(buildLine({ commit: '1a2b3c4', date: '2026-11-18' })).toBe(
      'Build 1a2b3c4, made 18 November 2026',
    );
  });

  it('says only the commit when the day is missing', () => {
    expect(buildLine({ commit: 'dev', date: '' })).toBe('Build dev');
  });
});
