import { foeStancesNow } from './foeTeam';
import type { PlanFighter } from './state';
import { takeStance } from './team';

/**
 * Between rounds, foes who fight as a team look at the team again (`foeTeam.ts`): a cover whose
 * ward has fallen, or a back row left without the one who called the plays, takes up the stance
 * the fight now calls for, with its cards. A foe whose stance still fits keeps its plan as it is.
 */
export function foesRestanced(fighters: readonly PlanFighter[]): PlanFighter[] {
  const now = foeStancesNow(fighters);
  return fighters.map((f) => {
    const stance = now[f.id];
    if (!stance || JSON.stringify(stance) === JSON.stringify(f.stance)) return f;
    return takeStance(f, stance, fighters);
  });
}
