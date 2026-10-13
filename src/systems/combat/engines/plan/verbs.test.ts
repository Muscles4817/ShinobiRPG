import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique, CombatTrait } from '../../contract';
import { createPlanEngine } from './engine';
import { useJutsu } from './jutsu';
import { resolveExchange } from './round';
import {
  encode,
  fighterIn,
  initialFighters,
  plainSlots,
  type Loadout,
  type PlanFighter,
  type PlanState,
  type Round,
} from './state';
import { splitNarration } from '../../rules/narration';

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

function technique(
  id: string,
  effects: CombatTechnique['effects'],
  discipline: CombatTechnique['discipline'] = 'taijutsu',
): CombatTechnique {
  return { id, name: id, discipline, effects, chakraCost: 4 };
}

const sweep = technique('sweep', [{ verb: 'area', power: 10 }], 'ninjutsu');
const haze = technique('haze', [{ verb: 'confuse', power: 12 }], 'genjutsu');
const veil = technique('veil', [{ verb: 'conceal', power: 10 }], 'genjutsu');
const reach = technique('reach', [{ verb: 'sense', power: 10 }], 'ninjutsu');
const smash = technique('smash', [{ verb: 'break', power: 12 }]);
const punch = technique('punch', [{ verb: 'damage', power: 12 }]);
const TECHNIQUES = [sweep, haze, veil, reach, smash, punch] as const;

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 80,
    maxHealth: 80,
    chakra: 60,
    maxChakra: 60,
    techniques: [...TECHNIQUES],
    ...overrides,
  };
}

const NO_CARDS: Loadout = { close: [], mid: [], far: [] };

interface Cast {
  readonly hero?: Partial<CombatantSetup>;
  readonly foes?: readonly Partial<CombatantSetup>[];
  readonly foeCards?: Loadout;
}

function roundOf({ hero = {}, foes = [{}], foeCards = NO_CARDS }: Cast = {}): Round {
  const fighters = initialFighters({
    player: setup('hero', hero),
    allies: [],
    enemies: foes.map((f, i) => setup(`foe${i + 1}`, { techniques: [], ...f })),
    canFlee: true,
  }).map((f) => (f.isPlayer ? f : { ...f, loadout: foeCards }));
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

/** Uses a technique with each seed in turn until the narration matches. */
function useUntil(round: Round, t: CombatTechnique, wanted: RegExp, target = 'foe1'): Round {
  const actor = fighterIn(round, 'hero')!;
  for (let seed = 1; seed < 300; seed++) {
    const turn = { actor, target: fighterIn(round, target), rng: createRng(seed) };
    const after = useJutsu(round, turn, t);
    if (after.lines.some((l) => wanted.test(l))) return after;
  }
  throw new Error(`no seed narrates ${wanted.source}`);
}

const health = (round: Round, id: string) => fighterIn(round, id)?.health ?? 0;

/** The log as the player reads it: the sentences, without the screen's markers. */
const said = (log: readonly string[]) => log.map((line) => splitNarration(line).text);

describe('plan & watch verbs: area', () => {
  it('hits every foe, hidden ones too, each reacting on their own', () => {
    const foes: Partial<CombatantSetup>[] = [{}, {}, { traits: ['illusionist'] }];
    const round = roundOf({ foes });
    expect(fighterIn(round, 'foe3')?.hidden).toBe(true);
    const after = useUntil(round, sweep, /sweep hits foe3/);
    const hitLines = after.lines.filter((l) => l.startsWith("hero's sweep hits"));
    expect(hitLines.length + after.lines.filter((l) => l.includes('sees it coming')).length).toBe(
      3,
    );
    expect(health(after, 'foe3')).toBeLessThan(80);
  });

  it('needs no one in sight to be thrown', () => {
    const round = roundOf({ foes: [{ traits: ['illusionist'] }] });
    const hero: PlanFighter = {
      ...fighterIn(round, 'hero')!,
      loadout: { ...NO_CARDS, mid: plainSlots(['jutsu:sweep']) },
    };
    const fighters = [hero, fighterIn(round, 'foe1')!];
    const state = stateOf({ ...round, range: 'mid', fighters });
    const after = resolveExchange(state, createRng(2));
    expect(said(after.log)).toContain('hero uses sweep!');
  });
});

describe('plan & watch verbs: confuse', () => {
  it('leaves the target confused, for longer than a turn when strong', () => {
    const after = useUntil(roundOf(), haze, /senses twist/);
    expect(fighterIn(after, 'foe1')?.confused).toBeGreaterThanOrEqual(2);
  });

  it('holds less long on a foe with steady chakra control', () => {
    const steady = { attributes: { ...attributes, chakraControl: 40 } };
    const loose = useUntil(roundOf(), haze, /senses twist/);
    const held = useUntil(roundOf({ foes: [steady] }), haze, /senses twist/);
    expect(fighterIn(held, 'foe1')!.confused).toBeLessThan(fighterIn(loose, 'foe1')!.confused);
  });
});

describe('plan & watch verbs: conceal', () => {
  it('hides the user, as hard to find as their genjutsu makes them', () => {
    const subtle = { attributes: { ...attributes, genjutsu: 30 } };
    const after = useUntil(roundOf({ hero: subtle }), veil, /fades from sight/);
    const hero = fighterIn(after, 'hero');
    expect(hero?.hidden).toBe(true);
    expect(hero?.concealment).toBeGreaterThan(30);
  });

  it('attacking from hiding gives the user away', () => {
    const round = roundOf();
    const hero: PlanFighter = {
      ...fighterIn(round, 'hero')!,
      hidden: true,
      concealment: 40,
      loadout: { ...NO_CARDS, close: plainSlots(['strike']) },
    };
    const after = resolveExchange(
      stateOf({ ...round, fighters: [hero, fighterIn(round, 'foe1')!] }),
      createRng(1),
    );
    expect(after.fighters[0]?.hidden).toBe(false);
  });
});

describe('plan & watch verbs: sense', () => {
  it('pulls hidden foes into the open and reads foes for the rest of the fight', () => {
    const round = roundOf({ foes: [{ traits: ['illusionist'] }, { traits: ['illusionist'] }] });
    const after = useUntil(round, reach, /can't hide/, 'none');
    expect(fighterIn(after, 'foe1')?.hidden).toBe(false);
    expect(fighterIn(after, 'foe2')?.hidden).toBe(false);
    expect(fighterIn(after, 'hero')?.perks).toContain('insight');
    const engine = createPlanEngine();
    const foeCards: Loadout = { close: plainSlots(['strike']), mid: [], far: [] };
    const fighters = after.fighters.map((f) => (f.isPlayer ? f : { ...f, loadout: foeCards }));
    const view = engine.view(encode(stateOf({ ...after, fighters })));
    expect(view.combatants.find((c) => c.id === 'foe1')?.intent).toMatch(/Close cards: Strike/);
  });
});

describe('plan & watch verbs: break', () => {
  const guarding: Loadout = { close: plainSlots(['guard']), mid: [], far: [] };
  const hurt = (t: CombatTechnique, traits: CombatTrait[] = []) => {
    const round = roundOf({ foes: [{ traits }], foeCards: guarding });
    return 80 - health(useUntil(round, t, new RegExp(`${t.name} hits`)), 'foe1');
  };

  it('smashes through a guard', () => {
    const round = roundOf({ foeCards: guarding });
    const after = useUntil(round, smash, /smashing through the guard/);
    expect(health(after, 'foe1')).toBeLessThan(80);
    expect(hurt(smash)).toBeGreaterThan(hurt(punch));
  });

  it('goes through part of an armoured foe’s plating', () => {
    expect(hurt(smash, ['armoured'])).toBeGreaterThan(hurt(punch, ['armoured']));
  });
});

describe('plan & watch: hidden fighters are found', () => {
  it('two hidden fighters do not stall each other', () => {
    const round = roundOf({
      hero: { traits: ['illusionist'], techniques: [punch] },
      foes: [{ traits: ['illusionist'], techniques: [punch] }],
    });
    const cards: Loadout = {
      close: plainSlots(['jutsu:punch', 'strike']),
      mid: plainSlots(['step-in']),
      far: plainSlots(['step-in']),
    };
    let state = stateOf({
      ...round,
      fighters: round.fighters.map((f) => ({ ...f, loadout: cards })),
    });
    const rng = createRng(5);
    for (let i = 0; i < 60 && !state.result; i++) state = resolveExchange(state, rng);
    expect(state.result).not.toBeNull();
  });
});

function stateOf(round: Round): PlanState {
  return {
    phase: 'fight',
    round: 1,
    bout: 1,
    exchange: 1,
    fighters: round.fighters,
    range: round.range,
    seen: {},
    intents: {},
    log: [],
    result: null,
    canFlee: true,
  };
}
