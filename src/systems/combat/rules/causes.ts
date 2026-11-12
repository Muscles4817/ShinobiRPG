/**
 * Why something didn't happen, carried on the line that tells it (audit P1.1): why an attack
 * was slipped, why a hold didn't take, why a step failed. The engine works the reason out from
 * the same things its roll used and tags the line; the screen shows it as a stamp, in words,
 * never odds. A line carries at most one cause.
 */

export const NARRATION_CAUSES = [
  // An attack slipped.
  'saw-through',
  'foresaw',
  'evading',
  'dodge-ready',
  'familiar',
  'wild',
  'quicker',
  'read-it',
  'slipped',
  // A hold, daze, seal or drain that reached but didn't take.
  'braced',
  'resisted',
  // A step that failed.
  'held',
  'no-room',
  'outpaced',
  'cut-off',
  'kept-pace',
  'held-off',
] as const;
export type NarrationCause = (typeof NARRATION_CAUSES)[number];

export const CAUSE_MARKER = /\s*⟦c:([a-z-]+)⟧/;

/** A line, with why it went as it did. */
export function causeLine(text: string, cause: NarrationCause): string {
  return `${text} ⟦c:${cause}⟧`;
}

function isCause(word: string | undefined): word is NarrationCause {
  return NARRATION_CAUSES.some((c) => c === word);
}

/** The cause a line carries, if any. */
export function causeIn(line: string): { readonly cause?: NarrationCause } {
  const cause = CAUSE_MARKER.exec(line)?.[1];
  return isCause(cause) ? { cause } : {};
}
