# Content pass: fish, the kitchen and the bestiary

The field book (`field-book-plan.md`) made the gaps plain: a page of fish with a handful of
entries, a foes page that fills from a short list. The systems are deep; the content isn't. This
pass fills the world before the next milestone needs it, in four steps, each its own branch.

## Where things stood

- **Fish.** Six catchable fish (river fish, sweetfish, eel, crayfish, mountain trout, the old
  catfish), all on one river's three spots. The `shore`, `marsh` and `mountain` biomes exist and
  nothing uses them: Port Shiomachi and the Land of Waves are fishing towns with nowhere to fish.
  Clams, squid and dried fish are only bought.
- **The kitchen.** About thirty-eight recipes; most fish dishes ask for `river-fish` by name.
- **Foes.** About thirty across `enemies.ts`, `jobs/`, the exam and the arcs, nearly all one-offs
  for one job. Bandits stop at the chief; the next step up is a deadly rogue. No samurai, trained
  archers, sea pirates, mercenaries or foreign shinobi; beasts are a tanuki, a macaque, a bear, a
  boar and a hound.
- **Foes carry nothing.** `EnemyDef` has no gear or pouch: a foe holds a blade because it knows
  a blade art (`bladeInHand`), and armour is the `armoured` trait. Enough for now.

## Decisions

- **Foes may be written before a job uses them.** The bestiary is content in its own right. A
  bench test fights every foe against a character of the grade its `danger` is meant for, so a
  foe nobody meets yet is still tuned and validated.
- **Shared content reaches every pack.** Fish, finds and recipes live in `content/shared/`; each
  pack places them. The fan pack gets its own shore places (the Land of Waves), as the original
  gets Shiomachi's.
- **No new combat rules in this pass.** Everything here is data the engine already reads:
  stats, techniques, traits, `healthScale`, retinues, drops.

## Step 1: fish and the kitchen

**Water to fish in.** Shared spot lists in `shared/wilds.ts` beside `RIVER_SPOTS`:

| Water          | Spots                                    | Placed at                               |
| -------------- | ---------------------------------------- | --------------------------------------- |
| Shore          | the breakwater, the rock pools, the sand | Shiomachi (original), the Land of Waves |
| Marsh          | the paddy ditches, the reed beds         | a marsh by each home village            |
| Mountain water | the plunge pool, the cold riffles        | ready for Mount Reikon when it opens    |
| River (more)   | the weir, added to the river's three     | every river                             |

**Fish, about thirty**, each with a `length` for the field book, spread over spot, season, hour
and cooking grade so the page takes a year to fill:

- River: river fish, sweetfish, eel, crayfish, dace, carp, freshwater crab, the old catfish.
- Mountain water: mountain trout, char, landlocked salmon.
- Marsh: loach, pond smelt, pond snail, softshell turtle.
- Shore: horse mackerel, sardine, sea bream, rockfish, flounder, octopus, squid by lamplight at
  night, turban shell, sea urchin, sand clams dug at low tide.
- Rare: a golden carp, a deep-water conger, a puffer (poisonous to a cook below grade, see below).

**Ingredient families.** `IngredientDef.family` (`white`, `oily`, `river`, `shellfish`) and a
recipe ingredient that may name a family instead of an id (`{ family: 'white', count: 1 }`):
any fish of the family will do, and the dish is named for the fish it was cooked with ("salt-grilled
char"). One recipe covers many fish, so a swap is never a copy, and the cooking plan's one-role
rule holds. The family's own recipes say which fish they take on the card.

**Recipes, about fifteen**, one role each (`cooking-plan.md`), by way of preparing fish:
salt-grilled, simmered in soy, raw slices (fresh only: caught today), tempura, miso-cured,
smoked, dried for the road (a `road` meal), hot pot for two, fish rice, a sea stock, the puffer
done right (a provision of its own, and a poor cook's afflicts the eater), octopus dumplings,
grilled turban shell, a whole sea bream for a celebration, eel over rice. Learned from new
cookbooks (a fisher's at Shiomachi, a marsh cook's at home), a fisher who teaches, and a job or
two's reward. Shiomachi's market fish stay sold; the shore's catches are what you bring in
yourself.

## Step 2: the bestiary, authored

About forty foes in `packs/<id>/bestiary/`, one file per faction, each faction a ladder from
`petty` or `armed` to `deadly`:

- **Bandits:** thug, archer, chief (existing) and a knife-man, a smoke-bomb cutpurse, a deserter
  who knows an earth or fire technique, a lieutenant. The missing middle: a technique or two, a
  little chakra.
- **Samurai:** spear foot soldier (armoured), samurai (pure kenjutsu, no chakra, a will that
  shrugs off illusions), samurai archer (trained, `sure` accuracy), rōnin, retainer captain. The
  warrior without chakra, with counterplay of their own.
- **Archers:** hunter, temple archer, border-garrison bowman; trained, not bandits.
- **Pirates:** boarder, harpoon thrower, captain, a pirate with a water technique who fights on
  the `lake` ground.
- **Others:** mercenaries, a warrior monk, an assassin, smugglers.
- **Beasts, by biome:** wolves (a pack), wild dog, boar, bear, monkey troop, river otter, snake,
  giant centipede, hornet swarm, crocodile or giant salamander in the marsh, wild horse, eagle,
  shark and moray at the shore. Plain animals: no chakra, no techniques; their kit is traits
  (swift, pack, brawler, coward), size is `healthScale`, and meat is `drops`.
- **Spirits:** a few more beside the wraiths and ghosts.

A bestiary bench (`src/test/bench/bestiary.test.ts`) fights each against the grade its danger
expects. Then some go into the job templates' fills so the board actually sends you after them.

## Step 3: the bestiary, templated

Foreign shinobi as templates expanded when the context is built, like the sensei pool
(`withSenseiPool`): an **archetype** (scout, frontliner, sensor, medic, trapper, captain) × a
**village** (its nature and school, from the pack) × a **grade** (genin, chūnin, jōnin) → an
ordinary `EnemyDef` with a stable id (`foe-<village>-<archetype>-<grade>`). Border jobs, exam
rivals and squads of three draw on them. **Named rogues** (missing-nin, the S-rank hunts) are the
same machinery with a name and a past drawn from the pack, plus a few authored for arcs.

## Step 4 (later): foes with gear

`EnemyDef.gear` and `items` riding into `CombatantSetup` as the player's do: a samurai's real
armour level, a pirate's smoke bombs, a spear's reach. An engine change, kept apart.

## Later still: chakra beasts

Animals changed by chakra over generations: beasts that use techniques, mimic, hide, or carry a
nature. They build on step 2's plain animals (the same kinds, grown strange), and reach into
companions (`systems/companions`) and summons. Designed when we get there; step 2 keeps plain
animals plain so the line between them is clear.
