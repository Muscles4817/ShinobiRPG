import {
  aptitudeBand,
  applyTraining,
  STAT_IDS,
  type Aptitude,
  type StatDelta,
  type StatId,
} from '@/systems/stats';

import { slotName } from '@/systems/time';

import type { GameContext } from './context';
import { log } from './ops';
import { characterModifiers, growthFor } from './profile';
import type { Character, GameState } from './state';

/**
 * Every way a character grows in stats (drills, lessons, spars, fights) goes through
 * `growCharacter`: one formula (base × solo or teacher efficiency × aptitude × modifiers) and
 * one discovery rule. The first few sessions in a stat give a rough read of the talent for it;
 * an art with no talent at all shows itself on the first try.
 */

/** Sessions in a stat before its aptitude gives a rough read. */
export const SESSIONS_TO_SENSE = 3;

/**
 * A drill's gains at this hour: a night owl's evening and night drills go further, and their
 * mornings less far (`afterDark`).
 */
export function byTheClock(state: GameState, ctx: GameContext, gains: StatDelta): StatDelta {
  const owl = characterModifiers(state.character, ctx).afterDark;
  const slot = slotName(state.time);
  const factor = slot === 'evening' || slot === 'night' ? owl : slot === 'morning' ? 2 - owl : 1;
  if (factor === 1) return gains;
  return Object.fromEntries(Object.entries(gains).map(([id, g]) => [id, g * factor]));
}

export interface Grown {
  readonly character: Character;
  /** Stats whose aptitude was sensed for the first time in this session. */
  readonly discovered: readonly StatId[];
}

function practised(gains: StatDelta): StatId[] {
  return (Object.entries(gains) as [StatId, number][]).filter(([, v]) => v > 0).map(([id]) => id);
}

/**
 * Counts a session in each practised stat still unknown, sensing those that are due. Growth
 * calls it; so does anything else that is practice in an art (studying its scrolls).
 */
export function discover(character: Character, gains: StatDelta): Grown {
  const known = { ...character.aptitudeKnown };
  const sessions = { ...character.aptitudeSessions };
  const discovered: StatId[] = [];
  for (const id of practised(gains)) {
    if (known[id] !== 'unknown') continue;
    const count = (sessions[id] ?? 0) + 1;
    sessions[id] = count;
    if (count >= SESSIONS_TO_SENSE || character.aptitude[id] <= 0) {
      known[id] = 'sense';
      discovered.push(id);
    }
  }
  return {
    character: { ...character, aptitudeKnown: known, aptitudeSessions: sessions },
    discovered,
  };
}

/** Who a session is with, beyond the character's own effort. */
export interface Session {
  /** A flat multiplier on the whole session (the sensei's weekly lesson). */
  readonly teacher?: number;
  /** Someone to learn from: their value in each stat (see `teacherEfficiency`). */
  readonly teachers?: StatDelta;
}

/** Grows the character from a session's base gains. */
export function growCharacter(
  character: Character,
  gains: StatDelta,
  ctx: GameContext,
  session: Session = {},
): Grown {
  const growth = growthFor(character, ctx, session.teacher);
  const withTeachers = session.teachers ? { ...growth, teachers: session.teachers } : growth;
  const stats = applyTraining(character.stats, gains, withTeachers);
  return discover({ ...character, stats }, gains);
}

/**
 * The heading over a first read of a talent, as the work feels from the inside: "Getting
 * faster", "Learning genjutsu". The read that follows ("It comes naturally…") is about it.
 */
export const FIRST_READ_HEADINGS: Readonly<Record<StatId, string>> = {
  strength: 'Building strength',
  speed: 'Getting faster',
  stamina: 'Building stamina',
  reserves: 'Deepening your chakra',
  chakraControl: 'Controlling your chakra',
  intellect: 'Study',
  perception: 'Sharpening your senses',
  willpower: 'Hardening your will',
  taijutsu: 'Learning taijutsu',
  ninjutsu: 'Learning ninjutsu',
  genjutsu: 'Learning genjutsu',
  kenjutsu: 'Learning kenjutsu',
  fuuinjutsu: 'Learning fūinjutsu',
};

/** Journal lines for the stats whose aptitude was just sensed. */
export function logDiscoveries(
  state: GameState,
  discovered: readonly StatId[],
  ctx: GameContext,
): GameState {
  const { reads } = ctx.content.text.aptitude;
  return discovered.reduce(
    (next, id) =>
      log(next, {
        heading: FIRST_READ_HEADINGS[id],
        text: reads[aptitudeBand(state.character.aptitude[id])],
        tone: 'info',
      }),
    state,
  );
}

/**
 * The aptitude a character can reckon with: what they have sensed, and ordinary where they
 * haven't tried yet. Previews use it, so they never give away a talent not yet found.
 */
export function assumedAptitude(character: Character): Aptitude {
  const read = (id: StatId) =>
    character.aptitudeKnown[id] === 'unknown' ? 1 : character.aptitude[id];
  return Object.fromEntries(STAT_IDS.map((id) => [id, read(id)])) as Record<StatId, number>;
}

/** Why work in this stat is refused: the character knows it will never take. */
export function noTalentReason(
  character: Character,
  stat: StatId,
  ctx: GameContext,
): string | null {
  const known = character.aptitudeKnown[stat] !== 'unknown';
  return known && character.aptitude[stat] <= 0 ? ctx.content.text.aptitude.blocked : null;
}
