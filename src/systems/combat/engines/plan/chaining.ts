import type { CombatTechnique } from '../../contract';
import { alive } from '../../rules/body';
import { maxBreath } from '../../rules/breath';
import { chainLength, chainProblem, defaultChains, reachesAfter } from '../../rules/chains';
import { tell } from '../../rules/telling';
import { techniquePower } from '../../rules/verbs';
import { fitsBand, playable, type Card } from './cards';
import { breathOf, effortOf } from './effort';
import { useJutsu } from './jutsu';
import { armed, jutsu, strikeScore } from './repertoire';
import { opponentsOf, type Turn } from './senses';
import { fighterIn, say, type PlanFighter, type Round } from './state';

/**
 * Chains in a fight (`rules/chains.ts`): when a strike plays, a chain whose opener suits the
 * moment better than any one move is thrown instead, and its links follow in the same turn,
 * each only while the last landed on its target (it hurt, dazed or pinned them) without the
 * thrower being hurt in answer (a Counter breaks a chain), and only where the fight now stands
 * lets it reach. A chain spends breath link by link, so it is thrown only with breath for all of
 * it to spare.
 */

/** What a link that may not land is worth beside the opener, when weighing a chain. */
const FOLLOW_SHARE = 0.6;
/** A chain is thrown only with this share of breath to spare beyond its cost. */
const SPARE_SHARE = 1 / 4;

/** What a strike opens: its first move (or the plain strike), and any links to follow. */
export interface Opened {
  readonly card: Card;
  readonly follow: readonly CombatTechnique[];
}

/** The chains a fighter keeps ready that still hold: built by them, or from their moves. */
export function chainsOf(f: PlanFighter): CombatTechnique[][] {
  if (armed(f)) return [];
  const byId = new Map(f.techniques.map((t) => [t.id, t]));
  const built = f.chains ?? defaultChains(f.techniques, f.attributes.taijutsu);
  return built
    .map((ids) => ids.flatMap((id) => byId.get(id) ?? []))
    .filter((links) => chainProblem(links, f.attributes.taijutsu) === null)
    .map((links) => links.slice(0, chainLength(f.attributes.taijutsu)));
}

interface ReadyChain {
  readonly opener: CombatTechnique;
  readonly rest: readonly CombatTechnique[];
}

function breathFor(f: PlanFighter, links: readonly CombatTechnique[]): number {
  return links.reduce((sum, t) => sum + effortOf(f, t).amount, 0);
}

/**
 * A planned strike, opened: the chain that suits the moment best when it beats the one move the
 * style picked (`single`), else that move alone.
 */
export function opened(round: Round, turn: Turn, planned: Card, single: Card): Opened {
  const alone = { card: single, follow: [] };
  const { actor } = turn;
  const foe = turn.target ?? opponentsOf(round.fighters, actor)[0];
  if (planned.kind !== 'strike' || !foe) return alone;
  const spare = breathOf(actor) - maxBreath(actor.attributes) * SPARE_SHARE;
  const ready = chainsOf(actor).flatMap(([opener, ...rest]) => {
    const card = opener && jutsu(opener);
    const fits = card && fitsBand(card, round.range) && playable(actor, card);
    return fits && breathFor(actor, [opener, ...rest]) <= spare ? [{ opener, rest }] : [];
  });
  const worth = (c: ReadyChain) =>
    strikeScore(round, actor, foe, jutsu(c.opener)) +
    FOLLOW_SHARE * c.rest.reduce((sum, t) => sum + techniquePower(t), 0);
  const best = ready.sort((a, b) => worth(b) - worth(a))[0];
  if (!best || worth(best) <= strikeScore(round, actor, foe, single)) return alone;
  return { card: jutsu(best.opener), follow: best.rest };
}

/** Whether a link landed: it hurt, dazed or pinned its target, and nothing hurt its thrower. */
function landed(before: Round, after: Round, actorId: string, targetId: string): boolean {
  const [was, is] = [fighterIn(before, targetId), fighterIn(after, targetId)];
  const [self, now] = [fighterIn(before, actorId), fighterIn(after, actorId)];
  if (!was || !is || !self || !now || now.health < self.health) return false;
  const pinned = (is.pinned ?? 0) > (was.pinned ?? 0);
  return is.health < was.health || is.stunned > was.stunned || pinned;
}

const BREAKS = '{a.poss} chain breaks off there.';

/**
 * The rest of a chain, after its opener was thrown (`before` is the fight as the opener met it):
 * each link while the last landed and this one can reach and be paid for.
 */
export function followThrough(
  before: Round,
  after: Round,
  turn: Turn,
  follow: Opened['follow'],
): Round {
  let [prev, now] = [before, after];
  const targetId = turn.target?.id;
  for (const link of follow) {
    const actor = fighterIn(now, turn.actor.id);
    const target = targetId === undefined ? undefined : fighterIn(now, targetId);
    if (!actor || !target || !alive(actor) || !alive(target)) return now;
    const card = jutsu(link);
    const goes = landed(prev, now, actor.id, target.id);
    if (!goes || !reachesAfter(link, now.range) || !playable(actor, card)) {
      return say(now, tell(BREAKS, { a: actor }));
    }
    [prev, now] = [now, useJutsu(now, { actor, target, rng: turn.rng }, link)];
  }
  return now;
}
