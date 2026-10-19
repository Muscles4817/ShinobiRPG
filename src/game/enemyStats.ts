import type { EnemyDef } from '@/content';
import { createStats, type Stats } from '@/systems/stats';
import { reservesFor } from '@/systems/vitals';

/**
 * An enemy's stat line. Their chakra is authored (`EnemyDef.maxChakra`), so their reserves are
 * whatever gives that chakra at their control: a beast with none has none to speak of.
 */
export function enemyStatLine(def: EnemyDef): Stats {
  const stats = createStats(def.baseStat, def.statBonuses);
  return { ...stats, reserves: reservesFor(def.maxChakra, stats.chakraControl) };
}
