import { createRng } from '@/core';
import { createPlanEngine, splitNarration, type CombatView } from '@/systems/combat';

import { toSetup } from './fighters';
import { CAST_IDS, castMember } from './matrixCast';

/**
 * Shown equals told (`docs/design/event-stream-plan.md`): the watch screen folds the health each
 * line says, in order, so after every exchange the fold of the whole story is the fight as it
 * stands, and a line that says it did harm moves the health of the one it hurt on that line.
 */

const SEEDS = [1, 2, 3];
const EXCHANGES = 12;

type Health = Record<string, number>;

/** Health as the story has told it, line by line: after each line, by fighter. */
function folded(log: readonly string[]): Health[] {
  let health: Health = {};
  return log.map((line) => {
    const pools = splitNarration(line).pools ?? {};
    for (const [id, theirs] of Object.entries(pools)) {
      if (theirs.health !== undefined) health = { ...health, [id]: theirs.health };
    }
    return health;
  });
}

interface Slip {
  readonly line: string;
  readonly said: number;
  readonly moved: Health;
}

/** How much each fighter's health fell on one line. */
function fallen(before: Health, after: Health): Health {
  return Object.fromEntries(
    // Only those already told: a trimmed log's first lines have nothing before them.
    Object.entries(after).flatMap(([id, now]) => {
      const was = before[id];
      return was === undefined ? [] : [[id, was - now]];
    }),
  );
}

/**
 * Lines whose harm chip moved no one's health by that much on that line. Whose turn a line is
 * written in is not always whose hurt it tells (a trap goes off in its victim's turn), so the
 * chip is matched against everyone.
 */
function untold(view: CombatView): Slip[] {
  // The screen plays from an exchange's divider, which tells everyone in full.
  const log = view.log.slice(
    Math.max(
      0,
      view.log.findIndex((l) => l.startsWith('—')),
    ),
  );
  const after = folded(log);
  return log.flatMap((line, i): Slip[] => {
    const said = splitNarration(line);
    const harms = said.amounts.filter((a) => a.kind === 'harm').map((a) => a.amount);
    if (harms.length === 0 || i === 0) return [];
    const moved = fallen(after[i - 1] ?? {}, after[i] ?? {});
    const drops = Object.values(moved);
    const told =
      harms.every((h) => drops.includes(h)) || drops.includes(harms.reduce((a, b) => a + b, 0));
    return told ? [] : [{ line: said.text, said: harms.reduce((a, b) => a + b, 0), moved }];
  });
}

function views(a: (typeof CAST_IDS)[number], b: (typeof CAST_IDS)[number], seed: number) {
  const engine = createPlanEngine();
  const rng = createRng(seed);
  let state = engine.start(
    {
      player: toSetup(castMember(a, 'chunin'), 'player'),
      allies: [],
      enemies: [toSetup(castMember(b, 'chunin'), 'foe')],
      canFlee: false,
      watch: true,
    },
    rng,
  );
  const seen: CombatView[] = [];
  for (let i = 0; i < EXCHANGES && !engine.outcome(state); i++) {
    const begin = engine.view(state).options.some((o) => o.id === 'begin');
    const next = engine.act(state, { optionId: begin ? 'begin' : 'next' }, rng);
    if (!next.ok) throw new Error(next.error);
    state = next.value;
    seen.push(engine.view(state));
  }
  return seen;
}

const PAIRS = CAST_IDS.map((a, i) => [a, CAST_IDS[(i + 1) % CAST_IDS.length]!] as const);

describe('shown equals told', () => {
  it.each(PAIRS)('%s against %s: the story folds to the fight as it stands', (a, b) => {
    for (const seed of SEEDS) {
      for (const view of views(a, b, seed)) {
        const told = folded(view.log).at(-1) ?? {};
        for (const f of view.combatants)
          expect({ seed, [f.id]: told[f.id] }).toEqual({ seed, [f.id]: f.health });
      }
    }
  });

  it.each(PAIRS)('%s against %s: harm moves health on the line that tells it', (a, b) => {
    for (const seed of SEEDS) {
      const last = views(a, b, seed).at(-1);
      expect({ seed, slips: last ? untold(last) : [] }).toEqual({ seed, slips: [] });
    }
  });
});
