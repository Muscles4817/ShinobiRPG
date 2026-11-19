import type { CombatTechnique } from '../../contract';
import { alive } from '../../rules/body';
import { techniqueDamage } from '../../rules/damage';
import { harmLine } from '../../rules/narration';
import { tell } from '../../rules/telling';
import { isPinned } from '../../rules/verbs/lingering';
import { fighterIn, say, type PlanFighter, type Round } from './state';
import { wound } from './wound';

/**
 * Techniques in two stages (`docs/design/technique-tags.md`, stages): the first holds (Planetary
 * Devastation pulls everyone up into the air), and its `then` lands at the end of the next
 * exchange on everyone the hold still has (the rock closes and crushes). Breaking free in between,
 * by struggling or being pulled out, escapes the second stage, so a pull is something to fight.
 */

/** The stage a held target waits for: who cast it, and which technique. */
export function closingOn(
  round: Round,
  { by, targetId, technique }: { by: string; targetId: string; technique: CombatTechnique },
): Round {
  if (!technique.then || technique.then.length === 0) return round;
  const closing = { by, techniqueId: technique.id };
  return {
    ...round,
    fighters: round.fighters.map((f) => (f.id === targetId ? { ...f, closing } : f)),
  };
}

function cleared(round: Round, id: string): Round {
  return {
    ...round,
    fighters: round.fighters.map((f) => {
      if (f.id !== id) return f;
      const { closing: _was, ...rest } = f;
      return rest;
    }),
  };
}

/** The exchange it was cast in ends with the hold still on: it closes as the next one ends. */
function armed(round: Round, id: string): Round {
  return {
    ...round,
    fighters: round.fighters.map((f) =>
      f.id === id && f.closing ? { ...f, closing: { ...f.closing, armed: true as const } } : f,
    ),
  };
}

function crushed(
  round: Round,
  caster: PlanFighter,
  target: PlanFighter,
  technique: CombatTechnique,
): Round {
  return (technique.then ?? []).reduce((now, effect) => {
    const struck = fighterIn(now, target.id);
    if (!struck || !alive(struck)) return now;
    if (effect.verb !== 'damage' && effect.verb !== 'area' && effect.verb !== 'break') return now;
    const damage = techniqueDamage(caster, struck, { technique, effect }, 0.5);
    const line = harmLine(tell('It closes on {t}, and crushes.', { t: struck }), damage);
    return wound(now, struck.id, damage, line);
  }, round);
}

function closedOn(round: Round, id: string): Round {
  const target = fighterIn(round, id);
  if (!target?.closing) return round;
  const { by, techniqueId } = target.closing;
  const done = cleared(round, id);
  const caster = fighterIn(done, by);
  const technique = caster?.techniques.find((t) => t.id === techniqueId);
  if (!caster || !technique || !alive(target)) return done;
  if (!isPinned(target)) return say(done, tell('{t} {t.is} free before it closes.', { t: target }));
  if (!target.closing.armed) return armed(round, id);
  return crushed(done, caster, target, technique);
}

/** As an exchange ends: every second stage waiting closes on whoever is still held. */
export function stagesAfter(round: Round): Round {
  return round.fighters
    .filter((f) => f.closing !== undefined)
    .reduce((r, f) => closedOn(r, f.id), round);
}
