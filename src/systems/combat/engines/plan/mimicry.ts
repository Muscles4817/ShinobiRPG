import type { CombatTechnique, RangeBand } from '../../contract';
import { alive } from '../../rules/body';
import { canCopy } from '../../rules/eyes';
import { turnLine } from '../../rules/narration';
import { RANGE_BANDS } from '../../rules/range';
import { cardId, fitsBand, slotLimit } from './cards';
import { isDazed } from './daze';
import { inSight } from './senses';
import { say, type Loadout, type PlanFighter, type Round } from './state';
import { tell } from '../../rules/telling';

/**
 * Mimicry in a planned fight (`rules/eyes.ts`): a fighter with the perk who watches a foe use a
 * technique they could carry takes it for their own on the spot. It joins their kit and goes
 * second in their plan at every distance it reaches (after whatever answers an emergency),
 * pushing the last slot out if the plan is full: the copy is meant to be used.
 */

function withCopy(loadout: Loadout, f: PlanFighter, t: CombatTechnique): Loadout {
  const card = { kind: 'jutsu' as const, technique: t };
  const slot = { card: cardId(card) };
  const add = (band: RangeBand) => {
    const slots = loadout[band];
    if (!fitsBand(card, band)) return slots;
    return [...slots.slice(0, 1), slot, ...slots.slice(1)].slice(0, slotLimit(f));
  };
  const [close = [], mid = [], far = []] = RANGE_BANDS.map(add);
  return { close, mid, far };
}

function copied(f: PlanFighter, t: CombatTechnique): PlanFighter {
  return {
    ...f,
    techniques: [...f.techniques, t],
    copied: [...(f.copied ?? []), t.id],
    loadout: withCopy(f.loadout, f, t),
  };
}

/** After `user` uses `t`: anyone watching with mimicry who could carry it copies it. */
export function watchedBy(round: Round, user: PlanFighter, t: CombatTechnique): Round {
  return round.fighters.reduce((r, f) => {
    const watching = f.side !== user.side && alive(f) && !isDazed(f) && inSight(f, user);
    if (!watching || !canCopy(f, user, t)) return r;
    const fighters = r.fighters.map((g) => (g.id === f.id ? copied(g, t) : g));
    const line = tell('{a.poss} eyes take in every seal of {what}. It is {a.theirs} now.', {
      a: f,
      what: t.name,
    });
    // The copy is the watcher's doing, even inside the user's turn.
    return say({ ...r, fighters }, turnLine(line, f.id));
  }, round);
}
