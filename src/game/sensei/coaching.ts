import type { PersonDef, SenseiCoachingSpeech } from '@/content';
import { capitalise, pronounForms } from '@/core';
import { stageOf } from '@/systems/bonds';
import type { JournalChip } from '@/systems/journal';
import { STAT_IDS, STAT_INFO, statTier, type StatGrade, type StatId } from '@/systems/stats';

import type { GameContext } from '../context';
import { logDiscoveries } from '../growth';
import { chip, log } from '../ops';
import { underSensei } from '../mentorship';
import { bondOf } from '../people/cast';
import { pronounsOf } from '../people/pronouns';
import type { Character, GameState } from '../state';
import { readinessFocus } from '../exam/readiness';
import { lensStat, senseiRead } from './read';
import { rewardFor, type Given } from './rewards';
import { meetingPlace } from './settle';
import { withRegard, type Assignment } from './state';
import { waysOf } from './generate';
import { said, speakerFor, spoken, type Speaker } from './voice';

/**
 * What your sensei does at the end of each weekly lesson: judges last week's assignment
 * (a reward for work done, lost regard for work not), maybe names a talent you haven't found,
 * reads you aloud (what will get you killed, what beat you, your edge) and sets the next
 * assignment by their lens: a stat to raise by a step before the next lesson. It is said as
 * one paragraph in their manner (`senseiSpeech.coaching`), each fact once; the chips keep the
 * numbers.
 */

export const ASSIGNMENT_DONE_REGARD = 5;
export const ASSIGNMENT_MISSED_REGARD = 2;
/** A sensei who doesn't look for hidden talent sees it anyway once you are this close. */
export const REVEAL_STAGE = 3;

/** How far an assignment asks a stat to move in a week, by its grade: less as it climbs. */
export const ASSIGNMENT_STEP: Readonly<Record<StatGrade, number>> = {
  E: 0.5,
  D: 0.35,
  C: 0.2,
  B: 0.1,
  A: 0.05,
  S: 0.03,
};

/** The facts of one word after the lesson, each to be said once. */
interface Coached {
  readonly state: GameState;
  readonly chips: readonly JournalChip[];
}

interface Verdict extends Coached {
  readonly met: boolean;
  readonly stat: StatId;
  readonly given: Given | null;
}

function label(stat: StatId): string {
  return STAT_INFO[stat].label.toLowerCase();
}

function judge(state: GameState, ctx: GameContext, sensei: PersonDef): Verdict | null {
  const work = state.character.assignment;
  if (!work) return null;
  const cleared = { ...state, character: { ...state.character, assignment: null } };
  if (state.character.stats[work.stat] < work.target) {
    return {
      state: { ...cleared, mentor: withRegard(cleared.mentor, -ASSIGNMENT_MISSED_REGARD) },
      chips: [chip(`${sensei.name}’s regard falls`, 'cost')],
      met: false,
      stat: work.stat,
      given: null,
    };
  }
  const given = rewardFor(cleared, ctx, sensei);
  return {
    state: { ...given.state, mentor: withRegard(given.state.mentor, ASSIGNMENT_DONE_REGARD) },
    chips: [chip('Assignment done', 'gain'), given.chip],
    met: true,
    stat: work.stat,
    given,
  };
}

/** A gift you haven't found: the highest aptitude you have no read on, if it's a real one. */
function hiddenGift(character: Character): StatId | null {
  return STAT_IDS.filter((id) => character.aptitudeKnown[id] === 'unknown' && id !== 'reserves')
    .filter((id) => character.aptitude[id] > 1)
    .reduce<StatId | null>(
      (top, id) => (top && character.aptitude[top] >= character.aptitude[id] ? top : id),
      null,
    );
}

function reveal(state: GameState, ctx: GameContext, sensei: PersonDef) {
  const ways = waysOf(sensei);
  const looks =
    ways?.lens === 'hidden-talent' || stageOf(bondOf(state, sensei.id).points) >= REVEAL_STAGE;
  const gift = looks ? hiddenGift(state.character) : null;
  if (!gift) return { state, chips: [], gift: null };
  const { character } = state;
  const known = { ...character, aptitudeKnown: { ...character.aptitudeKnown, [gift]: 'sense' } };
  return {
    state: logDiscoveries({ ...state, character: known }, [gift], ctx),
    chips: [chip(`${STAT_INFO[gift].label}: a gift`, 'gain')],
    gift,
  };
}

/**
 * The stat to set: their lens decides, except that a specialist steers a genin whose art is at
 * chūnin level towards what their kind of fighter still lacks (`exam/readiness.ts`).
 */
function assignedStat(state: GameState, ctx: GameContext, sensei: PersonDef): StatId {
  const ways = waysOf(sensei);
  const steer =
    ways?.gatekeeping.readiness === 'specialist' ? readinessFocus(state.character.stats) : null;
  return steer ?? lensStat(state, ctx, ways?.lens ?? 'weakest-stat');
}

function assign(state: GameState, ctx: GameContext, sensei: PersonDef) {
  const stat = assignedStat(state, ctx, sensei);
  const from = state.character.stats[stat];
  const assignment: Assignment = {
    stat,
    from,
    target: from + ASSIGNMENT_STEP[statTier(from).grade],
  };
  return {
    state: { ...state, character: { ...state.character, assignment } },
    chips: [chip(`Assignment: ${STAT_INFO[stat].label}`, 'info')],
    stat,
  };
}

/** The verdict: narration as they look, and their own line when they have a voice. */
function verdictOpening(speaker: Speaker, speech: SenseiCoachingSpeech, verdict: Verdict) {
  const outcome = verdict.met ? 'met' : 'missed';
  const voice = speaker.sensei.sensei?.voice;
  const own = verdict.met ? voice?.praise : voice?.scold;
  const checked = said(speaker, speaker.pick(`coach-checked-${outcome}`, speech.checked[outcome]), {
    stat: label(verdict.stat),
  });
  return {
    narration: [checked, ...(own ? [said(speaker, own)] : [])],
    ownVoice: own !== undefined,
  };
}

/** Their verdict as the first thing said, for a sensei with no line of their own for it. */
function verdictSaid(speaker: Speaker, speech: SenseiCoachingSpeech, verdict: Verdict | null) {
  if (!verdict || speaker.sensei.sensei?.voice) return [];
  const outcome = verdict.met ? 'met' : 'missed';
  return [speaker.pick(`coach-verdict-${outcome}`, speech.verdicts[outcome][speaker.feedback])];
}

interface Read {
  readonly verdict: Verdict | null;
  readonly gift: StatId | null;
  readonly next: StatId;
}

/** What you are good at, unless they read only what will get you killed; once named, "it". */
function edgeClause(speaker: Speaker, speech: SenseiCoachingSpeech, art: StatId, read: Read) {
  const lens = waysOf(speaker.sensei)?.lens;
  if (lens !== 'specialty' && lens !== 'hidden-talent') return null;
  if (read.verdict?.stat === art) return speech.edgeAgain;
  return said(speaker, speaker.pick('coach-edge', speech.edge), { art: label(art) });
}

/** Their read of you and the next work, spoken: each stat named once. */
function readSentences(state: GameState, ctx: GameContext, speaker: Speaker, read: Read) {
  const speech = ctx.content.senseiSpeech.coaching;
  const seen = senseiRead(state, ctx);
  const danger = speech.dangers[seen.layer];
  const edge = edgeClause(speaker, speech, seen.edge, read);
  const work =
    read.gift === read.next
      ? speech.assignGift
      : edge !== null && read.next === seen.edge
        ? speaker.pick('coach-assign-more', speech.assignMore[speaker.feedback])
        : said(speaker, speaker.pick('coach-assign', speech.assign[speaker.feedback]), {
            stat: label(read.next),
          });
  const gift = read.gift ? said(speaker, speech.gift, { stat: label(read.gift) }) : null;
  return [
    ...verdictSaid(speaker, speech, read.verdict),
    ...(gift ? [`${capitalise(gift)}.`] : []),
    edge ? `${edge}, but ${danger}.` : `${capitalise(danger)}.`,
    work,
  ];
}

/**
 * The word as one paragraph: how they start, what beat you, then all they have to say in one
 * quotation, and what they give for the work last, as what they do.
 */
function wordOf(state: GameState, ctx: GameContext, speaker: Speaker, read: Read): string {
  const speech = ctx.content.senseiSpeech.coaching;
  const opening = read.verdict
    ? verdictOpening(speaker, speech, read.verdict)
    : {
        narration: [
          said(speaker, speaker.pick('coach-opening', speech.opening), {
            place: meetingPlace(ctx),
          }),
        ],
        ownVoice: false,
      };
  const beaten = state.mentor.lastBeaten
    ? [said(speaker, speech.beaten), state.mentor.lastBeaten]
    : [];
  const forms = pronounForms(pronounsOf(speaker.sensei));
  const attribution = opening.ownVoice
    ? `${forms.they} go${forms.es} on`
    : `${forms.they} say${forms.s}`;
  const quote = spoken(readSentences(state, ctx, speaker, read), attribution);
  const given = read.verdict?.given?.line;
  return [...opening.narration, ...beaten, quote, ...(given ? [given] : [])].join(' ');
}

/** After the weekly lesson: the verdict, a gift seen, the read and the next assignment. */
export function coachAfterLesson(state: GameState, ctx: GameContext, sensei: PersonDef): GameState {
  if (!sensei.sensei || !underSensei(state)) return state;
  const verdict = judge(state, ctx, sensei);
  const seen = reveal(verdict?.state ?? state, ctx, sensei);
  const set = assign(seen.state, ctx, sensei);
  const speaker = speakerFor(state, sensei, `${state.board.seed}|${state.time.day}`);
  const text = wordOf(seen.state, ctx, speaker, { verdict, gift: seen.gift, next: set.stat });
  return log(
    { ...set.state, told: speaker.told(), mentor: { ...set.state.mentor, lastBeaten: null } },
    {
      heading: `${sensei.name}’s word`,
      text,
      tone: 'info',
      chips: [...(verdict?.chips ?? []), ...seen.chips, ...set.chips],
    },
  );
}
