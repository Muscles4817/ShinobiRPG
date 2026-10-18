import { CONTENT_PACKS } from '@/content';
import { arcPlayer } from '@/test/arcPlay';
import { act, ctx } from '@/test/gameFixtures';

import { createGameContext } from './context';
import type { GameState } from './state';
import { missionScene } from './views/missionScene';

/**
 * Choices in the long stories cost something: the hasty answer closes the best ending, keeping
 * faith is paid in less money and repaid at the landing, and the conscience road of a fork pays
 * least.
 */

const naruto = createGameContext(CONTENT_PACKS.find((p) => p.id === 'naruto')!);

/** Starts a job rested and plays it up to its first encounter, taking the first choice. */
function toTheFight(start: GameState, id: string): GameState {
  const vitals = arcPlayer(ctx).ready().character.vitals;
  const rested = { ...start, character: { ...start.character, vitals } };
  let s = act(
    { ...rested, exams: { ...rested.exams, ceremony: null } },
    {
      type: 'startMission',
      missionId: id,
    },
  );
  for (let i = 0; i < 20 && s.mission && !s.mission.encounter; i++) {
    s = act(s, missionScene(s, ctx)!.choices.find((c) => !c.closed)!.action);
  }
  return s;
}

describe('the costs of the long stories', () => {
  const { ready, play, upTo } = arcPlayer(ctx);

  it('closes the ghost’s name to whoever hauled in the wrong man', () => {
    const vats = play(ready(), 'arc-brewer-sour-vats');
    const hasty = play(vats, 'arc-brewer-gravedigger', ['Accuse him of cursing the brewery']);
    const both = play(hasty, 'arc-brewer-old-hands', ['Ask what the first wife was like']);
    expect(both.village.tallies['brewer-clues']).toBe(0);
    const night = upTo(both, 'arc-brewer-ghost-night', 'Lay her');
    const name = missionScene(night, ctx)!.choices.find((c) => c.label.startsWith('Call her'));
    expect(name?.closed).toBeDefined();
  });

  it('pays less for keeping faith with the ferrymen, and brings them to the landing', () => {
    const home = play(ready(), 'arc-ford-pilot-home', [
      'Then we see it through, at the price you could pay',
    ]);
    const before = home.wallet.ryo;
    const bluff = play(home, 'arc-ford-reed-blade', [
      'Take what they promised',
      'Bind them both for the Watch',
    ]);
    expect(bluff.village.marks).toContain('ford-faith-kept');
    expect(bluff.wallet.ryo - before).toBeLessThan(
      ctx.content.missions.require('arc-ford-reed-blade').reward.ryo,
    );
    const landing = toTheFight(bluff, 'arc-ford-barons-bill');
    const stage =
      ctx.content.missions.require('arc-ford-barons-bill').stages[landing.mission!.stageIndex];
    expect(stage?.kind === 'encounter' && stage.enemyIds).toHaveLength(2);
  });
});

describe('the fork’s roads', () => {
  it('pays most for doing what the client paid for, and least for the truth', () => {
    const pay = (id: string) => naruto.content.missions.require(id).reward;
    const home = pay('arc-silk-bring-her-home');
    const lie = pay('arc-silk-word-of-death');
    const truth = pay('arc-silk-magistrate');
    expect(home.ryo).toBeGreaterThan(lie.ryo);
    expect(lie.ryo).toBeGreaterThan(truth.ryo);
    expect(truth.reputation).toBeGreaterThan(home.reputation);
  });
});
