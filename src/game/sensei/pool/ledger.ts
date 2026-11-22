import type { SenseiPast, SenseiPastLedger } from '@/content';
import type { Outcome } from '@/systems/missions';

/**
 * A past's ledger line for one moment of its arc, filled, with whose deed it tells as the past
 * declares it (`ledgerSubjects`): the debrief gives the rest a "you".
 */
export function ledgerOf(
  past: SenseiPast,
  key: keyof SenseiPastLedger,
  fill: (text: string) => string,
): Pick<Outcome, 'ledger' | 'ledgerSubject'> {
  const subject = past.arc.ledgerSubjects?.[key];
  return { ledger: fill(past.arc.ledger[key]), ...(subject ? { ledgerSubject: subject } : {}) };
}
