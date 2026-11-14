import { INSTINCT_WHYS, PLAN_WHYS, TURN_WHYS, type Decision, type Why } from '@/systems/combat';

import { castMember, type CastId } from './matrixCast';
import { tracedSkirmish } from './runner';

/**
 * Today's AI, read back from its decision log (`decisionLog.ts`): for a cast of matched fights,
 * how often each reason chose a move, for whom, and by plan or instinct. The baseline the
 * objective-driven planner is measured against (`docs/design/combat-ai-plan.md` Part 13).
 */

export const EVERY_WHY: readonly Why[] = [...PLAN_WHYS, ...INSTINCT_WHYS, ...TURN_WHYS];

/** Counts of each reason, by who decided: the player's side or the foes. */
export interface Tally {
  readonly fights: number;
  readonly turns: Readonly<Record<'player' | 'enemy', Readonly<Partial<Record<Why, number>>>>>;
  /** A foe's announcements, by reason, and how many of them were played as announced. */
  readonly announced: Readonly<Partial<Record<Why, number>>>;
  readonly kept: number;
  readonly announcements: number;
}

function sideOf(decision: Decision): 'player' | 'enemy' {
  return decision.fighterId === 'player' || decision.fighterId.startsWith('ally')
    ? 'player'
    : 'enemy';
}

function counted<K extends string>(into: Partial<Record<K, number>>, key: K) {
  return { ...into, [key]: (into[key] ?? 0) + 1 };
}

/** Folds one fight's decisions into a tally. */
export function tallied(tally: Tally, decisions: readonly Decision[]): Tally {
  return decisions.reduce<Tally>((t, d) => {
    if (d.phase === 'announce') {
      return { ...t, announced: counted(t.announced, d.why), announcements: t.announcements + 1 };
    }
    const side = sideOf(d);
    const turns = { ...t.turns, [side]: counted(t.turns[side], d.why) };
    return { ...t, turns, kept: t.kept + (d.why === 'announced' ? 1 : 0) };
  }, tally);
}

export const EMPTY_TALLY: Tally = {
  fights: 0,
  turns: { player: {}, enemy: {} },
  announced: {},
  kept: 0,
  announcements: 0,
};

/** Every ordered pair of the cast at one scale, watched (both sides by judgement), traced. */
export function castTally(cast: readonly CastId[], seeds: number): Tally {
  let tally = EMPTY_TALLY;
  for (const a of cast) {
    for (const b of cast) {
      for (let seed = 1; seed <= seeds; seed++) {
        const player = castMember(a, 'chunin');
        const foes = [castMember(b, 'chunin')];
        const { decisions } = tracedSkirmish({ player, allies: [], foes, watch: true }, seed);
        tally = { ...tallied(tally, decisions), fights: tally.fights + 1 };
      }
    }
  }
  return tally;
}

/** A tally as a Markdown table: each reason's share of each side's turns and announcements. */
export function tallyTable(tally: Tally): string {
  const share = (n: number | undefined, of: number) =>
    of === 0 || n === undefined ? '' : `${((100 * n) / of).toFixed(1)}%`;
  const total = (counts: Partial<Record<Why, number>>) =>
    Object.values(counts).reduce((sum, n) => sum + n, 0);
  const ofPlayer = total(tally.turns.player);
  const ofEnemy = total(tally.turns.enemy);
  const ofAnnounced = total(tally.announced);
  const seen = (w: Why) =>
    [tally.turns.player[w], tally.turns.enemy[w], tally.announced[w]].some((n) => n !== undefined);
  const rows = EVERY_WHY.filter(seen).map(
    (w) =>
      `| ${w} | ${share(tally.turns.player[w], ofPlayer)} | ${share(tally.turns.enemy[w], ofEnemy)} | ${share(tally.announced[w], ofAnnounced)} |`,
  );
  return [
    '| Reason | Player side turns | Foe turns | Foe announcements |',
    '| --- | --- | --- | --- |',
    ...rows,
  ].join('\n');
}
