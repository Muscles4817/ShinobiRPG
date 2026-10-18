import { createRng } from '@/core';
import { combatLog } from '@/game';
import { createPlanEngine, type CombatSetup, type CombatState } from '@/systems/combat';
import { against, classmate, foe, freshCharacter } from '@/test/bench/content';
import { act, ctx, newGame } from '@/test/gameFixtures';

import { recorder, type Recorder } from './recorder';

/**
 * Fights as they read in their places: a spar with a teammate as the game sets it up, then
 * fights put straight to the engine on the grounds and occasions a job or a rivalry brings
 * (a rival's spar, beasts in a forest, a swarm, a fight on the water and in the streets), each
 * with the summary its result card shows.
 */

/** Exchanges after which a golden fight is cut off: enough to read, never a hang. */
const MAX_EXCHANGES = 40;

/** A fight from where it starts, watched round by round to its end, then its summary. */
function watched(r: Recorder, title: string, start: CombatState, seed: number): void {
  r.say(`\n########## ${title} ##########`);
  const engine = createPlanEngine();
  const rng = createRng(seed);
  let state = start;
  let told = 0;
  const tell = () => {
    const view = engine.view(state);
    const log = combatLog(view.log);
    const from = Math.max(0, told - (view.logOffset ?? 0));
    for (const line of log.slice(from)) {
      if (line.kind === 'round') r.say(`  —— ${line.text} ——`);
      else r.say(`  ${line.text} ${line.chips.map((c) => `[${c.label}]`).join(' ')}`.trimEnd());
    }
    told = (view.logOffset ?? 0) + log.length;
  };
  tell();
  for (let i = 0; i < MAX_EXCHANGES && !engine.outcome(state); i++) {
    const atTable = engine.view(state).options.some((o) => o.id === 'begin');
    const next = engine.act(state, { optionId: atTable ? 'begin' : 'next' }, rng);
    if (!next.ok) throw new Error(next.error);
    state = next.value;
    tell();
  }
  r.say(`  summary: ${engine.outcome(state)?.summary ?? '(unfinished)'}`);
}

function engineFight(r: Recorder, title: string, setup: CombatSetup, seed: number): void {
  watched(r, title, createPlanEngine().start(setup, createRng(seed)), seed);
}

it('reads fights in their places', async () => {
  const r = recorder(ctx);
  const game = newGame();
  const teammateId = game.people.team?.teammateIds[0] ?? '';
  const sparred = act(game, { type: 'spar', personId: teammateId });
  if (sparred.combat) watched(r, 'a spar with a teammate', sparred.combat, 2);

  const genin = freshCharacter('taijutsu');
  const rivalId = genin.rival?.personId ?? teammateId;
  const versus = (enemyIds: readonly string[]) => ({
    ...against(genin, foe(enemyIds[0] ?? '')),
    enemies: enemyIds.map((id, i) => ({ ...foe(id), id: `${id}-${i}` })),
  });
  engineFight(
    r,
    'a rival’s spar',
    { ...against(genin, classmate(genin, rivalId)), occasion: 'rival' },
    3,
  );
  engineFight(
    r,
    'wolves in a forest',
    { ...versus(['grey-wolf', 'grey-wolf']), ground: 'forest' },
    5,
  );
  engineFight(r, 'a hornet swarm', { ...versus(['hornet-swarm']), ground: 'forest' }, 7);
  engineFight(r, 'a wraith in a room', { ...versus(['storehouse-wraith']), ground: 'room' }, 11);
  engineFight(
    r,
    'bandits in the streets',
    { ...versus(['bandit-thug', 'bandit-thug']), ground: 'town' },
    13,
  );
  await expect(r.text()).toMatchFileSnapshot('./goldens/fights.txt');
});
