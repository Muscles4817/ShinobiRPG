/**
 * Why something didn't happen, written on the line that tells it (audit P1.1): why an attack was
 * slipped, why a hold didn't take, why a step failed, and whom it is about (the `subject`: whose
 * attack, hold or step). The engine says it from the roll that decided it; the screen shows it as
 * a stamp, in words, never odds. A line carries at most one cause. Part of the narration module
 * (`narration.ts`): only it reads what a line carries.
 */

import {
  CAUSE_KIND,
  NARRATION_CAUSES,
  type NarrationCause,
  type ToldCause,
} from '../storyContract';

export { CAUSE_KIND, NARRATION_CAUSES, type NarrationCause } from '../storyContract';

const CAUSE_MARKER = /\s*⟦c:([a-z-]+)(?:\|([^⟧]*))?⟧/;

/** A line, with why it went as it did and for whom. */
export function causeLine(text: string, cause: NarrationCause, subject: string): string {
  return `${text} ⟦c:${cause}|${subject}⟧`;
}

function isCause(word: string | undefined): word is NarrationCause {
  return NARRATION_CAUSES.some((c) => c === word);
}

/** The cause a line carries, if any. */
export function causeIn(line: string): { readonly cause?: ToldCause } {
  const found = CAUSE_MARKER.exec(line);
  const cause = found?.[1];
  if (!isCause(cause)) return {};
  const subject = found?.[2];
  return { cause: { cause, kind: CAUSE_KIND[cause], ...(subject ? { subject } : {}) } };
}
