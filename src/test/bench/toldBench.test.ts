import { createRng } from '@/core';
import {
  createPlanEngine,
  foldEvent,
  NO_STANDING,
  type CombatEvent,
  type CombatState,
  type CombatView,
} from '@/systems/combat';

import { toSetup } from './fighters';
import { CAST_IDS, castMember } from './matrixCast';
import { benchMinds } from './minds';
import { checkStory } from './storyCheck';

/**
 * Shown equals told (`docs/design/event-stream-plan.md`): the watch screen folds the story's
 * events in order, so after every exchange the fold of the whole story is the fight as it stands
 * (`storyCheck.ts`), and a line that says it did harm comes with the health it took: the change
 * is recorded just before the line that tells it, never after.
 */

const SEEDS = [1, 2, 3];
const EXCHANGES = 12;

interface Slip {
  readonly line: string;
  readonly said: number;
  readonly moved: readonly number[];
}

/**
 * Lines whose harm chip no health change told with them accounts for. Whose turn a line is told
 * in is not always whose hurt it tells (a trap goes off in its victim's turn), so the chip is
 * matched against every change told with it.
 */
function untold(story: readonly CombatEvent[]): Slip[] {
  let standing = NO_STANDING;
  let drops: number[] = [];
  const slips: Slip[] = [];
  for (const e of story) {
    if (e.kind === 'health') {
      const was = standing.pools[e.who]?.health;
      if (was !== undefined && was > e.to) drops.push(was - e.to);
    }
    standing = foldEvent(standing, e);
    if (e.kind !== 'told') continue;
    const harms = (e.amounts ?? []).filter((a) => a.kind === 'harm').map((a) => a.amount);
    const total = harms.reduce((a, b) => a + b, 0);
    const told = harms.every((h) => drops.includes(h)) || drops.includes(total);
    if (harms.length > 0 && !told) slips.push({ line: e.text, said: total, moved: drops });
    drops = [];
  }
  return slips;
}

function played(a: (typeof CAST_IDS)[number], b: (typeof CAST_IDS)[number], seed: number) {
  const engine = createPlanEngine();
  const rng = createRng(seed);
  let state: CombatState = engine.start(
    {
      player: toSetup(castMember(a, 'chunin'), 'player'),
      allies: [],
      enemies: [toSetup(castMember(b, 'chunin'), 'foe')],
      canFlee: false,
      watch: true,
      ...benchMinds(),
    },
    rng,
  );
  const seen: CombatView[] = [];
  for (let i = 0; i < EXCHANGES && !engine.outcome(state); i++) {
    const begin = engine.view(state).options.some((o) => o.id === 'begin');
    const next = engine.act(state, { optionId: begin ? 'begin' : 'next' }, rng);
    if (!next.ok) throw new Error(next.error);
    checkStory(next.value, state);
    state = next.value;
    seen.push(engine.view(state));
  }
  return seen;
}

const PAIRS = CAST_IDS.map((a, i) => [a, CAST_IDS[(i + 1) % CAST_IDS.length]!] as const);

describe('shown equals told', () => {
  it.each(PAIRS)('%s against %s: harm comes with the line that tells it', (a, b) => {
    for (const seed of SEEDS) {
      const last = played(a, b, seed).at(-1);
      // The kept story may start mid-exchange: read it from the first full standing.
      const story = last?.story ?? [];
      const from = Math.max(
        0,
        story.findIndex((e) => e.kind === 'stand'),
      );
      expect({ seed, slips: untold(story.slice(from)) }).toEqual({ seed, slips: [] });
    }
  });
});
