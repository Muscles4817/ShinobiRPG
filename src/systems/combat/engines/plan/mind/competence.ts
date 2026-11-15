import { STAT_GRADES, statTier, type StatGrade } from '@/systems/stats';
import type { Discipline } from '@/systems/techniques';

import type { CombatTechnique } from '../../../contract';
import type { PlanFighter } from '../state';

/**
 * Competence, and where it comes from (`docs/design/combat-ai-plan.md` Part 4): not one number.
 * Tactical intelligence (intellect) runs the whole fight; expertise in an art (the fighter's
 * grade in it) sharpens decisions and reading inside that art's exchanges, so a taijutsu master
 * sees a close-range sequence deep with a dull mind; knowledge names what a fighter knows on
 * sight. Combat experience (priors by kind of foe) waits on the game keeping it per character.
 * One planner reads these as a tier (`tierFor`); none of them is ever a style.
 */

export interface Competence {
  /** Intellect's grade: objectives, plans across arts or with teammates, how much it entertains. */
  readonly tactical: StatGrade;
  /** Their grade in each art. */
  readonly expertise: Readonly<Record<Discipline, StatGrade>>;
}

const ARTS: readonly Discipline[] = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'];

const rankOf = (g: StatGrade) => STAT_GRADES.indexOf(g);
const higher = (a: StatGrade, b: StatGrade) => (rankOf(a) >= rankOf(b) ? a : b);

export function competenceOf(f: Pick<PlanFighter, 'attributes'>): Competence {
  const a = f.attributes;
  return {
    tactical: statTier(a.intellect).grade,
    expertise: Object.fromEntries(ARTS.map((art) => [art, statTier(a[art]).grade])) as Record<
      Discipline,
      StatGrade
    >,
  };
}

/**
 * The tier a decision is made at: tactical intelligence, lifted by expertise when every card
 * it weighs is of one art (a sequence inside that art's exchanges).
 */
export function tierFor(competence: Competence, arts: readonly Discipline[]): StatGrade {
  const [only] = arts;
  const single = only !== undefined && arts.every((a) => a === only);
  return single ? higher(competence.tactical, competence.expertise[only]) : competence.tactical;
}

/**
 * Whether a fighter would know a technique on sight: they know it themselves, or their grade
 * in its art reaches its rank (Part 5's decision: a first sight is described, never named,
 * without the knowledge to name it).
 */
export function recognises(
  f: Pick<PlanFighter, 'attributes' | 'techniques'>,
  t: Pick<CombatTechnique, 'id' | 'discipline' | 'rank'>,
): boolean {
  if (f.techniques.some((own) => own.id === t.id)) return true;
  return rankOf(competenceOf(f).expertise[t.discipline]) >= rankOf(t.rank ?? 'E');
}
