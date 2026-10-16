import { STAT_GRADES, statTier } from '@/systems/stats';

import type { CombatTechnique } from '../../contract';
import { forceLine, turnLine, type NarrationForce } from '../../rules/narration';
import { findCard, type Card } from './cards';
import type { CardId, PlanFighter, Round } from './state';

/**
 * Staging a turn for the screen. How big a turn was, for its sound (`forceLine`): the grade of its maker in the art
 * the card works by, the ground an area technique covered, and its element. Two genin trading
 * kunai and two jōnin trading fire are the same fight on paper (damage is a gap, decision 16),
 * so the size has to come from who fought and what they threw, not from the damage.
 */

type Art = 'taijutsu' | 'ninjutsu' | 'genjutsu' | 'kenjutsu' | 'fuuinjutsu';

function artOf(fighter: PlanFighter, card: Card | null): Art {
  if (card?.kind === 'jutsu') return card.technique.discipline;
  if (card?.kind === 'strike') return 'taijutsu';
  const { attributes } = fighter;
  // Anything else (a throw, a tool, a step) is done as well as their best art allows.
  const arts: readonly Art[] = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'];
  return arts.reduce((best, art) => (attributes[art] > attributes[best] ? art : best));
}

function areaOf(technique: CombatTechnique): NarrationForce['size'] {
  for (const effect of technique.effects) {
    if (effect.verb === 'area') return effect.size ?? 'small';
  }
  return null;
}

/** The force of `fighter`'s turn playing card `id` (or none, for a turn that played nothing). */
export function turnForce(fighter: PlanFighter, id: CardId | undefined): NarrationForce {
  const card = id ? findCard(fighter, id) : null;
  const grade = STAT_GRADES.indexOf(statTier(fighter.attributes[artOf(fighter, card)]).grade);
  const technique = card?.kind === 'jutsu' ? card.technique : null;
  return {
    grade: Math.max(0, grade),
    size: technique ? areaOf(technique) : null,
    element: technique?.element ?? null,
  };
}

/**
 * A turn as the screen stages it: every line it wrote tagged as its maker's, the first with
 * the distance the turn began at and the last with the new one if the turn moved the fight,
 * and each with how big the turn was. The tags are narration only: the turn plays exactly as
 * untagged.
 */
export function staged(before: Round, after: Round, id: string): Round {
  const { played, ...turn } = after;
  const actor = turn.fighters.find((f) => f.id === id);
  const force = actor ? turnForce(actor, played) : null;
  const added = turn.lines.slice(before.lines.length);
  const last = added.length - 1;
  const rangeAt = (i: number) => {
    if (i === last && turn.range !== before.range) return turn.range;
    return i === 0 ? before.range : undefined;
  };
  const tagged = added.map((line, i) => {
    const theirs = turnLine(line, id, rangeAt(i));
    return force ? forceLine(theirs, force) : theirs;
  });
  return { ...turn, lines: [...before.lines, ...tagged] };
}
