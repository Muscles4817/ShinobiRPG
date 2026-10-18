import { DANGERS } from '@/systems/missions';

import type { ContentPack, EnemyDef } from './types';

/**
 * Foes' retinues (`EnemyDef.retinue`): every body named is a real enemy, never the foe
 * themselves, keeps no retinue of its own (one master, one level), and is no more dangerous
 * than its master, so a job's danger (read from the master) never understates it.
 */

function entryProblems(
  enemy: EnemyDef,
  enemies: ReadonlyMap<string, EnemyDef>,
): (entry: NonNullable<EnemyDef['retinue']>[number]) => string[] {
  return ({ enemyId }) => {
    const unit = enemies.get(enemyId);
    const at = `enemy "${enemy.id}" retinue "${enemyId}"`;
    if (!unit) return [`${at} is not an enemy`];
    if (unit.id === enemy.id) return [`${at} is the enemy themselves`];
    if (unit.retinue?.length) return [`${at} has a retinue of its own`];
    return DANGERS.indexOf(unit.danger) > DANGERS.indexOf(enemy.danger)
      ? [`${at} is more dangerous than its master`]
      : [];
  };
}

export function validateRetinues(pack: ContentPack): string[] {
  const enemies = new Map(pack.enemies.map((e) => [e.id, e]));
  return pack.enemies.flatMap((enemy) =>
    (enemy.retinue ?? []).flatMap(entryProblems(enemy, enemies)),
  );
}
