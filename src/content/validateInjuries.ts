import { INJURY_CAUSES, type InjuryDef } from './injuries';
import type { ContentPack } from './types';

/**
 * Injuries must make sense: they last some days, only weaken (fight multipliers between 0
 * and 1), and every cause has at least one injury to give, with a bed-rest one for collapse.
 */
export function validateInjuries(pack: ContentPack): string[] {
  const problems = pack.injuries.flatMap(injuryProblems);
  for (const cause of INJURY_CAUSES) {
    if (!pack.injuries.some((i) => i.causes.includes(cause))) {
      problems.push(`pack needs an injury caused by ${cause}`);
    }
  }
  if (!pack.injuries.some((i) => i.causes.includes('collapse') && i.bedridden)) {
    problems.push('pack needs a collapse injury that keeps you in bed');
  }
  return problems;
}

function injuryProblems(injury: InjuryDef): string[] {
  const problems: string[] = [];
  if (injury.days <= 0) problems.push(`injury "${injury.id}" must last at least a day`);
  if (injury.causes.length === 0) problems.push(`injury "${injury.id}" has no cause`);
  const multipliers = Object.values(injury.fight);
  if (multipliers.length === 0 || multipliers.some((m) => m <= 0 || m > 1)) {
    problems.push(`injury "${injury.id}" needs fight multipliers between 0 and 1`);
  }
  return problems;
}
