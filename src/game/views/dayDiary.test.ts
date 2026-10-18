import { act, ctx, newGame } from '@/test/gameFixtures';

import { dayEndView } from './dayEnd';
import { dayHooks } from './dayHooks';

describe('the day, as a diary', () => {
  it('heads the sheet with one sentence about the day', () => {
    const trained = act(newGame(), { type: 'train', trainingId: 'rooftop-sprints' });
    const view = dayEndView(act(trained, { type: 'sleep' }), ctx)!;
    expect(view.title).toMatch(/^You worked on your .+\.$/);
    expect(view.title).not.toMatch(/\d/);
  });

  it('reads growth towards a grade, not a rank and grade', () => {
    const trained = act(newGame(), { type: 'train', trainingId: 'rooftop-sprints' });
    const view = dayEndView(act(trained, { type: 'sleep' }), ctx)!;
    for (const row of view.growth) {
      expect(row.words).not.toMatch(/Genin|Chūnin|Jōnin|Kage/);
      expect(row.words).toMatch(/\b(a|an) [EDCBAS]\b|As high as it goes/);
    }
    for (const line of view.summary) expect(line).not.toContain(':');
  });

  it('says what the sensei has set as the plaque would, without “sets”', () => {
    for (const plaque of dayHooks(newGame(), ctx)) {
      expect(plaque.text).not.toMatch(/ sets |:/);
    }
  });
});
