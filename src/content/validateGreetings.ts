import type { GreetingCause } from './greetings';
import type { ContentPack, LocationDef } from './types';
import { worldMarksLeft } from './validateStory';

/**
 * Towns' greetings (`LocationDef.greetings`): a village held against is a real one and not the
 * town itself, each cause is held once, every greeting has words for the village screen, and
 * gates shut to you open on a world mark some job leaves, with words for the refusal.
 */
function causeKey(cause: GreetingCause): string {
  return cause.kind === 'from' ? `from:${cause.locationId}` : cause.kind;
}

function gateProblems(at: string, location: LocationDef, marks: ReadonlySet<string>): string[] {
  return (location.greetings ?? []).flatMap(({ shut }) => {
    if (!shut) return [];
    return [
      ...(marks.has(shut.until)
        ? []
        : [`${at} opens on "${shut.until}", which no job leaves behind`]),
      ...(shut.refusal.trim() === '' ? [`${at} shuts its gates with no words`] : []),
    ];
  });
}

function locationProblems(
  pack: ContentPack,
  location: LocationDef,
  marks: ReadonlySet<string>,
): string[] {
  const at = `location "${location.id}"`;
  const greetings = location.greetings ?? [];
  const keys = greetings.map((g) => causeKey(g.cause));
  return [
    ...gateProblems(at, location, marks),
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
  const marks = worldMarksLeft(pack);
  return pack.locations.flatMap((l) => locationProblems(pack, l, marks));
}
