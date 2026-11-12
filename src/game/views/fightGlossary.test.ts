import { describe, expect, it } from 'vitest';

import type { CombatSetup, CombatStance } from '@/systems/combat';
import { RANGE_BANDS } from '@/systems/combat/rules/range';
import {
  initialFighters,
  type PlanFighter,
  type PlanState,
} from '@/systems/combat/engines/plan/state';
import { statusesShown } from '@/systems/combat/engines/plan/statusView';
import { AFFLICTIONS, LADDER_TOP, LADDERS, SHROUD_KINDS } from '@/systems/techniques';

import { FIGHT_GLOSSARY, fightGlossary, statusHelp } from './fightGlossary';
import { GLOSSARY_GROUPS } from './fightGlossaryTypes';

/**
 * Every status word the plan engine can put on a fighter has a glossary entry. The words are
 * made by the engine's own `statusesShown` from fighters set up to carry each state it reads
 * (conditions, lingering harms, rows, a field, what is readied, stances and marks), so a status
 * added to one of those producers shows up here without anyone listing it by hand.
 */

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 10,
  chakraControl: 10,
  intellect: 10,
  perception: 10,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 10,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

function body(id: string): CombatSetup['player'] {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 50,
    maxChakra: 50,
    techniques: [],
  };
}

const [hero, ally, bandit] = initialFighters({
  player: body('hero'),
  allies: [body('ally')],
  enemies: [body('bandit')],
  canFlee: true,
}) as [PlanFighter, PlanFighter, PlanFighter];

type Standing = Pick<PlanState, 'fighters' | 'field' | 'mark' | 'foeMark'>;

/** The words shown for one fighter changed thus, in a fight of the usual three. */
function wordsFor(
  change: Partial<PlanFighter>,
  who: PlanFighter = bandit,
  state: Partial<Standing> = {},
): string[] {
  const f: PlanFighter = { ...who, ...change };
  const fighters = [hero, ally, bandit].map((x) => (x.id === f.id ? f : x));
  return statusesShown({ fighters, ...state }, f);
}

const empowered = { techniqueId: 'power', added: {}, healthPerExchange: 0 };
const steps = LADDERS.flatMap((ladder) =>
  Array.from({ length: LADDER_TOP[ladder] }, (_, i) => ({ ladder, step: i + 1 })),
);
const stances: readonly CombatStance[] = [
  { kind: 'press' },
  { kind: 'support' },
  { kind: 'hold' },
  { kind: 'cover', covers: 'hero' },
  { kind: 'cover', covers: 'bandit' },
];

/** Every status the engine can show, each made by the engine itself. */
function everyStatus(): string[] {
  const all = [
    wordsFor({ hidden: true, confused: 1, stunned: 1, sealed: 1 }),
    statusesShown(
      {
        fighters: [
          { ...hero, perks: ['all-seeing'] },
          { ...bandit, hidden: true },
        ],
      },
      { ...bandit, hidden: true },
    ),
    wordsFor({
      pinned: 1,
      afflictions: AFFLICTIONS.map((harm) => ({ harm, perExchange: 1, exchanges: 1 })),
      riposte: { name: 'Answer', discipline: 'taijutsu', power: 1, until: 1 },
    }),
    wordsFor({ row: 'back' }, ally),
    wordsFor({ attributes: { ...attributes, perception: 1 } }, bandit, {
      field: { id: 'mist', side: 'player', potency: 50, until: 5, exchanges: 4 },
    }),
    wordsFor({ meditating: { techniqueId: 'still', health: 100 }, empowered, perched: ['toad'] }),
    ...steps.map((opened) => wordsFor({ empowered: { ...empowered, opened } })),
    ...SHROUD_KINDS.map((kind) => wordsFor({ shroud: { kind } })),
    wordsFor({ clones: { techniqueId: 'clone', count: 3, skill: 10, strikes: false } }),
    ...RANGE_BANDS.map((band) =>
      wordsFor({ trap: { techniqueId: 'trap', band, setOn: 1, craft: 10 } }),
    ),
    ...stances.map((stance) => wordsFor({ stance }, ally)),
    wordsFor({}, bandit, { mark: 'bandit', foeMark: 'bandit' }),
    wordsFor({ health: 0 }),
  ];
  return [...new Set(all.flat())];
}

describe('the fight glossary', () => {
  const statuses = everyStatus();

  it('finds a fair spread of the engine’s statuses to check', () => {
    expect(statuses).toEqual(
      expect.arrayContaining(['Dazed', 'Hidden, but you see them', 'Clones ×3', 'Down']),
    );
    expect(statuses.length).toBeGreaterThan(35);
  });

  it.each(statuses)('explains "%s"', (status) => {
    expect(statusHelp(status)).not.toBeNull();
  });

  it('keeps no status entry the engine never shows', () => {
    const shown = new Set(statuses.map((s) => statusHelp(s)?.entryId));
    const stale = FIGHT_GLOSSARY.filter(
      (e) => ['conditions', 'readied', 'team'].includes(e.group) && !shown.has(e.id),
    );
    expect(stale.map((e) => e.name)).toEqual([]);
  });

  it('matches counted and named statuses by pattern', () => {
    expect(statusHelp('Clones ×12')?.entryId).toBe('clones');
    expect(statusHelp('Covering Aki')?.entryId).toBe('covering');
    expect(statusHelp('Trap at far range')?.entryId).toBe('trap');
    expect(statusHelp('Eighth gate open')?.entryId).toBe('gate-open');
    expect(statusHelp('Something new')).toBeNull();
  });

  it('gives every entry a unique id, a rule and an answer, in words alone', () => {
    const ids = FIGHT_GLOSSARY.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const e of FIGHT_GLOSSARY) {
      expect(e.rule.length, e.name).toBeGreaterThan(10);
      expect(e.counter.length, e.name).toBeGreaterThan(10);
      expect(`${e.rule} ${e.counter}`, e.name).not.toMatch(/\d/);
    }
  });

  it('lists every entry once on the sheet, by group, with every card kind of a plan', () => {
    const sheet = fightGlossary();
    expect(sheet.map((s) => s.group)).toEqual([...GLOSSARY_GROUPS]);
    expect(sheet.flatMap((s) => s.entries)).toHaveLength(FIGHT_GLOSSARY.length);
    const names = sheet.flatMap((s) => s.entries.map((e) => e.name));
    for (const card of ['Guard', 'Dodge', 'Counter', 'Evade', 'Brace', 'Gather', 'Search']) {
      expect(names).toContain(card);
    }
    for (const card of ['Dispel', 'Substitution', 'Close in', 'Hold off', 'Fight at']) {
      expect(names).toContain(card);
    }
  });
});
