/**
 * Slips a reader notices at once, counted over golden transcripts: a slot left unfilled, a
 * number agreeing wrongly ("1 days"), a chip of "+0" or a fraction, straight quotes, a line
 * said twice in a row in a scene. Each is a count so a pass can drive it to zero.
 */

const RULES = {
  unfilledSlot: /\{[a-zA-Z.-]+\}/g,
  oneAsPlural: /\b1 (days|nights|hours|times|jobs|rounds|weeks)\b/g,
  zeroChip: /\[[^\]]*[+−-]0\]/g,
  fractionChip: /\[[^\]]*\d\.\d+[^\]]*\]/g,
  straightQuote: /"/g,
} as const;
export type Slip = keyof typeof RULES | 'repeatedLine';
export const SLIPS = [...(Object.keys(RULES) as (keyof typeof RULES)[]), 'repeatedLine'] as const;

/** How close together the same line may come back before it reads as a repeat. */
const REPEAT_WINDOW = 6;

function repeats(lines: readonly string[]): number {
  let count = 0;
  lines.forEach((line, i) => {
    const text = line.trim();
    if (
      text.split(/\s+/).length < 4 ||
      text.startsWith('>>>') ||
      /^[a-z]+(\[\d+\])?:$/.test(text)
    ) {
      return;
    }
    if (lines.slice(Math.max(0, i - REPEAT_WINDOW), i).some((l) => l.trim() === text)) count++;
  });
  return count;
}

export function slipsIn(transcript: string): Readonly<Record<Slip, number>> {
  const counts = Object.fromEntries(
    Object.entries(RULES).map(([k, re]) => [k, (transcript.match(re) ?? []).length]),
  ) as Record<Slip, number>;
  return { ...counts, repeatedLine: repeats(transcript.split('\n')) };
}
