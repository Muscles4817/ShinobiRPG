import type { CombatantView } from '@/game';

import type { HealthPulse } from './useHealthPulses';

/**
 * A fighter's health bar. When their health just moved it flashes (red for a hit, green for
 * healing); the pulse's count is the key, so each change plays afresh.
 */
export function HealthBar({
  fighter,
  pulse,
  mine = false,
}: {
  readonly fighter: CombatantView;
  readonly pulse: HealthPulse | undefined;
  readonly mine?: boolean;
}) {
  return (
    <span key={pulse?.n ?? 0} className={mine ? 'hp mine' : 'hp'} data-pulse={pulse?.kind}>
      <i style={{ width: `${(fighter.health / fighter.maxHealth) * 100}%` }} />
    </span>
  );
}
