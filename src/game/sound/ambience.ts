/**
 * The sounds of the world behind the music, on the title screen: what the hour outside would
 * sound like in a village among the hills. Each is a bed the UI plays for as long as it is set
 * (`ui/audio/ambience.ts`), quietly, under the music.
 */
export const AMBIENCES = [
  'dawn-chorus',
  'birdsong',
  'evening',
  'night-wind',
  'rain',
  'snow-hush',
] as const;
export type Ambience = (typeof AMBIENCES)[number];
