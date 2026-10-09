import type { Appearance, HairStyle, HeadbandPlace } from '@/systems/profile';
import type { TimeSlot } from '@/systems/time';

/**
 * Shorthand for authoring a person's appearance in content files. Marked side-effect free
 * so a release build can still tree-shake fan packs that call it at module level.
 */
/*#__NO_SIDE_EFFECTS__*/
export function look(
  hairStyle: HairStyle,
  colours: { hair: string; eyes: string; skin: string; outfit: string },
  headband: HeadbandPlace = 'forehead',
): Appearance {
  return {
    hairStyle,
    hairColour: colours.hair,
    eyeColour: colours.eyes,
    skinTone: colours.skin,
    outfitColour: colours.outfit,
    headband,
  };
}

/** A schedule for someone who keeps the same place all day and goes home at night. */
/*#__NO_SIDE_EFFECTS__*/
export function allDay(placeId: string): Record<TimeSlot, string | null> {
  return { morning: placeId, afternoon: placeId, evening: placeId, night: null };
}
