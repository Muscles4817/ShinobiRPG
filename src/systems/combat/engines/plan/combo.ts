import type { CombatTechnique } from '../../contract';
import { alive, chakraCost } from '../../rules/body';
import { ELEMENT_COMBO_BONUS, elementCombo } from '../../rules/elements';
import { COMBINATION_BONUS } from '../../rules/team';
import { trumpSpent } from '../../rules/trumps';
import { hasVerb, isHarmful } from '../../rules/verbs';
import type { Turn } from './senses';
import { isDazed } from './daze';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';
import { tell } from '../../rules/telling';

/**
 * Fighting together. Element combos need no authoring: when a fighter's elemental hit lands on
 * a foe someone else on their side already hit this exchange with an element that feeds it
 * (`rules/elements.ts`), it lands harder. Combination techniques are authored in pairs: one
 * plays only beside a teammate who knows its partner and is free to join (not dazed, sealed or
 * already joined, with the chakra); both go off together, each harder than alone, and the
 * partner's next turn goes into it.
 */

/** A teammate ready to join a combination, and the partner technique they bring. */
export interface Partner {
  readonly fighter: PlanFighter;
  readonly technique: CombatTechnique;
}

function ready(f: PlanFighter, technique: CombatTechnique): boolean {
  if (!alive(f) || isDazed(f) || f.sealed > 0 || f.joined) return false;
  return !trumpSpent(f, technique) && chakraCost(f, technique) <= f.chakra;
}

/** Who on this fighter's side could join this combination now, or undefined. */
export function comboPartner(
  fighters: readonly PlanFighter[],
  self: PlanFighter,
  t: CombatTechnique,
): Partner | undefined {
  if (!t.combo) return undefined;
  const id = t.combo.partnerTechniqueId;
  for (const f of fighters) {
    if (f.side !== self.side || f.id === self.id) continue;
    const technique = f.techniques.find((known) => known.id === id);
    if (technique && ready(f, technique)) return { fighter: f, technique };
  }
  return undefined;
}

/**
 * A fighter as their default plan sees them: without the combination halves no one on their
 * side knows the partner of, which could never play.
 */
export function withoutLoneCombos(f: PlanFighter, fighters: readonly PlanFighter[]): PlanFighter {
  const side = fighters.filter((o) => o.side === f.side && o.id !== f.id);
  const joinable = (t: CombatTechnique) =>
    !t.combo || side.some((o) => o.techniques.some((k) => k.id === t.combo?.partnerTechniqueId));
  const techniques = f.techniques.filter(joinable);
  return techniques.length === f.techniques.length ? f : { ...f, techniques };
}

/** A combination technique can only be played with a partner ready to join it. */
export function partnered(
  fighters: readonly PlanFighter[],
  self: PlanFighter,
  t: CombatTechnique,
): boolean {
  return !t.combo || comboPartner(fighters, self, t) !== undefined;
}

/** The element combo this hit would make on its target this exchange, if any. */
export function elementBoost(
  round: Round,
  actor: PlanFighter,
  targetId: string,
  t: CombatTechnique,
): { readonly scale: number; readonly line: string } | null {
  const earlier = (round.hits ?? []).filter(
    (h) => h.targetId === targetId && h.fighterId !== actor.id,
  );
  const allies = earlier.filter((h) => fighterIn(round, h.fighterId)?.side === actor.side);
  for (const hit of allies) {
    const combo = elementCombo(hit.element, t.element);
    if (combo) return { scale: ELEMENT_COMBO_BONUS, line: combo.line };
  }
  return null;
}

/** Remembers an elemental hit that landed, for combos later in the exchange. */
export function recordHit(
  round: Round,
  actor: PlanFighter,
  targetId: string,
  t: CombatTechnique,
): Round {
  if (!t.element) return round;
  const hit = { targetId, fighterId: actor.id, element: t.element };
  return { ...round, hits: [...(round.hits ?? []), hit] };
}

/** A combination about to go off: the user's technique and the partner joining it. */
export interface Joint {
  readonly lead: CombatTechnique;
  readonly partner: Partner;
}

/** Resolves one technique for one fighter (`useJutsu` without the combination check). */
export type Single = (round: Round, turn: Turn, t: CombatTechnique) => Round;

/**
 * Both halves of a combination: the user's technique, then the partner's at the same foe (if
 * still standing), each with the combination bonus. The partner pays their own chakra.
 */
export function combination(round: Round, turn: Turn, joint: Joint, single: Single): Round {
  const { lead: t, partner } = joint;
  const { fighter, technique } = partner;
  const told = say(
    { ...round, fighters: patch(round.fighters, fighter.id, { joined: true }) },
    tell('{a} and {b} combine {what} and {with}!', {
      a: turn.actor,
      b: fighter,
      what: t.name,
      with: technique.name,
    }),
  );
  const first = single(told, { ...turn, boost: COMBINATION_BONUS }, t);
  const joiner = fighterIn(first, fighter.id) ?? fighter;
  const foe = turn.target && fighterIn(first, turn.target.id);
  const target = foe && alive(foe) ? foe : undefined;
  if (isHarmful(technique) && !hasVerb(technique, 'area') && !target) return first;
  return single(
    first,
    { actor: joiner, target, rng: turn.rng, boost: COMBINATION_BONUS },
    technique,
  );
}
