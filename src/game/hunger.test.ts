import { ctx, newGame } from '@/test/gameFixtures';

import { playerCombatant } from './combatants';
import { blockerFor } from './dispatch';
import { studyPointsFor, trainingScale } from './profile';
import type { GameState } from './state';
import { headerView } from './views/header';

function withSatiety(satiety: number): GameState {
  const state = newGame();
  const { vitals } = state.character;
  return { ...state, character: { ...state.character, vitals: { ...vitals, satiety } } };
}

const satisfied = withSatiety(80);
const hungry = withSatiety(15);
const starving = withSatiety(0);

describe('hunger', () => {
  it('shows as a hunger meter that fills as you get hungrier', () => {
    const meter = headerView(satisfied, ctx).meters.find((m) => m.label === 'Hunger');
    expect(meter).toMatchObject({ value: 20, max: 100, level: 'satisfied' });
    expect(headerView(satisfied, ctx).hunger).toBeNull();
  });

  it('a little hunger slows training a little', () => {
    const peckish = withSatiety(40);
    const ratio =
      (trainingScale(peckish.character, ctx).strength ?? 1) /
      (trainingScale(satisfied.character, ctx).strength ?? 1);
    expect(ratio).toBeCloseTo(0.9);
    expect(headerView(peckish, ctx).hunger?.label).toBe('Peckish');
  });

  it('being hungry slows training and study, and weakens you in fights', () => {
    const training =
      (trainingScale(hungry.character, ctx).strength ?? 1) /
      (trainingScale(satisfied.character, ctx).strength ?? 1);
    expect(training).toBeCloseTo(0.6);
    const scroll = ctx.content.techniques.require('gale-heel');
    expect(studyPointsFor(hungry.character, scroll, ctx)).toBeCloseTo(
      studyPointsFor(satisfied.character, scroll, ctx) * 0.75,
      0,
    );
    const strong = playerCombatant(satisfied, ctx).attributes.strength;
    expect(playerCombatant(hungry, ctx).attributes.strength).toBeCloseTo(strong * 0.85, 0);
    expect(headerView(hungry, ctx).hunger?.effects.map((e) => e.label)).toEqual([
      'All training 40% slower',
      'All techniques learned 25% slower',
      '15% weaker in fights',
    ]);
  });

  it('starving leaves you too weak for hard work until you eat', () => {
    const weak = 'Too weak from hunger. Eat something first.';
    const drill = ctx.content.training.all[0]!.id;
    expect(blockerFor(starving, { type: 'train', trainingId: drill }, ctx)).toBe(weak);
    expect(blockerFor(starving, { type: 'startMission', missionId: 'lantern-patrol' }, ctx)).toBe(
      weak,
    );
    expect(blockerFor(starving, { type: 'spar', personId: 'kaen' }, ctx)).toBe(weak);
    expect(blockerFor(starving, { type: 'eat', foodId: 'rice-ball' }, ctx)).toBeNull();
    expect(headerView(starving, ctx).hunger).toMatchObject({
      label: 'Starving',
      level: 'starving',
    });
  });
});
