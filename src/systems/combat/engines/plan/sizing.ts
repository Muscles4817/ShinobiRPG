import type { Body } from '../../rules/body';
import { sizeHealthScale } from '../../rules/size';

/**
 * Size and health in a planned fight: setups and outcomes speak the human scale, so a big body
 * has its health scaled up as the fight begins and reported back down when it ends
 * (`rules/size.ts`), and nothing outside the fight needs to know.
 */

/** A body with its health scaled to its bred size. */
export function sizedBody<B extends Body>(body: B): B {
  const scale = sizeHealthScale(body.size);
  if (scale === 1) return body;
  return {
    ...body,
    health: Math.round(body.health * scale),
    maxHealth: Math.round(body.maxHealth * scale),
  };
}

/** A fighter's health back on the human scale, for the outcome. */
export function humanHealth(f: Pick<Body, 'health' | 'size'>): number {
  const scale = sizeHealthScale(f.size);
  return scale === 1 ? f.health : Math.round(f.health / scale);
}
