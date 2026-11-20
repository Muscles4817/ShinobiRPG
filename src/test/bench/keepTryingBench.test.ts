import type { BenchLoadout, FighterSpec } from './fighters';
import { castMember } from './matrixCast';
import { benchSkirmish } from './runner';

/**
 * How hard to keep trying to get where you fight is a real choice only if each way is the best in
 * some matchup (`engines/plan/keepTrying.ts`). Each matchup below is fought with each way, and
 * the way it is meant to show wins it, or ties the best (a few points either way).
 */

const WAYS = ['odds', 'always', 'clear'] as const;
type Way = (typeof WAYS)[number];
const SEEDS = 24;
/** Within this much of the best win rate counts as as good. */
const TIE = 0.05;
const BENCH_TIMEOUT = 600_000;

interface Matchup {
  readonly name: string;
  readonly you: FighterSpec;
  readonly foe: FighterSpec;
  /** A plan with somewhere to get to (`keepAt`), as the engine remembers one. */
  readonly plan: object;
  /** The way this matchup shows to be worth choosing. */
  readonly shows: Way;
}

const MATCHUPS: readonly Matchup[] = [
  {
    name: 'a brawler with nothing to do anywhere else keeps trying',
    you: castMember('rusher', 'chunin'),
    foe: castMember('areaCaster', 'chunin'),
    plan: {
      close: ['jutsu:crescent-drop', 'jutsu:gale-heel', 'strike'],
      mid: ['throw'],
      far: ['throw'],
      keepAt: 'close',
    },
    shows: 'always',
  },
  {
    name: 'a caster a fast blade punishes for stepping does better waiting for a clear way',
    you: castMember('versatile', 'chunin'),
    foe: castMember('mistBlade', 'chunin'),
    plan: {
      close: ['jutsu:lantern-cut', 'strike'],
      mid: ['jutsu:ember-breath', 'jutsu:tide-lash', 'throw'],
      far: ['jutsu:ember-breath', 'jutsu:tide-lash', 'throw'],
      keepAt: 'far',
    },
    shows: 'clear',
  },
  {
    name: 'an illusionist goes while the odds are fair',
    you: castMember('illusionist', 'chunin'),
    foe: castMember('rusher', 'chunin'),
    plan: {
      close: ['jutsu:whispering-dread', 'strike'],
      mid: ['jutsu:whispering-dread', 'jutsu:ember-breath'],
      far: ['jutsu:ember-breath', 'jutsu:lantern-mirage'],
      keepAt: 'far',
    },
    shows: 'odds',
  },
];

function winRate(m: Matchup, way: Way): number {
  // The bench's loadout type knows only slots; the engine reads the rest of a remembered plan.
  const plan = { ...m.plan, keepTrying: way } as BenchLoadout;
  const skirmish = {
    player: { ...m.you, plan },
    allies: [],
    foes: [m.foe],
    context: { opening: { range: 'mid' as const } },
  };
  return benchSkirmish(skirmish, SEEDS).winRate;
}

describe('how hard to keep trying', () => {
  it.each(MATCHUPS)(
    '$name',
    (m) => {
      const rates = Object.fromEntries(WAYS.map((way) => [way, winRate(m, way)]));
      const best = Math.max(...Object.values(rates));
      expect({ rates, shows: m.shows, best: (rates[m.shows] ?? 0) >= best - TIE }).toMatchObject({
        best: true,
      });
    },
    BENCH_TIMEOUT,
  );
});
