import { encounterFlavour, flavourChoices, type EncounterStage } from '@/systems/missions';
import { NOTHING_TOLD } from '@/systems/telling';
import { ctx } from '@/test/gameFixtures';

import { drawFlavour } from './encounter/flavour';

/** Encounters read a different way from one job to the next, as their job and ground allow. */

const camp = ctx.content.encounters.require('bandit-camp');
const stage = (over: Partial<EncounterStage> = {}): EncounterStage => ({
  kind: 'encounter',
  text: 'Men on the road.',
  template: 'bandit-camp',
  enemyIds: ['bandit-thug'],
  canFlee: true,
  job: 'escort',
  ...over,
});

describe('encounter flavour', () => {
  it('offers only the sets that fit the job and the ground', () => {
    const onRoad = flavourChoices(stage(), camp);
    const inTown = flavourChoices(stage({ job: 'eliminate', ground: 'town' }), camp);
    expect(onRoad[0]).toBe(-1);
    expect(onRoad.length).toBeGreaterThan(1);
    for (const set of onRoad.slice(1)) {
      expect(camp.variants?.[set]?.jobs ?? ['escort']).toContain('escort');
    }
    expect(inTown).not.toEqual(onRoad);
  });

  it('never meets the same camp twice running', () => {
    let told = NOTHING_TOLD;
    let last: number | null = null;
    for (const day of [1, 2, 3, 4, 5, 6]) {
      const drawn = drawFlavour(told, { stage: stage(), template: camp }, `day ${day}`);
      expect(drawn.set).not.toBe(last);
      last = drawn.set;
      told = drawn.told;
    }
  });

  it('lets a stage’s own lines win over the set drawn', () => {
    const own = stage({ flavour: { terrain: 'A chain across the road.' } });
    const [, set] = flavourChoices(own, camp);
    expect(encounterFlavour(own, camp, set).terrain).toBe('A chain across the road.');
    expect(encounterFlavour(own, camp, set).slipped).toBe(
      camp.variants?.[set ?? 0]?.flavour.slipped,
    );
  });
});
