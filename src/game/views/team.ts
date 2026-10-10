import { stageName } from '@/systems/bonds';
import { STAT_INFO } from '@/systems/stats';
import type { Discipline } from '@/systems/techniques';

import { LESSON_ENERGY, nextSignature, TEACHES_AT_STAGE, yourSensei } from '../actions/lesson';
import { SPAR_ENERGY } from '../actions/spar';
import type { GameContext } from '../context';
import { placeHere } from '../ops';
import { everyone, fullName, whereNow } from '../people/cast';
import { scoutPerson, type ScoutingRead } from '../scouting';
import type { GameState } from '../state';
import { choice, type Choice } from './common';
import { personCard, personFace, type PersonFace } from './people';

/** The team side of the training ground: your sensei's weekly lesson and sparring partners. */

export interface LessonCard extends Choice {
  readonly sensei: PersonFace & { readonly fullName: string };
  readonly specialty: { readonly id: Discipline; readonly label: string };
  readonly energyCost: number;
  readonly style: string;
  /** The next signature technique: progress once teaching has begun, or what unlocks it. */
  readonly signature: {
    readonly name: string;
    readonly progress: number;
    readonly locked: string | null;
  } | null;
}

export interface SparOption extends Choice {
  readonly person: PersonFace;
  readonly where: string;
  readonly specialty: { readonly id: Discipline; readonly label: string } | null;
  readonly energyCost: number;
  /** How they size up against you. */
  readonly read: ScoutingRead | null;
}

export function lessonCard(state: GameState, ctx: GameContext): LessonCard | null {
  const sensei = yourSensei(state, ctx);
  const profile = sensei?.sensei;
  if (!sensei || !profile) return null;
  const card = personCard(state, ctx, sensei);
  const nextId = nextSignature(state, sensei);
  const def = nextId ? ctx.content.techniques.require(nextId) : null;
  return {
    ...choice(state, ctx, { type: 'lesson' }),
    sensei: { ...personFace(state, sensei), fullName: fullName(sensei) },
    specialty: { id: profile.specialty, label: STAT_INFO[profile.specialty].label },
    energyCost: LESSON_ENERGY,
    style: profile.style,
    signature: def && {
      name: def.name,
      progress: Math.min(1, (state.techniques.progress[def.id] ?? 0) / def.difficulty),
      locked:
        card.stage < TEACHES_AT_STAGE
          ? `Taught once you and ${sensei.name} are ${stageName(TEACHES_AT_STAGE).toLowerCase()}s.`
          : null,
    },
  };
}

/**
 * Partners worth offering at the training ground: your teammates (wherever they are in the
 * village) and genin training here now. Anyone else around can be asked from their sheet.
 */
export function sparOptions(state: GameState, ctx: GameContext): SparOption[] {
  const training = placeHere(state, ctx, 'training');
  const teammates = state.people.team?.teammateIds ?? [];
  return everyone(state, ctx)
    .filter((p) => p.role === 'genin')
    .filter((p) => teammates.includes(p.id) || whereNow(state, ctx, p) === training?.id)
    .map((p) => ({ person: p, card: personCard(state, ctx, p) }))
    .filter(({ card }) => card.where !== 'Away')
    .map(({ person, card }) => ({
      ...choice(state, ctx, { type: 'spar', personId: person.id }),
      person: personFace(state, person),
      where: card.where,
      specialty: card.specialty,
      energyCost: SPAR_ENERGY,
      read: scoutPerson(state, ctx, person.id),
    }))
    .sort((a, b) => Number(b.person.relation !== null) - Number(a.person.relation !== null));
}
