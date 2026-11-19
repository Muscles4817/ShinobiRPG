/**
 * Matrix pairs outside the band at `MATRIX_SEEDS` when the matrix landed (audit P0.3), by the
 * row's build: the opponents it beats or loses to too surely. The work list for tuning (P4.1).
 * Remove a pair once it comes inside; never add one to let a change through without saying why
 * in its pull request. The gate opener and the set-up killer were rebuilt from the original
 * pack's own Seven Wicks and killing blow (P5.1): the killer's bench-only blow had no rank, so
 * it hit as hard as an E-rank technique of its power, and a real B-rank one leaves the build
 * outmatched by nearly everyone; the wicks, with an art that needs them lit, made the opener
 * stronger.
 * Rushing in and holding ground were adopted for every fight (`docs/design/combat-ai-plan.md`
 * Part 13b, Phase B): a closer's step lands a light blow, so fighters who keep their distance lose
 * more to those who close (the sensor, trapper and illusionist to the rusher, the puppeteer to
 * the powerhouse), read move by move as kiters caught by someone faster. Most of the rest are one
 * fight in eight past the band.
 * Chakra comes back by the tank's doublings, not as a share of it (the jutsu audit,
 * `prototypes/jutsu-audit/RESULTS.md`), so a medic heals less often over a long fight (the
 * illusionist outlasts them) and the sensor's long game ebbs (foresight outlasts it).
 * Chakra costs read from what a technique does, never its rank (`rules/worth.ts`, Part 13c): a
 * wide area costs four times a single target, and a kick moulded with chakra pays for it, so the
 * area caster (a deep well and a cheap shot now, as the owner chose) is weak at chūnin until its
 * reserves grow, the medic and the gate opener trade differently, and plain body moves gain.
 * Illusions are a contest of chakra control (`rules/verbs/use.ts`, `plan/braced.ts`): the cloner's
 * control fights the illusionist's illusions off, and a braced mind shakes them loose.
 */
const OUTLIERS_BY_BUILD: Readonly<Record<string, string>> = {
  rusher:
    'powerhouse versatile stalker sealer sensor cloner summoner puppeteer hive dust gates assassin foresight mimic illusionist areaCaster trapper medic',
  powerhouse:
    'sealer trapper medic cloner summoner puppeteer hive dust assassin rusher areaCaster sensor shrouded',
  versatile:
    'rusher powerhouse stalker areaCaster sealer trapper medic sensor cloner counterer summoner puppeteer hive dust assassin foresight mimic gates',
  illusionist:
    'stalker mistBlade areaCaster sealer trapper sensor counterer shrouded summoner puppeteer hive dust gates assassin medic cloner',
  stalker:
    'powerhouse illusionist sealer trapper medic counterer shrouded summoner puppeteer hive dust assassin foresight mimic cloner areaCaster sensor',
  mistBlade:
    'illusionist sealer trapper medic sensor cloner counterer summoner puppeteer hive dust assassin foresight mimic gates areaCaster',
  areaCaster:
    'powerhouse versatile illusionist trapper medic sensor cloner counterer summoner puppeteer hive dust assassin foresight mimic rusher stalker mistBlade shrouded gates',
  sealer:
    'rusher powerhouse versatile illusionist stalker mistBlade medic sensor cloner counterer shrouded summoner puppeteer hive dust gates assassin foresight mimic areaCaster',
  trapper:
    'versatile illusionist stalker mistBlade areaCaster sealer medic cloner counterer shrouded summoner puppeteer hive dust gates assassin foresight mimic rusher powerhouse',
  medic:
    'rusher powerhouse versatile stalker mistBlade sealer trapper summoner puppeteer hive dust assassin foresight mimic areaCaster sensor illusionist cloner counterer shrouded gates',
  sensor:
    'versatile illusionist mistBlade areaCaster sealer trapper cloner counterer summoner puppeteer hive assassin foresight mimic rusher medic',
  cloner:
    'rusher powerhouse versatile stalker mistBlade areaCaster sealer trapper medic sensor shrouded puppeteer hive dust assassin foresight mimic gates illusionist',
  counterer:
    'versatile illusionist stalker areaCaster sealer trapper medic cloner shrouded summoner puppeteer hive dust assassin foresight mimic rusher',
  shrouded:
    'illusionist sealer cloner counterer summoner puppeteer hive dust gates powerhouse areaCaster medic assassin',
  summoner:
    'powerhouse illusionist stalker trapper counterer puppeteer hive dust assassin gates areaCaster mimic',
  puppeteer:
    'rusher versatile illusionist stalker mistBlade areaCaster sealer trapper medic sensor cloner counterer shrouded dust gates assassin foresight mimic powerhouse',
  hive: 'rusher powerhouse versatile illusionist stalker mistBlade areaCaster sealer trapper medic sensor cloner counterer shrouded summoner puppeteer dust gates foresight mimic assassin',
  dust: 'rusher powerhouse versatile illusionist stalker mistBlade areaCaster sealer trapper medic sensor cloner counterer shrouded summoner puppeteer hive gates assassin foresight mimic',
  gates:
    'rusher illusionist stalker areaCaster sealer medic shrouded summoner puppeteer hive dust trapper assassin',
  assassin:
    'rusher powerhouse versatile illusionist stalker mistBlade areaCaster sealer trapper medic sensor cloner counterer shrouded summoner hive dust gates foresight mimic',
  foresight:
    'rusher powerhouse versatile illusionist mistBlade sealer trapper medic cloner puppeteer hive dust assassin areaCaster shrouded sensor gates',
  mimic:
    'rusher powerhouse versatile illusionist mistBlade sealer trapper medic cloner puppeteer hive dust assassin areaCaster shrouded gates',
};

/** The same list as `attacker>defender` pairs. */
export const KNOWN_OUTLIERS: readonly string[] = Object.entries(OUTLIERS_BY_BUILD).flatMap(
  ([a, foes]) => foes.split(' ').map((b) => `${a}>${b}`),
);
