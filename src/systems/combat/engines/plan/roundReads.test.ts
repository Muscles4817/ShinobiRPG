import { told } from '@/test/fightLines';
import type { CombatantSetup } from '../../contract';
import { healthNow } from './roundOpened';
import { roundReads } from './roundReads';
import { initialFighters, type PlanFighter, type PlanState } from './state';

/** What the player's fighter made of the round just played (`roundReads.ts`). */

const base: CombatantSetup['attributes'] = {
  strength: 15,
  speed: 15,
  stamina: 15,
  chakraControl: 15,
  intellect: 15,
  perception: 15,
  willpower: 15,
  taijutsu: 15,
  ninjutsu: 15,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

function table(you: Partial<CombatantSetup['attributes']> = {}): PlanState {
  const setup = (id: string, extra: Partial<CombatantSetup>): CombatantSetup => ({
    id,
    name: id,
    attributes: base,
    health: 100,
    maxHealth: 100,
    chakra: 50,
    maxChakra: 50,
    techniques: [],
    ...extra,
  });
  const fighters = initialFighters({
    player: setup('you', { called: 'you', grammar: 'you', attributes: { ...base, ...you } }),
    allies: [],
    enemies: [setup('Gōran', { grammar: 'he' })],
    canFlee: false,
  });
  return {
    phase: 'loadout',
    round: 2,
    bout: 2,
    exchange: 0,
    fighters,
    range: 'mid',
    seen: {},
    intents: {},
    story: [],
    result: null,
    canFlee: false,
    healthAtRound: healthNow(fighters),
  };
}

const change = (state: PlanState, id: string, to: Partial<PlanFighter>): PlanState => ({
  ...state,
  fighters: state.fighters.map((f) => (f.id === id ? { ...f, ...to } : f)),
});
const said = (state: PlanState) => roundReads(state).map((l) => told(l).text);

describe('reads after a round', () => {
  it('a quiet round tells nothing', () => {
    expect(roundReads(table())).toEqual([]);
  });

  it('a foe caught unready and hurt shows, surely to a keen eye', () => {
    const keen = change(table({ perception: 40 }), 'Gōran', { health: 60 });
    expect(said(keen)).toEqual(["Gōran wasn't ready for that, and it hurt."]);
    const dull = change(table({ perception: 2 }), 'Gōran', { health: 60 });
    expect(said(dull)).toEqual(['That looked like it hurt Gōran.']);
    expect(roundReads(keen).every((l) => told(l).read === true)).toBe(true);
  });

  it('the worse of it going to you shows', () => {
    const hurt = change(table(), 'you', { health: 60 });
    expect(said(hurt)).toEqual(['That round went badly for you.']);
    const keen = change(table({ perception: 40 }), 'you', { health: 60 });
    expect(said(keen)).toEqual(['You are getting the worse of this.']);
  });

  it('a keen eye feels a foe’s chakra running thin; a dull one does not', () => {
    const keen = change(table({ perception: 40 }), 'Gōran', { chakra: 5 });
    expect(said(keen).some((t) => t.includes('chakra'))).toBe(true);
    const dull = change(table({ perception: 2 }), 'Gōran', { chakra: 5 });
    expect(said(dull)).toEqual([]);
  });

  it('a duller mind makes fewer reads of a busy round', () => {
    const busy = (intellect: number) =>
      change(
        change(table({ intellect, perception: 40 }), 'Gōran', { health: 60, chakra: 5 }),
        'you',
        {
          health: 50,
        },
      );
    expect(roundReads(busy(2)).length).toBeLessThan(roundReads(busy(40)).length);
  });
});
