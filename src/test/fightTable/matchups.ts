import type { Matchup } from './table';

/**
 * The canon questions the fight table asks of the fan pack: equals of a rank, fights across
 * ranks, a specialist against an all-rounder at the top, a big-bodied clan fighter against a
 * thinker, a genius genin against an ordinary chūnin, and the foes of the first arcs.
 */

function row(group: string, a: string, b: string): Matchup {
  return { group, a: `person:${a}`, b: b.includes(':') ? b : `person:${b}` };
}

export const NARUTO_MATCHUPS: readonly Matchup[] = [
  row('Same rank: genin', 'naruto', 'sasuke'),
  row('Same rank: genin', 'neji', 'lee'),
  row('Same rank: genin', 'kiba', 'shino'),
  row('Same rank: genin', 'sakura', 'ino'),
  row('Same rank: chūnin', 'izumo', 'kotetsu'),
  row('Same rank: jōnin', 'asuma', 'kurenai'),
  row('Same rank: jōnin', 'kakashi', 'asuma'),
  row('Cross-rank: genin against chūnin', 'sasuke', 'iruka'),
  row('Cross-rank: genin against chūnin', 'naruto', 'izumo'),
  row('Cross-rank: chūnin against jōnin', 'iruka', 'asuma'),
  row('Cross-rank: genin against jōnin', 'sasuke', 'kakashi'),
  row('Cross-rank: jōnin against kage', 'kakashi', 'hiruzen'),
  row('Specialist against all-rounder', 'guy', 'kakashi'),
  row('Specialist against all-rounder', 'guy', 'hiruzen'),
  row('Specialist against all-rounder', 'lee', 'neji'),
  row('Specialist against all-rounder', 'kurenai', 'kakashi'),
  row('Body against mind', 'choji', 'shikamaru'),
  row('Body against mind', 'choza', 'shikaku'),
  row('Genius genin against chūnin', 'shikamaru', 'izumo'),
  row('Genius genin against chūnin', 'neji', 'kotetsu'),
  row('Canon foes', 'kakashi', 'enemy:zabuza'),
  row('Canon foes', 'sasuke', 'enemy:haku'),
  row('Canon foes', 'naruto', 'enemy:haku'),
  row('Canon foes', 'shikamaru', 'enemy:kin'),
];
