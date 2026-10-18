import type { GearDef } from '@/content';

import type { GameContext } from '../context';

/** The vest a new chūnin is handed: the pack's plainest flak armour. */
export function chuninVest(ctx: GameContext): GearDef | null {
  const vests = ctx.content.gear.all.filter(
    (g) => g.kind === 'armour' && g.level === 'flak' && g.unique !== true,
  );
  return [...vests].sort((a, b) => a.cost - b.cost)[0] ?? null;
}
