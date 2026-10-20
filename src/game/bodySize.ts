import type { BodySize, CombatantSetup } from '@/systems/combat';

import type { GameContext } from './context';

/**
 * How big someone is in a fight: bred into their clan (`ClanDef.size`), human otherwise. Given
 * as the setup's `size`, left out for the human-sized.
 */
export function clanSize(
  clanId: string | undefined,
  ctx: GameContext,
): Pick<CombatantSetup, 'size'> {
  const size: BodySize | undefined = clanId ? ctx.content.clans.get(clanId)?.size : undefined;
  return size && size !== 'human' ? { size } : {};
}
