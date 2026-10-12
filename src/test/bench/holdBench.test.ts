import { plainAtGrade, plainFighter } from './archetypes';
import { techniques, type BenchLoadout, type FighterSpec } from './fighters';
import { bench, summarise, usedIn, type BenchReport } from './runner';

/**
 * Trumps and holds in the default plan (the polish pass after Phase 5). A trump card waits for
 * the last ditch (below a third of health) or goes first against a far stronger foe, and foes
 * keep theirs the same way. A seal or a confusion is slotted only to spoil a telegraphed jutsu,
 * behind the fighter's best wounding jutsu: played ahead of it, a hold costs a turn a blow
 * would have used better, and the bench shows it. `VITE_BENCH_REPORT=true` prints every
 * measurement.
 */

const REPORT = import.meta.env.VITE_BENCH_REPORT === 'true';
const SEEDS = 80;
/** "Most fights". */
const MOST = 0.5;

function head(player: FighterSpec, opponent: FighterSpec, watch?: string): BenchReport {
  const report = bench(player, opponent, SEEDS);
  if (REPORT) {
    const use = watch ? `, ${watch} in ${Math.round(usedIn(report, watch) * 100)}%` : '';
    console.warn(`${summarise(player, opponent, report)}${use}`);
  }
  return report;
}

function knowing(fighter: FighterSpec, ids: readonly string[]): FighterSpec {
  return {
    ...fighter,
    name: `${fighter.name} with ${ids.join(' and ')}`,
    techniques: [...fighter.techniques, ...techniques(ids)],
  };
}

/** A blade trump: it reaches where a plain fighter fights, up close. */
const TRUMP = 'last-light-of-the-forge';

describe('trump cards in the default plan', () => {
  it('a trump kept for the last ditch is played in most fights and wins more of them', () => {
    const plain = plainAtGrade('D');
    const without = head(plain, plain);
    const withTrump = head(knowing(plain, [TRUMP]), plain, TRUMP);
    expect(usedIn(withTrump, TRUMP)).toBeGreaterThan(MOST);
    expect(withTrump.winRate).toBeGreaterThan(without.winRate);
  });

  it('against a far stronger foe the trump is not saved for a last ditch that never comes', () => {
    // Half again as strong: one or two blows end the fight, so there is no last ditch to wait
    // for. (It still loses: lethality is steep, and a trump is not a grade.)
    const stronger = plainFighter(15);
    const withTrump = head(knowing(plainAtGrade('D'), [TRUMP]), stronger, TRUMP);
    expect(usedIn(withTrump, TRUMP)).toBeGreaterThan(0.9);
  });

  it('a foe keeps their trump back too, plays it in most fights and wins more', () => {
    const plain = plainAtGrade('D');
    const without = head(plain, plain);
    const report = head(plain, knowing(plain, [TRUMP]));
    expect(usedIn(report, TRUMP, 'foes')).toBeGreaterThan(MOST);
    expect(report.winRate).toBeLessThan(without.winRate);
  });
});

describe('seals and confusion in the default plan', () => {
  const caster = knowing(plainAtGrade('D'), ['ember-breath']);
  const SEAL = 'binding-ward';

  it('a seal waits behind the best jutsu: sealing first costs more fights than it saves', () => {
    const sealer = knowing(caster, [SEAL]);
    const asPlanned = head(sealer, caster, SEAL);
    const first: BenchLoadout = {
      close: ['step-back', `jutsu:${SEAL}`, 'strike', 'guard'],
      mid: [`jutsu:${SEAL}`, 'jutsu:ember-breath', 'throw', 'guard'],
      far: [`jutsu:${SEAL}`, 'jutsu:ember-breath', 'throw', 'guard'],
    };
    const sealingFirst = head({ ...sealer, name: 'Sealing first', plan: first }, caster, SEAL);
    expect(usedIn(sealingFirst, SEAL)).toBeGreaterThan(MOST);
    expect(asPlanned.winRate).toBeGreaterThan(sealingFirst.winRate);
  });

  it('a hold against a foe with no jutsu takes no slot: knowing it costs nothing', () => {
    const plain = plainAtGrade('D');
    const without = head(plain, plain);
    const confuser = head(knowing(plain, ['moth-dance']), plain, 'moth-dance');
    expect(confuser.winRate).toBe(without.winRate);
    expect(usedIn(confuser, 'moth-dance')).toBe(0);
  });
});
