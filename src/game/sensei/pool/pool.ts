import type { ContentPack, LocationDef } from '@/content';

import { composeSensei, type Composed } from './compose';

/**
 * The pool of generated senseis a pack offers (`docs/design/sensei-generation-plan.md`): one
 * for every past and every temperament that can carry it, composed when the game's context is
 * built, so they are ordinary content (people, talk, foes, jobs, arcs) every system already
 * reads and validation already checks. Which of them a save meets is drawn from its seed
 * (`game/people/pooled.ts`).
 */

/** Every sensei the pack's parts make, in a fixed order. */
export function composePool(pack: ContentPack): Composed[] {
  const { temperaments, pasts } = pack.senseiParts;
  return pasts.flatMap((past) =>
    temperaments
      .filter((t) => past.temperaments.includes(t.id))
      .flatMap((temperament) => composeSensei(pack, { temperament, past }) ?? []),
  );
}

/** The start village with the arcs' jobs posted at its mission hall. */
function withJobsPosted(location: LocationDef, jobIds: readonly string[]): LocationDef {
  const places = location.places.map((place) =>
    place.kind === 'missions' ? { ...place, missionIds: [...place.missionIds, ...jobIds] } : place,
  );
  return { ...location, places };
}

const pooled = new WeakMap<ContentPack, ContentPack>();

/** The pack with its pool of generated senseis composed in. */
export function withSenseiPool(pack: ContentPack): ContentPack {
  const known = pooled.get(pack);
  if (known) return known;
  const pool = composePool(pack);
  const jobs = pool.flatMap((s) => s.missions);
  const jobIds = jobs.map((m) => m.id);
  const expanded: ContentPack = {
    ...pack,
    people: [...pack.people, ...pool.map((s) => s.person)],
    conversations: [...pack.conversations, ...pool.flatMap((s) => s.conversations)],
    enemies: [...pack.enemies, ...pool.map((s) => s.enemy)],
    missions: [...pack.missions, ...jobs],
    arcs: [...pack.arcs, ...pool.map((s) => s.arc)],
    locations: pack.locations.map((l) =>
      l.id === pack.startLocationId ? withJobsPosted(l, jobIds) : l,
    ),
  };
  pooled.set(pack, expanded);
  return expanded;
}
