import type { PersonDef, SenseiFeedback } from '@/content';
import { addPoints } from '@/systems/bonds';

import type { GameContext } from '../context';
import { mentorOf } from './plan';
import { bondOf } from '../people/cast';
import { teachSignature } from '../people/signatures';
import { teachingOf } from '../people/teachers';
import { chip, log } from '../ops';
import type { GameState } from '../state';
import { rewardFor } from './rewards';
import { waysOf } from './generate';

/**
 * The end of the genin years: at your chūnin ceremony, your sensei finds you after. Their
 * words in their manner, a parting gift (the rest of their next signature, else what they like
 * to give), a memory you share, and the work they set is done with. After it they are a
 * teacher like any other, with no price, and the week is yours.
 */

/** Bond with your sensei at the farewell. */
export const FAREWELL_BOND = 10;
/** Sessions' worth of their next signature they pour into the parting gift, at most. */
const PARTING_LESSONS = 12;

const FAREWELL_WORDS: Readonly<Record<SenseiFeedback, string>> = {
  blunt: '“You’ll do. You always would have.”',
  warm: '“I’m so proud of you. Come and find me. Often.”',
  socratic: '“So. What will you teach, now that you’re the one people follow?”',
  competitive: '“Now you’re almost worth beating properly. Almost.”',
  cryptic: '“The river reaches the sea. It is still the river.”',
};

export interface Farewell {
  readonly sensei: PersonDef;
  readonly words: string;
}

/** The farewell due at this ceremony: a genin's chūnin ceremony, with a sensei. */
export function farewellDue(state: GameState, ctx: GameContext): Farewell | null {
  if (state.exams.ceremony?.rank !== 'chunin') return null;
  const sensei = mentorOf(state, ctx);
  const feedback = sensei ? waysOf(sensei)?.feedback : undefined;
  if (!sensei || !feedback) return null;
  // A sensei with a voice of their own ends on the thing they always said.
  const catchphrase = sensei.sensei?.voice?.catchphrase;
  const last = catchphrase ? ` And then, one last time: “${catchphrase}”` : '';
  return {
    sensei,
    words: `${sensei.name} finds you after the ceremony. ${FAREWELL_WORDS[feedback]}${last}`,
  };
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

export interface Parted {
  readonly state: GameState;
  /** What they gave you, for the record. */
  readonly gift: string;
}

function parting(state: GameState, ctx: GameContext, sensei: PersonDef): Parted {
  const signature = partingSignature(state, ctx, sensei);
  if (signature) return signature;
  const reward = rewardFor(state, ctx, sensei);
  return { state: reward.state, gift: reward.chip.label };
}

/** The farewell, kept: the gift, the bond, the memory, and the work set is done with. */
export function partWays(state: GameState, ctx: GameContext, farewell: Farewell): Parted {
  const { sensei } = farewell;
  const given = parting(state, ctx, sensei);
  const after = given.state;
  const bond = addPoints(bondOf(after, sensei.id), FAREWELL_BOND);
  const memory = { personId: sensei.id, text: 'the day you made chūnin', day: after.time.day };
  const parted: GameState = {
    ...after,
    character: { ...after.character, assignment: null },
    people: { ...after.people, bonds: { ...after.people.bonds, [sensei.id]: bond } },
    village: { ...after.village, memories: [...after.village.memories, memory] },
  };
  return {
    state: log(parted, {
      heading: `${sensei.name}’s farewell`,
      text: farewell.words,
      tone: 'success',
      chips: [chip(given.gift, 'gain'), chip(`+${FAREWELL_BOND} bond`, 'gain')],
    }),
    gift: given.gift,
  };
}
