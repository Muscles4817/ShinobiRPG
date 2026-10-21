import { createRng } from '@/core';

import { GUARDED, SEES_IT_COMING, SLIPS, dazes, hitsOn } from '@/test/fightLines';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { splitNarration } from '../../rules/narration';
import { UNSTABLE_MISFIRE } from '../../rules/unstable';
import { chooseCard } from './choose';
import { useJutsu } from './jutsu';
import { shroudsAfter } from './shrouds';
import { canDaze, isDazed, wearOffDaze } from './daze';
import { fighterIn, initialFighters, plainSlots, type PlanFighter, type Round } from './state';

const attributes = {
  strength: 5,
  speed: 5,
  stamina: 20,
  chakraControl: 5,
  intellect: 5,
  perception: 5,
  willpower: 5,
  taijutsu: 30,
  ninjutsu: 5,
  genjutsu: 5,
  kenjutsu: 5,
  fuuinjutsu: 5,
};

/** Hits, then dazes what it hit. */
const crush: CombatTechnique = {
  id: 'crush',
  name: 'Crush',
  discipline: 'taijutsu',
  effects: [
    { verb: 'damage', power: 10 },
    { verb: 'daze', power: 6 },
  ],
  chakraCost: 6,
};

/** A plain hit, to finish a dazed foe with. */
const jab: CombatTechnique = {
  id: 'jab',
  name: 'Jab',
  discipline: 'taijutsu',
  effects: [{ verb: 'damage', power: 8 }],
  chakraCost: 2,
};

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 80,
    maxHealth: 80,
    chakra: 30,
    maxChakra: 30,
    techniques: [crush],
    ...overrides,
  };
}

function roundWith(target: Partial<CombatantSetup> = {}, loadout?: PlanFighter['loadout']) {
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [],
    enemies: [setup('bandit', { techniques: [], ...target })],
    canFlee: true,
  }).map((f) => (loadout && f.id === 'bandit' ? { ...f, loadout } : f));
  const round: Round = {
    number: 1,
    fighters,
    range: 'close',
    lines: [],
    seen: {},
    intents: {},
  };
  return round;
}

/** The bandit keeps one defence ready at every distance. */
function readyWith(target: Partial<CombatantSetup>, kept: string): Round {
  const round = roundWith(target);
  const reactions = { close: kept, mid: kept, far: kept };
  return {
    ...round,
    fighters: round.fighters.map((f) => (f.id === 'bandit' ? { ...f, reactions } : f)),
  };
}

/** Crush moulded with chakra rather than thrown as a body move (`rules/breath.ts`). */
const chakraCrush: CombatTechnique = { ...crush, id: 'chakra-crush', discipline: 'ninjutsu' };

/** Uses Crush with each seed in turn until the narration matches. */
function crushUntil(round: Round, wanted: RegExp, technique = crush): Round {
  for (let seed = 1; seed < 200; seed++) {
    const [actor, target] = round.fighters;
    const after = useJutsu(round, { actor: actor!, target, rng: createRng(seed) }, technique);
    if (after.lines.some((l) => wanted.test(l))) return after;
  }
  throw new Error(`no seed narrates ${wanted.source}`);
}

describe('plan & watch techniques', () => {
  it('apply their effects in order: the blow lands, then the daze', () => {
    const after = crushUntil(roundWith(), hitsOn('bandit'));
    const bandit = fighterIn(after, 'bandit');
    expect(bandit?.health).toBeLessThan(80);
    expect(bandit?.stunned).toBe(1);
    const hitAt = after.lines.findIndex((l) => hitsOn('bandit').test(l));
    expect(hitAt).toBeGreaterThan(-1);
    expect(hitAt).toBeLessThan(after.lines.findIndex((l) => dazes('bandit').test(l)));
  });

  it('a daze leaves the target open until the dazer has had another turn', () => {
    const after = crushUntil(roundWith(), /bandit is dazed/i);
    const bandit = fighterIn(after, 'bandit')!;
    expect(bandit.openUntil).toBe(after.number + 1);
    // The lost turn spends the daze, but the target is still reeling…
    const spent = { ...bandit, stunned: 0 };
    expect(isDazed(spent)).toBe(true);
    expect(isDazed(wearOffDaze(spent, after.number))).toBe(true);
    // …until the end of the next exchange.
    expect(isDazed(wearOffDaze(spent, after.number + 1))).toBe(false);
    // So a finisher still comes for them on the next turn, every time.
    const [hero] = after.fighters;
    const finishing = {
      ...hero!,
      techniques: [jab],
      loadout: { close: plainSlots(['strike', 'jutsu:jab']), mid: [], far: [] },
    };
    for (let seed = 1; seed <= 20; seed++) {
      const card = chooseCard(finishing, { band: 'close', foe: spent }, createRng(seed));
      expect(card).toEqual({ kind: 'jutsu', technique: jab });
    }
  });

  it('a daze can’t be chained: the target is steady for an exchange after it wears off', () => {
    const after = crushUntil(roundWith(), /bandit is dazed/i);
    const bandit = fighterIn(after, 'bandit')!;
    expect(canDaze(bandit, after.number + 1)).toBe(false);
    const recovered = wearOffDaze({ ...bandit, stunned: 0 }, after.number + 1);
    expect(isDazed(recovered)).toBe(false);
    expect(canDaze(recovered, after.number + 2)).toBe(false);
    expect(canDaze(recovered, after.number + 3)).toBe(true);
    const steady = {
      ...after,
      number: after.number + 2,
      fighters: after.fighters.map((f) => (f.id === 'bandit' ? recovered : f)),
    };
    const again = crushUntil(steady, /shakes it off/);
    expect(fighterIn(again, 'bandit')?.stunned).toBe(0);
  });

  it('a dazed fighter can still guard, but not dodge', () => {
    const nimble = { attributes: { ...attributes, speed: 60 }, traits: ['swift' as const] };
    const reel = (round: Round): Round => ({
      ...round,
      fighters: round.fighters.map((f) =>
        f.id === 'bandit' ? { ...f, stunned: 1, openUntil: 2 } : f,
      ),
    });
    for (const kept of ['dodge', 'guard'] as const) {
      const reeling = reel(readyWith(nimble, kept));
      const [hero, bandit] = reeling.fighters;
      for (let seed = 1; seed <= 30; seed++) {
        const after = useJutsu(
          reeling,
          { actor: hero!, target: bandit, rng: createRng(seed) },
          jab,
        );
        const told = after.lines.join(' ');
        expect(told).not.toMatch(SLIPS);
        if (kept === 'guard' && hitsOn('bandit').test(told)) expect(told).toMatch(GUARDED);
      }
    }
  });

  it('stamp the defence that reacted, so the screen can show it', () => {
    const stamps = (kept: 'dodge' | 'guard') => {
      const round = readyWith({}, kept);
      const [hero, bandit] = round.fighters;
      return Array.from({ length: 40 }, (_, seed) =>
        useJutsu(round, { actor: hero!, target: bandit, rng: createRng(seed + 1) }, jab).lines.map(
          (l) => splitNarration(l).reactions,
        ),
      ).flat();
    };
    expect(stamps('dodge')).toContainEqual(['dodged']);
    expect(stamps('dodge')).toContainEqual(['dodge-missed']);
    expect(stamps('guard')).toContainEqual(['guarded']);
  });

  it('add what they cost to the chakra spent in the fight, hit or miss', () => {
    const once = crushUntil(roundWith(), hitsOn('bandit'), chakraCrush);
    expect(fighterIn(once, 'hero')).toMatchObject({ chakra: 24, chakraSpent: 6 });
    const [hero, bandit] = once.fighters;
    const twice = useJutsu(once, { actor: hero!, target: bandit, rng: createRng(3) }, chakraCrush);
    expect(fighterIn(twice, 'hero')).toMatchObject({ chakra: 18, chakraSpent: 12 });
    expect(fighterIn(twice, 'bandit')?.chakraSpent).toBeUndefined();
  });

  it('miss entirely when the target sees them coming', () => {
    const watchful = { attributes: { ...attributes, perception: 60 } };
    const after = crushUntil(roundWith(watchful), SEES_IT_COMING);
    expect(fighterIn(after, 'bandit')).toMatchObject({ health: 80, stunned: 0 });
  });

  it('a daze that lands may still be shaken off, more often by the hardy', () => {
    const shaken = (stamina: number) =>
      Array.from({ length: 60 }, (_, seed) => {
        const round = roundWith({ attributes: { ...attributes, stamina } });
        const [hero, bandit] = round.fighters;
        return useJutsu(round, { actor: hero!, target: bandit, rng: createRng(seed + 1) }, crush);
      }).filter((r) => r.lines.some((l) => l.includes('shakes it off'))).length;
    const hardy = crushUntil(roundWith({ attributes: { ...attributes, stamina: 60 } }), /shakes/);
    // It landed (the blow hurt) but the daze didn't take.
    expect(fighterIn(hardy, 'bandit')).toMatchObject({ stunned: 0 });
    expect(fighterIn(hardy, 'bandit')!.health).toBeLessThan(80);
    expect(shaken(60)).toBeGreaterThan(shaken(attributes.stamina));
  });

  it('stop at a slipped blow: what follows it misses too', () => {
    const nimble = { attributes: { ...attributes, speed: 60 }, traits: ['swift' as const] };
    const dodging = { close: plainSlots(['dodge']), mid: [], far: [] };
    const after = crushUntil(roundWith(nimble, dodging), SLIPS);
    expect(fighterIn(after, 'bandit')).toMatchObject({ health: 80, stunned: 0 });
    expect(after.lines.join(' ')).not.toMatch(/dazed/);
  });

  it('an unstable technique costs more and sometimes comes apart, chakra spent', () => {
    const shaky: CombatTechnique = { ...chakraCrush, unstable: true };
    const round = roundWith();
    const [hero, bandit] = round.fighters;
    const SEEDS = 400;
    let misfires = 0;
    for (let seed = 1; seed <= SEEDS; seed++) {
      const after = useJutsu(round, { actor: hero!, target: bandit, rng: createRng(seed) }, shaky);
      expect(fighterIn(after, 'hero')?.chakra).toBe(30 - 8);
      if (after.lines.some((l) => l.includes('comes apart'))) {
        misfires++;
        expect(fighterIn(after, 'bandit')).toMatchObject({ health: 80, stunned: 0 });
      }
    }
    expect(misfires / SEEDS).toBeGreaterThan(UNSTABLE_MISFIRE - 0.06);
    expect(misfires / SEEDS).toBeLessThan(UNSTABLE_MISFIRE + 0.06);
    for (let seed = 1; seed <= 50; seed++) {
      const after = useJutsu(round, { actor: hero!, target: bandit, rng: createRng(seed) }, crush);
      expect(after.lines.join(' ')).not.toMatch(/comes apart/);
    }
  });
});

describe('cast armour in a planned fight', () => {
  const sandShell: CombatTechnique = {
    id: 'sand-shell',
    name: 'Sand Shell',
    discipline: 'ninjutsu',
    effects: [{ verb: 'shroud', power: 10, kind: 'sand' }],
    chakraCost: 6,
  };

  function shrouded(): Round {
    const round = roundWith();
    const hero = fighterIn(round, 'hero')!;
    return useJutsu(round, { actor: hero, target: undefined, rng: createRng(1) }, sandShell);
  }

  it('raises the armour on its caster, once', () => {
    const raised = shrouded();
    expect(fighterIn(raised, 'hero')?.shroud?.kind).toBe('sand');
    const hero = fighterIn(raised, 'hero')!;
    const again = useJutsu(
      raised,
      { actor: hero, target: undefined, rng: createRng(2) },
      sandShell,
    );
    expect(again.lines.join(' ')).toContain('already armoured');
  });

  it('turns a blow that would have hurt more', () => {
    const bare = roundWith({ techniques: [jab] });
    const covered = shrouded();
    const hit = (round: Round) => {
      const bandit = fighterIn(round, 'bandit')!;
      const target = fighterIn(round, 'hero')!;
      const after = useJutsu(
        round,
        { actor: { ...bandit, techniques: [jab] }, target, rng: createRng(3) },
        jab,
      );
      return target.health - (fighterIn(after, 'hero')?.health ?? 0);
    };
    expect(hit(covered)).toBeLessThan(hit(bare));
  });

  it('is paid for as each exchange ends, and falls when the chakra runs out', () => {
    const raised = shrouded();
    const chakra = fighterIn(raised, 'hero')!.chakra;
    const paid = shroudsAfter(raised);
    expect(fighterIn(paid, 'hero')!.chakra).toBeLessThan(chakra);
    const dry = {
      ...raised,
      fighters: raised.fighters.map((f) => (f.id === 'hero' ? { ...f, chakra: 0 } : f)),
    };
    const fallen = shroudsAfter(dry);
    expect(fighterIn(fallen, 'hero')?.shroud).toBeUndefined();
    expect(fallen.lines.join(' ')).toContain('sand armour runs off');
  });
});
