/**
 * Matrix pairs outside the band at `MATRIX_SEEDS` when the matrix landed (audit P0.3), by the
 * row's build: the opponents it beats or loses to too surely. The work list for tuning (P4.1).
 * Remove a pair once it comes inside; never add one to let a change through without saying why
 * in its pull request.
 */
const OUTLIERS_BY_BUILD: Readonly<Record<string, string>> = {
  rusher:
    'powerhouse versatile stalker sealer sensor cloner summoner puppeteer hive dust assassin foresight mimic',
  powerhouse: 'sealer trapper medic cloner summoner puppeteer hive dust gates',
  versatile:
    'rusher powerhouse stalker areaCaster sealer trapper medic sensor cloner counterer summoner puppeteer hive dust gates foresight mimic',
  illusionist:
    'stalker mistBlade areaCaster sealer trapper sensor counterer shrouded summoner puppeteer hive dust gates',
  stalker:
    'powerhouse illusionist sealer trapper medic counterer shrouded summoner puppeteer hive dust assassin foresight mimic',
  mistBlade:
    'illusionist sealer trapper medic sensor cloner counterer summoner puppeteer hive dust foresight mimic',
  areaCaster:
    'powerhouse versatile illusionist trapper medic sensor cloner counterer summoner puppeteer hive dust foresight mimic',
  sealer:
    'rusher powerhouse versatile illusionist stalker mistBlade medic sensor cloner counterer shrouded summoner puppeteer hive dust gates assassin foresight mimic',
  trapper:
    'versatile illusionist stalker mistBlade areaCaster sealer medic cloner counterer shrouded summoner puppeteer hive dust foresight mimic',
  medic:
    'rusher powerhouse versatile stalker mistBlade sealer trapper summoner puppeteer hive dust gates foresight mimic',
  sensor:
    'versatile illusionist mistBlade areaCaster sealer trapper cloner counterer summoner puppeteer hive assassin foresight mimic',
  cloner:
    'rusher powerhouse versatile stalker mistBlade areaCaster sealer trapper medic sensor shrouded puppeteer hive dust gates assassin foresight mimic',
  counterer:
    'versatile illusionist stalker areaCaster sealer trapper medic cloner shrouded summoner puppeteer hive dust foresight mimic',
  shrouded: 'illusionist sealer cloner counterer summoner puppeteer hive dust gates',
  summoner: 'powerhouse illusionist stalker trapper counterer puppeteer hive dust',
  puppeteer:
    'rusher versatile illusionist stalker mistBlade areaCaster sealer trapper medic sensor cloner counterer shrouded dust gates foresight mimic',
  hive: 'rusher powerhouse versatile illusionist stalker mistBlade areaCaster sealer trapper medic sensor cloner counterer shrouded summoner puppeteer dust gates assassin foresight mimic',
  dust: 'rusher powerhouse versatile illusionist stalker mistBlade areaCaster sealer trapper medic sensor cloner counterer shrouded summoner puppeteer hive gates assassin foresight mimic',
  gates:
    'powerhouse illusionist mistBlade areaCaster sealer medic cloner summoner puppeteer hive dust foresight mimic',
  assassin:
    'powerhouse versatile illusionist stalker mistBlade areaCaster sealer trapper sensor cloner counterer shrouded hive dust',
  foresight:
    'rusher powerhouse versatile illusionist mistBlade sealer trapper medic cloner puppeteer hive dust assassin',
  mimic:
    'rusher powerhouse versatile illusionist mistBlade sealer trapper medic cloner puppeteer hive dust',
};

/** The same list as `attacker>defender` pairs. */
export const KNOWN_OUTLIERS: readonly string[] = Object.entries(OUTLIERS_BY_BUILD).flatMap(
  ([a, foes]) => foes.split(' ').map((b) => `${a}>${b}`),
);
