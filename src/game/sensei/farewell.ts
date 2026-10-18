import type { PersonDef, SenseiReward } from '@/content';
import { addPoints } from '@/systems/bonds';
import type { Told } from '@/systems/telling';

import type { GameContext } from '../context';
import { mentorOf } from './plan';
import { bondOf } from '../people/cast';
import { teachSignature } from '../people/signatures';
import { teachingOf } from '../people/teachers';
import { chip, log } from '../ops';
import type { GameState } from '../state';
import { rewardFor } from './rewards';
import { waysOf } from './generate';
import { lowerFirst, said, speakerFor, spoken } from './voice';

/**
 * The end of the genin years: at your chūnin ceremony, your sensei finds you after. Their
 * words in their manner, a parting gift (the rest of their next signature, else what they like
 * to give) told in the same breath, a memory you share, and the work they set is done with.
 * After it they are a teacher like any other, with no price, and the week is yours.
 */

/** Bond with your sensei at the farewell. */
export const FAREWELL_BOND = 10;
/** Sessions' worth of their next signature they pour into the parting gift, at most. */
const PARTING_LESSONS = 12;

export interface Farewell {
  readonly sensei: PersonDef;
  /** Their farewell, one paragraph: what they say, what they give, how they go. */
  readonly words: string;
}

export interface Parted {
  readonly state: GameState;
  readonly kind: SenseiReward;
  /** What they gave you, by name, for their words. */
  readonly gift: string;
  /** The same, for the record. */
  readonly label: string;
}

/** The rest of their next signature, all at once; null when they have none to give you yet. */
function partingSignature(state: GameState, ctx: GameContext, sensei: PersonDef) {
  const teaching = teachingOf(state, sensei);
  let book = state.techniques;
  let name: string | null = null;
  for (let i = 0; teaching && i < PARTING_LESSONS; i++) {
    const taught = teachSignature({ ...state, techniques: book }, ctx, teaching);
    if (!taught) break;
    book = taught.book;
    name = taught.name;
    if (taught.mastered) break;
  }
  return name ? { state: { ...state, techniques: book }, gift: name } : null;
}

function parting(state: GameState, ctx: GameContext, sensei: PersonDef): Parted {
  const signature = partingSignature(state, ctx, sensei);
  if (signature) return { ...signature, kind: 'signature', label: signature.gift };
  const reward = rewardFor(state, ctx, sensei);
  return { state: reward.state, kind: reward.kind, gift: reward.gift, label: reward.chip.label };
}

interface Spoken extends Farewell {
  readonly told: Told;
  readonly parted: Parted;
}

/** The farewell in their manner, the gift named in it, and their catchphrase to end on. */
function farewellOf(state: GameState, ctx: GameContext, sensei: PersonDef): Spoken {
  const speech = ctx.content.senseiSpeech.coaching.farewell;
  const speaker = speakerFor(state, sensei, `${state.board.seed}|farewell`);
  const parted = parting(state, ctx, sensei);
  const catchphrase = sensei.sensei?.voice?.catchphrase;
  const lines = [
    speaker.pick('farewell-opening', speech.opening),
    speaker.pick('farewell-words', speech.words[speaker.feedback]),
    speech.gifts[parted.kind],
  ].map((line) => said(speaker, line, { gift: parted.gift }));
  // The attribution follows the quote mid-sentence, so it stays lower case.
  const last = catchphrase
    ? spoken([catchphrase], lowerFirst(said(speaker, speech.catchphrase)))
    : said(speaker, speaker.pick('farewell-closing', speech.closing));
  const words = [...lines, last].join(' ');
  return { sensei, words, told: speaker.told(), parted };
}

/** The farewell due at this ceremony: a genin's chūnin ceremony, with a sensei. */
export function farewellDue(state: GameState, ctx: GameContext): Farewell | null {
  if (state.exams.ceremony?.rank !== 'chunin') return null;
  const sensei = mentorOf(state, ctx);
  if (!sensei || !waysOf(sensei)) return null;
  const { words } = farewellOf(state, ctx, sensei);
  return { sensei, words };
}

/** The farewell, kept: the gift, the bond, the memory, and the work set is done with. */
export function partWays(state: GameState, ctx: GameContext, farewell: Farewell): Parted {
  const { sensei } = farewell;
  const spoken = farewellOf(state, ctx, sensei);
  const given = spoken.parted;
  const after = { ...given.state, told: spoken.told };
  const bond = addPoints(bondOf(after, sensei.id), FAREWELL_BOND);
  const memory = { personId: sensei.id, text: 'the day you made chūnin', day: after.time.day };
  const parted: GameState = {
    ...after,
    character: { ...after.character, assignment: null },
    people: { ...after.people, bonds: { ...after.people.bonds, [sensei.id]: bond } },
    village: { ...after.village, memories: [...after.village.memories, memory] },
  };
  return {
    ...given,
    state: log(parted, {
      heading: `${sensei.name}’s farewell`,
      text: spoken.words,
      tone: 'success',
      chips: [chip(given.label, 'gain'), chip(`+${FAREWELL_BOND} bond`, 'gain')],
    }),
  };
}
