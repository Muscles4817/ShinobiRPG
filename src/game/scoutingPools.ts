import { listed } from '@/core';
import type { EnemyDef } from '@/content';

import type { GameContext } from './context';

/**
 * What a read says of a foe's hive or dust (`EnemyDef.hive`, `dust`), once a glance has caught
 * it (`poolsSeen`): what they carry, and what undoes it, read from the strain's fears and the
 * dust's banes.
 */

export interface PoolNote {
  readonly label: string;
  readonly counter: string;
}

function capitalised(words: string): string {
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function hiveNote(strainId: string, ctx: GameContext): PoolNote | null {
  const strain = ctx.content.strains.get(strainId);
  if (!strain) return null;
  const kill = strain.fears.length === 1 ? 'kills' : 'kill';
  return {
    label: `Carries a hive of ${strain.name.toLowerCase()}.`,
    counter:
      strain.fears.length > 0
        ? `${capitalised(listed(strain.fears))} ${kill} the insects, and areas thin the hive.`
        : 'Areas thin the hive.',
  };
}

/** What scatters a kind of dust, as a counter. */
function scatteredBy(banes: readonly string[]): string {
  if (banes.length === 0) return 'Nothing scatters it: outlast what they carry.';
  const verb = banes.length === 1 && banes[0] !== 'heavy blows' ? 'scatters' : 'scatter';
  return `${capitalised(listed(banes))} ${verb} it.`;
}

/** A shield is outrun by speed and never meets an illusion. */
const SHIELD_COUNTER = 'Only real speed gets in before the shield rises, and illusions go past it.';

function dustNote(carried: NonNullable<EnemyDef['dust']>, ctx: GameContext): PoolNote | null {
  const dust = ctx.content.dusts.get(carried.dustId);
  if (!dust) return null;
  const kind = dust.name.toLowerCase();
  const banes = scatteredBy(dust.banes.map((b) => (b === 'heavy' ? 'heavy blows' : b)));
  return carried.shield
    ? {
        label: `Commands ${kind} that rises to shield them on its own.`,
        counter: `${SHIELD_COUNTER} ${banes}`,
      }
    : { label: `Commands ${kind}.`, counter: banes };
}

/** Notes on what you can tell a foe carries. */
export function poolNotes(
  def: EnemyDef,
  seen: { readonly hive: boolean; readonly dust: boolean },
  ctx: GameContext,
): PoolNote[] {
  const hive = seen.hive && def.hive ? hiveNote(def.hive.strainId, ctx) : null;
  const dust = seen.dust && def.dust ? dustNote(def.dust, ctx) : null;
  return [hive, dust].flatMap((n) => (n ? [n] : []));
}
