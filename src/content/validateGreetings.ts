import type { GreetingCause, HuntDef, HuntStop } from './greetings';
import type { ContentPack, LocationDef } from './types';
import { worldMarksLeft } from './validateStory';

/**
 * Towns' greetings (`LocationDef.greetings`): a village held against is a real one and not the
 * town itself, each cause is held once, every greeting has words for the village screen, and
 * gates shut to you open on a world mark some job leaves, with words for the refusal, and a hunt
 * looks for you on real roads, sends real foes, and asks at each stop a question with at least two
 * answers, each bringing the hunters 0 to 2 closer, one of them not at all.
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

/** The most one answer may bring the hunters closer. */
const MOST_HEAT = 2;

function stopProblems(at: string, name: string, stop: HuntStop): string[] {
  const heats = stop.answers.map((a) => a.heat);
  return [
    ...(stop.text.trim() === '' ? [`${at} asks nothing at its ${name} stop`] : []),
    ...(stop.answers.length < 2 ? [`${at} offers one answer or none at its ${name} stop`] : []),
    ...(heats.some((h) => !Number.isInteger(h) || h < 0 || h > MOST_HEAT)
      ? [`${at} has an answer at its ${name} stop that isn't 0 to ${MOST_HEAT} closer`]
      : []),
    ...(heats.includes(0) ? [] : [`${at} has no careful answer at its ${name} stop`]),
  ];
}

function huntProblems(pack: ContentPack, at: string, hunt: HuntDef): string[] {
  const regions = new Set(pack.roadEvents.flatMap((e) => e.regions));
  return [
    ...hunt.regions
      .filter((r) => !regions.has(r))
      .map((r) => `${at} hunts on region "${r}", which has no road events`),
    ...(hunt.hunterIds.length === 0 ? [`${at} hunts with nobody`] : []),
    ...hunt.hunterIds
      .filter((id) => !pack.enemies.some((e) => e.id === id))
      .map((id) => `${at} hunts with unknown foe "${id}"`),
    ...stopProblems(at, 'travel', hunt.travel),
    ...stopProblems(at, 'sleep', hunt.sleep),
    ...(hunt.found.trim() === '' ? [`${at} finds you with no words`] : []),
  ];
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
    ...greetings.flatMap((g) => (g.hunt ? huntProblems(pack, at, g.hunt) : [])),
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
