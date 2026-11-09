import { createRng } from '@/core';
import { hitsOn } from '@/test/fightLines';

import type { CombatantSetup, CombatSetup } from '../../contract';
import { splitNarration, voicesOf } from '../../rules/narration';
import { createPlanEngine } from './engine';
import { told, type Bank, type Moment } from './fresh';
import { hitLine } from './hitVoice';
import { blowWord, formOf, sceneTags } from './scene';
import type { PlanFighter, Round } from './state';

const attributes = {
  strength: 5,
  speed: 5,
  stamina: 5,
  chakraControl: 5,
  intellect: 5,
  perception: 5,
  willpower: 5,
  taijutsu: 5,
  ninjutsu: 5,
  genjutsu: 5,
  kenjutsu: 5,
  fuuinjutsu: 5,
};

function fighter(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 30,
    maxChakra: 30,
    techniques: [],
    ...overrides,
  };
}

const RYO = { id: 'ryo', name: 'Ryo', grammar: 'he' } as const;
const KAI = { id: 'kai', name: 'Kai', grammar: 'she' } as const;
const BANK: Bank = {
  id: 'test',
  lines: ['{a} waits.'],
  scene: { forest: ['{a} waits among the trees.', '{a} waits by a trunk.'] },
};
const MOMENTS: readonly Moment[] = Array.from({ length: 60 }, (_, i) => ({
  key: `${i}:x`,
  recent: [],
  tags: ['forest'],
}));
const text = (line: string) => splitNarration(line).text;

/** A round in which `ryo` stands at `health` of a hundred, on `ground`, in exchange `number`. */
function roundWith(health: number, number: number, extra: Partial<Round> = {}): Round {
  const ryo = { ...RYO, health, maxHealth: 100, traits: [] } as unknown as PlanFighter;
  return { number, fighters: [ryo], range: 'mid', lines: [], seen: {}, intents: {}, ...extra };
}

/** A watched fight to its end; the player far stronger, so it ends quickly. */
function fightOut(setup: Partial<CombatSetup>, foe: CombatantSetup) {
  const engine = createPlanEngine();
  const strong = { ...attributes, strength: 30, taijutsu: 30, speed: 20 };
  let state = engine.start(
    {
      player: fighter('player', { called: 'you', grammar: 'you', attributes: strong }),
      allies: [],
      enemies: [foe],
      canFlee: false,
      watch: true,
      ...setup,
    },
    createRng(4),
  );
  const rng = createRng(5);
  for (let i = 0; i < 10 && !engine.outcome(state); i++) {
    const next = engine.act(state, { optionId: 'round' }, rng);
    if (!next.ok) throw new Error(next.error);
    state = next.value;
  }
  return engine.view(state).log;
}

describe('lines that know where they are', () => {
  it('reads the scene from the fight: the ground, the stage, a spar, someone near the end', () => {
    expect(sceneTags(roundWith(100, 1, { ground: 'forest' }), 'ryo')).toEqual([
      'forest',
      'opening',
    ]);
    expect(sceneTags(roundWith(10, 12, { occasion: 'rival' }), 'ryo')).toEqual([
      'desperate',
      'rival',
      'spar',
      'late',
    ]);
    expect(sceneTags(roundWith(100, 4, { ground: 'arena' }), 'ryo')).toEqual([]);
  });

  it('reads a long fight as tiring only for someone it has worn down', () => {
    const fresh = roundWith(100, 12);
    const at = (r: Round, change: Partial<PlanFighter>) => ({
      ...r,
      fighters: r.fighters.map((f) => ({ ...f, chakra: 100, maxChakra: 100, ...change })),
    });
    expect(sceneTags(at(fresh, {}), 'ryo')).toEqual([]);
    expect(sceneTags(at(fresh, { chakra: 20 }), 'ryo')).toEqual(['late']);
    expect(sceneTags(at(roundWith(100, 4), { chakra: 20 }), 'ryo')).toEqual([]);
  });

  it('prefers a fresh line for the scene, and falls back on the general lines', () => {
    const lines = MOMENTS.map((m) => told(m, BANK, { a: RYO }));
    const ofScene = lines.filter((l) => voicesOf(l)[0]?.startsWith('test-forest.'));
    expect(ofScene.length).toBeGreaterThan(lines.length / 2);
    expect(ofScene.length).toBeLessThan(lines.length);
    const both = BANK.scene?.forest?.map((l) => l.replace('{a}', 'Ryo')) ?? [];
    const said = both.map((l, i) => `${l} ⟦v:test-forest.${i}⟧`);
    for (const m of MOMENTS) {
      expect(text(told({ ...m, recent: said }, BANK, { a: RYO }))).toBe('Ryo waits.');
    }
  });

  it('remembers a scene’s lines longer than the general ones', () => {
    const said = ['Ryo waits among the trees. ⟦v:test-forest.0⟧', ...Array<string>(8).fill('…')];
    const lines = MOMENTS.map((m) => text(told({ ...m, earlier: said }, BANK, { a: RYO })));
    expect(lines).not.toContain('Ryo waits among the trees.');
  });

  it('calls a beast’s strike a bite, a spirit’s a touch, and lets a foe name its own', () => {
    expect(formOf({ traits: ['spirit'], grammar: 'it' })).toBe('spirit');
    expect(blowWord({ traits: [], grammar: 'it' })).toBe('bite');
    expect(blowWord({ traits: ['spirit'], grammar: 'it' })).toBe('touch');
    expect(blowWord({ traits: [], grammar: 'it', form: 'swarm' })).toBe('sting');
    expect(blowWord({ traits: [], grammar: 'it', blow: 'tusk' })).toBe('tusk');
    expect(blowWord({ traits: [], grammar: 'he' })).toBe('strike');
    const bite = { what: 'bite', kind: 'blow', physical: true } as const;
    const moment: Moment = { key: '1:1:wolf', recent: [], tags: ['beast'] };
    const hit = { attacker: RYO, target: KAI, damage: 40, maxHealth: 100 };
    const line = hitLine(moment, {
      ...hit,
      blow: bite,
      guarded: false,
      smashed: false,
      dodgeTried: false,
    });
    expect(line).toMatch(hitsOn('Kai', 'bite'));
    expect(text(line)).toMatch(/mauls|tears through|savages/);
  });

  it('ends a spar on its feet, never in the dark', () => {
    for (const occasion of ['spar', 'teammate', 'rival', 'bout'] as const) {
      const log = fightOut({ occasion }, fighter('foe', { name: 'Kai', grammar: 'she' }));
      expect(log.at(-1)).toMatch(new RegExp(`⟦v:won-${occasion}\\.`));
    }
  });

  it('tells a fight on the ground it is fought on', () => {
    const wolf = fighter('wolf', { name: 'Wolf', called: 'the wolf', grammar: 'it', health: 60 });
    const log = fightOut({ ground: 'forest' }, wolf).join('\n');
    expect(log).toMatch(/⟦v:[a-z-]+-forest\.\d⟧/);
  });
});
