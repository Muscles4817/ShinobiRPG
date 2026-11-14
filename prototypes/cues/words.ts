import type { Prediction } from './infer';
import { CLASS_WORDS } from './profile';

/**
 * What the foe panel would say: the inference in graded words, never a number. A name only
 * when the evidence carries one; otherwise the class, hedged by the confidence word.
 */
const HEDGE = { sure: '', 'fairly sure': 'Likely ', maybe: 'Perhaps ' } as const;

export function readLine(p: Prediction | null, nameOf: (id: string) => string): string {
  if (!p) return 'You can’t see them.';
  if (p.feint) return 'Something about it rings false: maybe a feint.';
  if (p.named)
    return `${HEDGE[p.confidence]}${nameOf(p.named)}: ${p.confidence}.`.replace(/^./, (c) =>
      c.toUpperCase(),
    );
  const what = CLASS_WORDS[p.predicted];
  const said = `${HEDGE[p.confidence]}${what}`;
  return `${said.charAt(0).toUpperCase()}${said.slice(1)}: ${p.confidence}.`;
}
