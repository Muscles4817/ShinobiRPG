import type { Threat } from '@/game';

const TONE: Readonly<Record<Threat, string>> = {
  'much-weaker': 'gain',
  weaker: 'gain',
  even: 'cost',
  stronger: 'harm',
  'much-stronger': 'harm',
};

/** "Stronger than you" in the colour of how worried you should be. */
export function ThreatChip({ threat, label }: { readonly threat: Threat; readonly label: string }) {
  return <span className={`chip ${TONE[threat]}`}>{label}</span>;
}
