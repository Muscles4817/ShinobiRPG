import type { GreetingCause } from './greetings';
import type { ContentPack, LocationDef } from './types';

/**
 * Towns' greetings (`LocationDef.greetings`): a village held against is a real one and not the
 * town itself, each cause is held once, and every greeting has words for the village screen.
 */
function causeKey(cause: GreetingCause): string {
  return cause.kind === 'from' ? `from:${cause.locationId}` : cause.kind;
}

function locationProblems(pack: ContentPack, location: LocationDef): string[] {
  const at = `location "${location.id}"`;
  const greetings = location.greetings ?? [];
  const keys = greetings.map((g) => causeKey(g.cause));
  return [
    ...greetings.flatMap((g) => {
      const { cause } = g;
      const unknown =
        cause.kind === 'from' && !pack.locations.some((l) => l.id === cause.locationId);
      return [
        ...(unknown ? [`${at} holds a grudge against unknown "${cause.locationId}"`] : []),
        ...(cause.kind === 'from' && cause.locationId === location.id
          ? [`${at} holds a grudge against itself`]
          : []),
        ...(g.line.trim() === '' ? [`${at} has a greeting with no words`] : []),
      ];
    }),
    ...keys
      .filter((k, i) => keys.indexOf(k) !== i)
      .map((k) => `${at} holds "${k}" against you twice`),
  ];
}

export function validateGreetings(pack: ContentPack): string[] {
  return pack.locations.flatMap((l) => locationProblems(pack, l));
}
