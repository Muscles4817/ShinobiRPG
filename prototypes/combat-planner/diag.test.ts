import type { RangeBand } from '@/systems/combat/contract';
import {
  plainSlots,
  type Loadout,
  type PlanFighter,
  type PlanState,
} from '@/systems/combat/engines/plan/state';
import { distanceBetween } from '@/systems/combat/engines/plan/distance';

import { plan } from './beam';
import { playExchange } from './forward';
import { burst, duel, fighter, flash, spark } from './scenarios';

/**
 * Experiment 3: why does stepping out of reach beat Lantern Flash → Lantern Burst in the
 * daze scenario? Fixed strategies played as ordinary plans through the real engine (no planner),
 * then the planner's own view of the start. Nothing here changes a rule.
 */

const FOE_KIT = process.env.FOE_SPARK ? [spark] : [];
const start = () =>
  duel(fighter('me', [spark, flash, burst], { stats: { taijutsu: 8 } }), fighter('foe', FOE_KIT));
const all = (cards: string[]): Loadout => ({
  close: plainSlots(cards),
  mid: plainSlots(cards),
  far: plainSlots(cards),
});

type Policy = { loadout?: Loadout; keepAt?: RangeBand };
const POLICIES: Record<string, Policy> = {
  'default plan': {},
  'combo up close': { loadout: all(['jutsu:burst', 'jutsu:flash', 'jutsu:spark']) },
  'spark up close': { loadout: all(['jutsu:spark']) },
  'kite, spark': { loadout: all(['jutsu:spark']), keepAt: 'mid' },
  'kite, combo': { loadout: all(['jutsu:burst', 'jutsu:flash', 'jutsu:spark']), keepAt: 'mid' },
};

function withPolicy(s: PlanState, p: Policy): PlanState {
  return {
    ...s,
    fighters: s.fighters.map((f): PlanFighter => {
      if (!f.isPlayer) return f;
      const { keepAt: _k, ...rest } = f;
      return {
        ...rest,
        ...(p.loadout ? { loadout: p.loadout } : {}),
        ...(p.keepAt ? { keepAt: p.keepAt } : {}),
      };
    }),
  };
}

const hp = (s: PlanState, id: string) => s.fighters.find((f) => f.id === id)!.health;
const ch = (s: PlanState, id: string) => s.fighters.find((f) => f.id === id)!.chakra;

function play(p: Policy, cap: number, fights: number) {
  const t = {
    won: 0,
    lost: 0,
    dealt: 0,
    taken: 0,
    ex: 0,
    atClose: 0,
    atMid: 0,
    hurtClose: 0,
    hurtMid: 0,
    dazes: 0,
    openHits: 0,
    openDamage: 0,
    chakraLeft: 0,
    stepsTried: 0,
  };
  for (let seed = 1; seed <= fights; seed++) {
    let s = withPolicy(start(), p);
    for (let n = 0; n < cap && !s.result; n++) {
      const band = distanceBetween(s, 'me', 'foe');
      const foe = s.fighters.find((f) => f.id === 'foe')!;
      const open = foe.stunned > 0 || foe.openUntil !== undefined;
      const before = { me: hp(s, 'me'), foe: hp(s, 'foe') };
      const next = playExchange(s, 50_000 + seed * 97 + n);
      const nf = next.fighters.find((f) => f.id === 'foe')!;
      if (!open && (nf.stunned > 0 || nf.openUntil !== undefined)) t.dazes++;
      const hurt = before.me - hp(next, 'me');
      if (band === 'close') {
        t.atClose++;
        t.hurtClose += hurt;
      } else {
        t.atMid++;
        t.hurtMid += hurt;
      }
      if (open) {
        t.openHits++;
        t.openDamage += before.foe - hp(next, 'foe');
      }
      s = next;
      t.ex++;
    }
    t.won += s.result === 'victory' ? 1 : 0;
    t.lost += s.result === 'defeat' ? 1 : 0;
    t.dealt += 100 - Math.max(0, hp(s, 'foe'));
    t.taken += 100 - Math.max(0, hp(s, 'me'));
    t.chakraLeft += ch(s, 'me');
  }
  const f = fights;
  return [
    `won ${((100 * t.won) / f).toFixed(0)}%`,
    `lost ${((100 * t.lost) / f).toFixed(0)}%`,
    `dealt ${(t.dealt / f).toFixed(0)}`,
    `taken ${(t.taken / f).toFixed(0)}`,
    `exchanges ${(t.ex / f).toFixed(1)}`,
    `at mid ${((100 * t.atMid) / Math.max(1, t.ex)).toFixed(0)}%`,
    `hurt/ex close ${(t.hurtClose / Math.max(1, t.atClose)).toFixed(1)} mid ${(t.hurtMid / Math.max(1, t.atMid)).toFixed(1)}`,
    `dazes/fight ${(t.dazes / f).toFixed(2)}`,
    `dmg on open foe/ex ${(t.openDamage / Math.max(1, t.openHits)).toFixed(1)}`,
    `chakra left ${(t.chakraLeft / f).toFixed(0)}`,
  ].join(', ');
}

describe('experiment 3: the daze scenario', () => {
  it('fixed strategies, through the real engine', () => {
    const me = start().fighters.find((f) => f.isPlayer)!;
    console.log(
      'default plan',
      JSON.stringify(me.loadout),
      'ready',
      JSON.stringify(me.reactions),
      'keepAt',
      me.keepAt,
      'chakra',
      me.chakra,
    );
    for (const cap of process.env.FOE_SPARK ? [30] : [8, 30]) {
      for (const [name, p] of Object.entries(POLICIES))
        console.log(`cap ${cap} | ${name}: ${play(p, cap, 300)}`);
    }
  });

  it.skipIf(!!process.env.FOE_SPARK)(
    "the planner's view of the start, by rollouts and depth",
    () => {
      for (const depth of [2, 3]) {
        for (const rollouts of [16, 80, 200]) {
          if (depth === 3 && rollouts === 200) continue;
          const p = plan(start(), 'me', { depth, width: 4, rollouts, ownHurt: 1 });
          console.log(
            `depth ${depth}, ${rollouts} rollouts:`,
            p.ranked
              .slice(0, 4)
              .map((r) => `${r.sequence.join('>')}=${r.value.toFixed(1)}`)
              .join('  '),
          );
        }
      }
    },
  );
});
