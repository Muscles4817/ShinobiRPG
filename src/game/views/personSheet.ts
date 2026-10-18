import type { PersonDef, Tone } from '@/content';
import { RANK_LABELS } from '@/systems/standing';

import { nextLesson } from '../actions/recipes';
import type { GameContext } from '../context';
import { findPerson } from '../people/cast';
import { scoutPerson, type Threat } from '../scouting';
import { waysOf } from '../sensei/generate';
import type { GameState } from '../state';
import { bondPath, TASTES_REVEALED_AT, TRAITS_REVEALED_AT, type BondPath } from './bondPath';
import { choice, type Choice } from './common';
import { personCard, toneLabel, type PersonCard } from './people';
import { artsOf, dayOf, growthOf, type Arts, type DaySlot, type Growth } from './personFacts';
import { signatureFor, type TeacherOffer } from './teachers';

/**
 * Someone's profile: one sheet that grows as you get to know them. A stranger shows who they
 * are, your read of them in a fight and what knowing them better opens; an acquaintance (or
 * anyone on your team) also their day, what they can do and are growing into, what they'll
 * teach you and, for a genin, how they've grown since the academy; a friend what they like to
 * hear. Memories and what a sensei carries come as you earn them.
 */

/** The beat of a sensei's story (the third, among friends) that tells what they carry. */
const WOUND_BEAT = 2;

export interface PersonSheet extends PersonCard {
  readonly bio: string;
  readonly clan: string | null;
  /** Their rank in words; null for someone who isn't a shinobi. */
  readonly rank: string | null;
  readonly path: BondPath;
  /** Null until you know them well enough. */
  readonly traits: readonly { readonly name: string; readonly note: string }[] | null;
  readonly likes: readonly string[] | null;
  readonly dislikes: readonly string[] | null;
  /** Null until you know them: where they are at each time of day. */
  readonly day: readonly DaySlot[] | null;
  /** Null until you know them, or for someone with no techniques of their own. */
  readonly arts: Arts | null;
  /** Their next signature technique for you, or what holds it back. */
  readonly teaches: TeacherOffer['signature'];
  /** For a genin you know: how they've grown since the academy. */
  readonly growth: readonly Growth[] | null;
  /** How a fight with them would go, read against you. */
  readonly sizing: {
    readonly threat: Threat;
    readonly label: string;
    readonly style: string;
  } | null;
  /** Moments from jobs together that they remember, newest first. */
  readonly memories: readonly string[];
  /** For a sensei: what they carry, once they have told you (their third story beat). */
  readonly carries: string | null;
  /** The next dish they would teach you, for people who cook; null otherwise. */
  readonly recipe: (Choice & { readonly name: string }) | null;
  /** The summoning contract they would let you sign, for teachers who hold one; null otherwise. */
  readonly contract: (Choice & { readonly name: string }) | null;
}

/** A sensei's wound, once you have heard the beat of their story that tells it. */
function carriedWound(state: GameState, person: PersonDef): string | null {
  const story = waysOf(person)?.story;
  const told = story?.beats[WOUND_BEAT];
  if (!story || !told) return null;
  return state.people.bonds[person.id]?.heard.includes(told) ? story.wound : null;
}

function contractOffer(
  state: GameState,
  ctx: GameContext,
  person: PersonDef,
): PersonSheet['contract'] {
  const offer = person.teacher?.contract;
  if (!offer || state.contract?.contractId === offer.contractId) return null;
  return {
    ...choice(state, ctx, { type: 'signContract', personId: person.id }),
    name: ctx.content.contracts.require(offer.contractId).name,
  };
}

function recipeOffer(state: GameState, ctx: GameContext, person: PersonDef): PersonSheet['recipe'] {
  const lesson = nextLesson(state, person);
  if (!lesson) return null;
  return {
    ...choice(state, ctx, { type: 'learnRecipe', personId: person.id }),
    name: ctx.content.recipes.require(lesson.recipeId).name,
  };
}

function traitsOf(ctx: GameContext, person: PersonDef) {
  return person.traitIds.flatMap((id) => {
    const t = ctx.content.traits.get(id);
    return t ? [t] : [];
  });
}

/** What they like and dislike to hear, once you're friends. */
function tastes(ctx: GameContext, person: PersonDef, known: boolean) {
  if (!known) return { likes: null, dislikes: null };
  const traits = traitsOf(ctx, person);
  const words = (pick: (t: (typeof traits)[number]) => readonly Tone[]) => [
    ...new Set(traits.flatMap((t) => pick(t).map(toneLabel))),
  ];
  return { likes: words((t) => t.likes), dislikes: words((t) => t.dislikes) };
}

function sizingOf(state: GameState, ctx: GameContext, person: PersonDef): PersonSheet['sizing'] {
  if (person.rank === 'civilian') return null;
  const read = scoutPerson(state, ctx, person.id);
  return read ? { threat: read.threat, label: read.threatLabel, style: read.style } : null;
}

/** What a sheet shows once you know someone (or they're on your team). */
function knownFacts(state: GameState, ctx: GameContext, person: PersonDef, known: boolean) {
  if (!known) return { day: null, arts: null, teaches: null, growth: null };
  return {
    day: dayOf(state, ctx, person),
    arts: artsOf(state, ctx, person),
    teaches: signatureFor(state, ctx, person),
    growth: growthOf(state, person),
  };
}

export function personSheet(
  state: GameState,
  ctx: GameContext,
  personId: string,
): PersonSheet | null {
  const person = findPerson(state, ctx, personId);
  if (!person) return null;
  const card = personCard(state, ctx, person);
  const known = card.stage >= TRAITS_REVEALED_AT || card.relation !== null;
  return {
    ...card,
    bio: person.bio,
    clan: person.clanId ? (ctx.content.clans.get(person.clanId)?.name ?? null) : null,
    rank: person.rank === 'civilian' ? null : RANK_LABELS[person.rank],
    path: bondPath(state, person),
    traits:
      card.stage >= TRAITS_REVEALED_AT
        ? traitsOf(ctx, person).map((t) => ({ name: t.name, note: t.note }))
        : null,
    ...tastes(ctx, person, card.stage >= TASTES_REVEALED_AT),
    ...knownFacts(state, ctx, person, known),
    sizing: sizingOf(state, ctx, person),
    memories: state.village.memories
      .filter((m) => m.personId === person.id)
      .map((m) => m.text)
      .reverse(),
    recipe: recipeOffer(state, ctx, person),
    contract: contractOffer(state, ctx, person),
    carries: carriedWound(state, person),
  };
}
