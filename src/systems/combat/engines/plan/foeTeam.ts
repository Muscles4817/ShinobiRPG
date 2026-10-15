import { alive } from '../../rules/body';
import { hasTrait } from '../../rules/kit';
import { isHindering, isWounding } from '../../rules/verbs';
import type { CombatStance } from '../../teamContract';
import { readsInTheMoment } from './judgement';
import type { PlanFighter } from './state';

/**
 * Foes fight as a team when someone among them can call the plays: a mind that reads a fight
 * in the moment (`judgement.ts`). Then each takes a stance as your teammates do (`team.ts`):
 * the sturdiest in the front row covers the frailest in the back, back-row casters with holds
 * support, and the rest press their mark, the one on your side who would fall soonest (marked
 * again every round). A lone foe, or a pack with no one to lead it, fights by its own plan.
 */

function standingFoes(fighters: readonly PlanFighter[]): PlanFighter[] {
  return fighters.filter((f) => f.side === 'enemy' && alive(f));
}

/** Someone among them can call the plays. */
function coordinated(foes: readonly PlanFighter[]): boolean {
  return foes.length > 1 && foes.some(readsInTheMoment);
}

function holds(f: PlanFighter): boolean {
  return f.techniques.some((t) => isHindering(t) && !isWounding(t));
}

function sturdiness(f: PlanFighter): number {
  return f.maxHealth + f.attributes.stamina * 2;
}

function byFrailty(a: PlanFighter, b: PlanFighter): number {
  return sturdiness(a) - sturdiness(b);
}

/** Who the front row's sturdiest covers: the frailest in the back row, if any stands there. */
function coverPair(foes: readonly PlanFighter[]): { cover: string; ward: string } | null {
  const ward = foes.filter((f) => f.row === 'back').sort(byFrailty)[0];
  const cover = foes
    .filter((f) => f.row === 'front')
    .sort(byFrailty)
    .at(-1);
  return ward && cover ? { cover: cover.id, ward: ward.id } : null;
}

function stanceFor(f: PlanFighter, pair: ReturnType<typeof coverPair>): CombatStance {
  if (pair?.cover === f.id) return { kind: 'cover', covers: pair.ward };
  if (f.row === 'back' && (holds(f) || hasTrait(f, 'illusionist'))) return { kind: 'support' };
  return { kind: 'press' };
}

/** Foes who can work together take up stances; the rest are left to their own plans. */
export function foeStances(fighters: readonly PlanFighter[]): PlanFighter[] {
  const foes = standingFoes(fighters);
  if (!coordinated(foes)) return [...fighters];
  const pair = coverPair(foes);
  return fighters.map((f) =>
    f.side === 'enemy' && alive(f) ? { ...f, stance: stanceFor(f, pair) } : f,
  );
}

/**
 * The foes' mark: the one on your side who would fall soonest (least health, the player on a
 * tie), when the foes fight as a team; none otherwise.
 */
export function foeMarkFor(fighters: readonly PlanFighter[]): { foeMark?: string } {
  if (!coordinated(standingFoes(fighters))) return {};
  const [mark] = fighters
    .filter((f) => f.side === 'player' && alive(f))
    .sort((a, b) => a.health - b.health || Number(b.isPlayer) - Number(a.isPlayer));
  return mark ? { foeMark: mark.id } : {};
}
