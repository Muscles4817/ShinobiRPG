import { stepWords, type LadderStep } from '@/systems/techniques';

/** How the fight screen marks an open ladder: "Third gate open". */
export function stepStatus(opened: LadderStep): string {
  const words = stepWords(opened).replace(/^the /, '');
  return `${words.charAt(0).toUpperCase()}${words.slice(1)} open`;
}
