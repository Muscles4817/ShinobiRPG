# Cooking overhaul: review, decisions, plan

Working document for turning the kitchen into a game of its own: a library of recipes to
learn, ingredients to gather across the world, and food that does many different jobs.
Part 1 is the review. Part 2 records what we agree, item by item. Part 3 is the design.
Part 4 is the build plan. Nothing here is binding until it is in Part 2.

---

## Part 1: The review

### How cooking works today

- **Ten recipes, all shared, all known.** `content/shared/kitchen.ts` holds 15 ingredients
  and 10 recipes, used unchanged by both packs. Every recipe shows in the kitchen from day one;
  the only thing between you and a dish is the pantry.
- **One source of ingredients.** Everything is bought at the grocer's stall
  (`ingredientIds`). Four are seasonal. `travel-rations` is the only food with a `road` value.
- **Cooking is one tap.** `cook` costs one slot at home, uses the ingredients up and always
  works. Nothing about you changes how well it turns out.
- **One meal a day.** `character.meal` holds a recipe id. Its `buff` (a `ModifierSpec`) joins
  `characterModifiers` and `spendTime` clears it at the end of the day.
- **Buffs come from three axes only:** training growth (all stats or a few), study speed by
  discipline, and hunger rate.
- **Food that matters to people.** Dinner invites (`hostDinner`) cook for two in the evening.
  16 people have a `favouriteRecipeId`. Festivals add food stalls.
- **Eating out is a separate list.** `FoodDef` (the noodle stall, the teahouse, soldier pills)
  gives satiety and energy and nothing else.

### What is wrong with it

1. **There is nothing to find.** Every recipe is on the page from the start, so the book
   never grows. There is no "I learned this from the old fisherman" moment.
2. **Most choices are strictly better or worse than others.** Seven of the ten recipes are
   training ×1.1–1.15 or study ×1.1–1.15 with a hunger tweak. Once you can afford the Spicy
   Hot Pot, the Grilled Fish Set has no reason to exist. Recipes need _roles_, not ranks.
3. **Food doesn't reach the parts of the game that are hard.** Injuries, chakra exhaustion,
   fights, mission checks, the road, the cold of a mountain pass: no meal helps with any of
   them. Food only touches the comfortable part of the day (drilling).
4. **Ingredients have no place in the world.** Fish come from a stall, not a river. The
   coast, the forest and other villages, where the interesting food would come from, play
   no part.
5. **No skill.** A genin's first stew is as good as a lifetime cook's. Without a skill track
   there is no reason to keep cooking once you have the dish you want.
6. **No setting flavour.** Both packs share all the food. Tōrōgakure's lantern-festival
   sweets or the port's sea dishes can't exist without per-pack recipes.

### What already works and should stay

- A meal is a `ModifierSpec`, so it is worded by `describeSpec` and what the player is told
  is what the code does. Every new effect should follow the same rule.
- Seasons on ingredients, festivals, favourite recipes and dinner invites. These are the
  social side of cooking and they are good.
- Deterministic and derived: seasonal stock reads the calendar, never the Rng.

---

## Part 2: Decisions

Agreed: every proposal below, except spoiling.

1. **Recipes are learned, not given.** You start knowing a handful of home dishes. The rest
   come from people, books, regions, jobs and experimenting at the stove. **(agreed)**
2. **Cooking is a skill with grades E–S**, like an art, but kept out of `STAT_IDS` so it never
   feeds `fightingPower` or teaching. It lives in its own slice. **(agreed)**
3. **Every recipe has one role** from the effect catalogue (3.1). A better dish does its role
   better or adds a secondary one. It never just multiplies the same number. **(agreed)**
4. **Cooking has a short hands-on step** (3.4: three beats, a few seconds on a phone) that
   decides quality. Players who don't want it can tap _Cook as usual_ for a safe Plain
   result. **(agreed)**
5. **Food may reach fights only as "provisions"** (3.1 C). They are set before the fight and
   carried in the `CombatSetup` like gear, with the rules once in `rules/provisions.ts`.
   They never add stats. **(agreed)**
6. **Ingredients come from places.** Every ingredient names its sources: shops, gathering
   spots (woods, river, shore, mountain), beasts, gardens and other villages. **(agreed)**
7. **Food does not spoil.** Rejected: no freshness, no save-shape cost. Preserving stays only
   as a way to make road food (3.5), and phase 6 of the build plan is dropped.
8. **One meal and one snack a day.** The meal is the day-long buff (as today). A snack or tea
   is a smaller, short buff (until the next slot ends). Two meals never stack. **(agreed)**
9. **The library is big, and most of it is regional.** Target: ~25 shared basics plus ~80
   per pack, spread across the pack's regions. Pack recipes carry setting names (decision 8
   in CLAUDE.md). **(agreed)**

---

## Part 3: Design

### 3.1 The food effect catalogue

Every effect a dish can have, grouped by when it acts. A recipe has one **role** (its main
effect) and may have one secondary. Magnitudes scale with quality (3.4). The numbers below
are starting points for the bench, not tuned values.

#### A. On eating (instant)

| Effect         | What it does                                                  | Hook                  | Exists |
| -------------- | ------------------------------------------------------------- | --------------------- | ------ |
| Filling        | Satiety up                                                    | `adjust({ satiety })` | yes    |
| Restoring      | Energy up                                                     | `adjust({ energy })`  | yes    |
| Mending        | Health up a little (broth, congee): never replaces a hospital | `adjust({ health })`  | no     |
| Chakra-warming | Chakra up (chakra-rich foods, rare)                           | `adjust({ chakra })`  | no     |
| Sobering       | Clears a lingering daze, poison or hangover from the izakaya  | injuries / conditions | no     |

#### B. Well fed (lasts the day, a `ModifierSpec`)

These are new fields on `ModifierSpec` where they don't exist yet, so `characterModifiers`,
`describeSpec` and the option cards all pick them up.

| Effect       | What it does                                                              | `ModifierSpec` field   | Exists |
| ------------ | ------------------------------------------------------------------------- | ---------------------- | ------ |
| Hearty       | Training growth, every stat                                               | `training`             | yes    |
| Focused      | Training growth, chosen stats (one body, one mind, one art)               | `growth`               | yes    |
| Studious     | Study speed by discipline                                                 | `studyDiscipline`      | yes    |
| Attuned      | Study speed by element (fire peppers, river weed, mountain herbs…)        | `studyElement`         | yes    |
| Slow-burning | Hunger grows slower                                                       | `hungerRate`           | yes    |
| Tireless     | Hard work costs less energy                                               | `energyCost` (new)     | no     |
| Restful      | Sleep heals more and refills more chakra; eases exhaustion                | `sleepRecovery` (new)  | no     |
| Healing      | Injuries count down faster (bone broth, eel)                              | `injuryRecovery` (new) | no     |
| Convivial    | Bond gains from talk, gifts and training together are larger              | `bondGain` (new)       | no     |
| Sharp-eyed   | Mission checks of one kind are easier (scouting, stealth, tracking, talk) | `checks` (new)         | no     |
| Lucky        | Better gathering finds and more postings seen (festival sweets, rare)     | `fortune` (new)        | no     |

#### C. Provisions (ride into the next fight)

A dish eaten that day, or a packed bento eaten before a fight, adds a **provision** to
`CombatantSetup` (like `items` and `gear`). The rules live once in
`systems/combat/rules/provisions.ts` and every engine applies them. Provisions never add
stats. They shape the fight, the same way gear does.

| Provision   | In the fight                                                     |
| ----------- | ---------------------------------------------------------------- |
| Fortified   | Start with a little extra chakra above the maximum (spent first) |
| Steady      | The first daze of the fight is shrugged off                      |
| Warm blood  | Resist cold and slowing (mountain, winter, ice users)            |
| Antidote    | Poison and bleed wear off a round sooner                         |
| Clear head  | One illusion breaks on its own                                   |
| Second wind | Once, below a quarter health, regain a little                    |
| Fire belly  | Fire techniques you use burn a round longer (spicy)              |

#### D. On the road and in the field

| Effect | What it does                                                                |
| ------ | --------------------------------------------------------------------------- |
| Keeps  | Can be packed for the road (`road` value, as today)                         |
| Hardy  | Resists a region's weather: cold (mountain), heat (desert), sea-sickness    |
| Morale | Cooked at camp for the crew: crew bond, and the charge's trust thread moves |
| Bait   | Taken on a job, opens a `talk` or `distract` approach with a beast          |

#### E. Social

| Effect    | What it does                                                                     |
| --------- | -------------------------------------------------------------------------------- |
| Favourite | A guest's favourite at dinner counts double (exists)                             |
| Gift      | A boxed dish as a gift: liked by trait tastes like a conversation `Tone`         |
| Homesick  | A dish from someone's home village, cooked for them: a big one-off bond moment   |
| Offering  | Left at a shrine or for a spirit (milestone 3 spirits): opens a spirit encounter |

#### F. Strange and risky

| Effect    | What it does                                                           |
| --------- | ---------------------------------------------------------------------- |
| Crash     | Big boost now, a matching slump the next day (soldier-pill cooking)    |
| Risky     | Badly prepared, it poisons you (pufferfish): only safe at Fine quality |
| Trade-off | One thing up, another down (fiery stew: stamina growth up, study down) |
| Bloodline | Lets an awakened bloodline sense more (tonight's sight lasts longer)   |

**Rules that keep it sane:**

- One meal buff a day (B, C) and one snack (A, plus a short B). A new meal replaces the old.
- No effect from food is larger than what a sensei's lesson gives. The pacing bench checks
  that a character who eats perfectly every day is ahead of one who doesn't by a bounded
  share, not a grade.
- Every effect is worded once (`describeSpec` or a provision line), never in recipe text.

### 3.2 Recipes as a library

```ts
interface RecipeDef {
  id;
  name;
  description;
  icon;
  /** E–S: one grade above your cooking grade is chancy, two is impossible (like techniques). */
  rank: Grade;
  /** How it's made: needs the method learned and the tool in the kitchen. */
  method: CookingMethod; // 'raw' | 'grill' | 'simmer' | 'steam' | 'fry' | 'ferment' | 'preserve' | 'infuse'
  ingredients: IngredientCount[];
  /** Ingredients that can stand in ("any river fish"). */
  ingredientTags?: { tag: IngredientTag; count: number }[];
  satiety;
  energy;
  role: FoodEffect; // the main effect, from 3.1
  secondary?: FoodEffect;
  /** Which region it belongs to (for the book and for regional teachers). */
  region?: RegionId;
  kind: 'meal' | 'snack' | 'tea' | 'bento' | 'preserve';
}
```

`ingredientTags` matter for a big library: "any river fish" lets 15 fish feed one recipe
without writing 15 recipes. Ingredients carry tags (`fish`, `river`, `sea`, `mushroom`,
`grain`, `meat`, `sweet`, `chakra`, `spice`, `herb`).

**Where recipes come from** (validated: every recipe has a source, like techniques):

| Source        | How                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------ |
| Home          | 4–5 starters everyone knows (rice ball, miso soup, egg over rice)                          |
| People        | A `teacher` profile gets `teachesRecipes`; same price rules (bond, ryo, favour)            |
| The izakaya   | The cook teaches one dish per bond stage                                                   |
| Books         | Cookbooks sold at the market or in the library, a book per region                          |
| Jobs          | `reward.recipeId`: the grateful farmer's wife, the inn on the pass                         |
| Regions       | Each village's inn or market teaches its own dishes (milestone 4)                          |
| Experimenting | Cook freely from the pantry; a combination that matches an unknown recipe teaches it (3.4) |
| Rumours       | A rumour with `recipeId` hints at a dish and where to learn it                             |

Known recipes go in a new `cooking` slice: `{ grade, xp, known: Record<recipeId, Mastery> }`.

### 3.3 Cooking as a skill

- **Grade E–S** from experience. Every dish gives xp by its rank, and a dish you've mastered
  gives little. New methods (steaming, fermenting, infusing) unlock by grade, and some need a
  teacher.
- **Mastery per recipe**: _new_ → _practised_ (5 cooks) → _mastered_ (15). Practised shows
  the hints in the cooking step. Mastered makes _Cook as usual_ give Good quality, and some
  dishes need one ingredient less.
- **Kitchen tools** as home upgrades: a steamer, a grill, a fermentation crock, a smoking
  shed. They are bought from the outfitter and they gate methods. This is the gear of the
  kitchen and a ryo sink.
- **Chakra cooking** (S-rank methods, `infuse`): food that carries chakra, learned only from
  special teachers. This is where the rare, strong dishes live.

### 3.4 The cooking step (the mini game)

Short and tactile, built for a thumb, and deterministic (the Rng in `perform`).

1. **Prepare.** Choose how to cut or clean: three options. One is right for the dish.
2. **Heat.** A pot on a fire: choose low, medium or high, and when to take it off (early,
   right, late).
3. **Season.** Pick one of the pantry's seasonings, or none. Some dishes have a hidden best
   pairing that gives the secondary effect.

Each beat that lands adds to the quality score. Skill grade against recipe rank sets how
forgiving it is, and an ingredient's quality adds to it. The result is **Burnt** (filling
only), **Plain**, **Good** or **Fine**. The role effect scales with quality, and only Fine
unlocks the secondary effect. Hints come from mastery ("Practised: low heat, take it off
early"), from the teacher's line when you learned it, and from the cookbook.

**Experimenting.** Choose up to four pantry ingredients and a method, then cook. If they
match an unknown recipe (by ids or tags), you learn it, with a flourish. If not, you get a
filling "something" and a hint toward the nearest recipe ("It wants something from the
sea"). This is the discovery loop that makes a big library worth having.

### 3.5 Ingredients and where they come from

```ts
interface IngredientDef {
  id;
  name;
  icon;
  cost;
  tags: IngredientTag[];
  seasons?: Season[];
  road?: number; // keeps on the road
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  sources: IngredientSource[];
}
type IngredientSource =
  | { kind: 'shop'; placeId: string } // a stall's ingredientIds, as today
  | { kind: 'gather'; biome: Biome; slots?: TimeSlot[] } // woods, river, shore, sea, mountain, marsh, desert
  | { kind: 'beast'; enemyId: string } // a fight with this foe leaves it
  | { kind: 'garden' } // grown at home (later)
  | { kind: 'region'; locationId: string }; // only sold in another village
```

**Gathering** is a new place kind, `wilds` (the woods past the training ground, the river
bank below the lantern canal). Each has a `biome` and two verbs:

- **Forage** (a slot, some energy). Draws from the biome's table by season and time of day.
  Perception finds more, and rarer things need a higher cooking grade to recognise
  ("Something like wild ginger. You aren't sure.").
- **Fish** (a slot). A short timing beat in the same style as the cooking step. Night fishing
  finds different things.

On jobs, a `camp` stage gets two new activities: **forage** (the region's biome) and
**cook** (crew morale and a road buff for tomorrow). A road event may leave an ingredient. A
beast fight can leave its meat.

**Regions** (from `world.ts`), each with its own biome tables, market and dishes:

| Place          | Biomes                 | Flavour                                           |
| -------------- | ---------------------- | ------------------------------------------------- |
| Tōrōgakure     | woods, river, canal    | Lantern-festival sweets, river fish, mountain veg |
| Port Shiomachi | shore, sea             | Fish, shellfish, seaweed, salt, the fish market   |
| Sakyugakure    | desert, oasis          | Dates, dried meat, spices, chilli                 |
| Mount Reikon   | mountain, spirit grove | Herbs, chakra fruit, offerings, spirit foods      |
| The road       | wilderness, marsh      | Mushrooms, game, wild greens                      |

Leaving the village depends on milestone 4 (world and travel). Until then, other regions
reach Tōrōgakure through travelling merchants: a festival stall or a weekly market day sells
a few foreign ingredients and a cookbook.

**Preserving.** Food never spoils (decision 7), but drying, salting and pickling still turn
fresh ingredients into road food (pickled radish, dried fish, salted plums) with a `road`
value.

### 3.6 Presentation

- **The cookbook** (a new page under 忍 Shinobi, or a tab in the kitchen): a paper book with
  one chapter per region. Known dishes show as cards in the `TechniqueCard` style. Unknown
  ones are sealed entries with what unlocks them ("Taught by the harbour cook in Shiomachi")
  or a vague hint ("Something with chestnuts and the first frost"). This follows the
  "locked content folds away" rule.
- **The almanac**: every ingredient you've ever held, where it was found, its season. The
  collection count is visible ("41 of 160").
- **The stove**: the cooking step is a scene-like overlay over the kitchen. The three beats
  sit near the thumb, and the result is a report card with the quality stamp and the effect
  chips.
- **Wilds pages**: a backdrop by biome and slot, with finds as chips.

### 3.7 Balance and tests

- `content.test.ts` validation: every recipe has a source, every ingredient is obtainable
  somewhere and used by some recipe, tags resolve, ranks fit methods, and every region has
  gatherable food.
- Pacing bench: a perfect eater against a plain eater over a season stays inside a target
  band. A good cook's food is never as strong as a sensei's lesson.
- `cooking` system tests for quality, mastery and xp. Game tests dispatch `cook`, `forage`,
  `fish`, `experiment` and `learnRecipe`.

---

## Part 4: Build plan

Each phase ships on its own and keeps `npm run check` green.

1. **Roles and the effect catalogue.** Add the new `ModifierSpec` fields (tireless, restful,
   healing, convivial, sharp-eyed) and their hooks, plus the instant effects (mending,
   chakra). Give each existing recipe one role so no two overlap.
2. **Learning.** Add the `cooking` slice (known recipes, grade, xp, mastery) with a save
   migration that teaches existing saves today's ten recipes. Add `teachesRecipes`,
   `reward.recipeId`, cookbooks and the izakaya cook. Add the cookbook page with sealed
   entries.
3. **The stove.** Add the three-beat cooking step, quality, mastery hints, _Cook as usual_
   and experimenting.
4. **Gathering at home.** Add the `wilds` place kind, `forage` and `fish`, ingredient sources,
   tags and rarity, then the camp `forage` and `cook` activities and beast drops.
5. **Provisions in fights.** Add `rules/provisions.ts` and the `CombatantSetup.provisions`
   contract, applied in Plan & Watch.
6. ~~Spoiling and preserving~~ Dropped (decision 7). Preserving for the road joins phase 4.
7. **The library.** Write ~25 shared basics and Tōrōgakure's regional dishes, with travelling
   merchants as a stand-in for other regions.
8. **Other regions** with milestone 4: each village's biomes, market, inn teacher and
   dishes.

---

## Part 5: What was built

**Phase 1, roles and effects.**

- `ModifierSpec` gained `energyCost` (drills, study, sparring and lessons through
  `hardWorkEnergy`), `sleepHealing` (sleep's health, and chakra while exhausted),
  `injuryNights` (`mendedOvernight`), `bondGain` (`warmed`: talk, dinner, lessons, sparring,
  a round) and `checks` (`yourCheckValue` in mission, camp and encounter checks).
  `describeSpec` words them all.
- `RecipeDef` gained `health` and `chakra` (on eating) and a `rank`. The 10 old dishes and 6
  new ones (`shared/recipes.ts`) each have one role.

**Phase 2, learning.**

- `systems/cooking`: grade from experience, mastery per recipe, reach (one rank above your
  grade). `GameState.cooking`, save v32 (old saves keep their ten recipes as a grade D cook).
- Three starters (`starter`). The rest: three cookbooks at the grocer (`CookbookDef`,
  `Stall.cookbookIds`, `buyCookbook`), people who cook (`PersonDef.recipes`, `learnRecipe`:
  Tsune, and Teuchi in the fan pack) and a job reward (`reward.recipeId`).
  `validateRecipes` checks every recipe can be learned.
- The cookbook on the Shinobi screen (`views/cookbook.ts`): your grade, known dishes with
  mastery and effects, and sealed dishes with where to learn them.

**Phase 3, the stove.**

- Recipes have a `method` (grill, simmer, steam, fry, boil) and may override a beat (`steps`).
  `systems/cooking/stove.ts`: the right steps, beats landed, quality (burnt, plain, good, fine;
  your grade above or below the dish's rank nudges it a step) and `buffAt`/`amountAt`, which
  scale everything a dish does by quality. No chance: the stove is learned, not rolled.
- `cook` takes optional `steps` (by hand); without them it is cooked as usual (plain, good once
  mastered). Dinners are cooked as usual. Misses are told which way they went ("The fire was too
  low for it."); practised dishes show their heat, mastered ones every step.
- `character.mealQuality` (optional; absent reads as good, so no save version).
- `experiment`: two to four pantry ingredients, one each. The same set as an unknown dish within
  your grade teaches it (`tryCombination`); otherwise the pot hints how close you came.
- The stove sheet and the "Try something new" pot in the kitchen.

**Phase 4, gathering at home.**

- A `wilds` place kind (`biome`, `finds`, fishing `spots`), with finds and spots shared in
  `content/shared/wilds.ts`: Lantern Woods and the river below the canal in Tōrōgakure, the
  village forest and the river in the fan pack.
- `systems/cooking/gathering.ts`: what can turn up (season, time of day, and whether your
  cooking grade knows it for food) and a weighted draw. Each place and each spot gives once a
  day (`cooking.gathered`, save v35).
- `forage` (perception finds a second handful) and `fish` (willpower decides whether anything
  bites), both hard work.
- Seven wild ingredients, never sold, and seven dishes made from them, taught by two new
  cookbooks (A Forager's Notes, The River Cook).
- Camp: `forage` (around the camp, from the pack's `campFinds`) and `cook` (the best dish you
  know that your pack covers for everyone: bond with each of the crew) activities, offered in
  the escort and team-job camps (`game/story/campKitchen.ts`).
- Beast drops: `EnemyDef.drops` (every beast leaves Wild Game, `game/spoils.ts`) for the Boar
  Hot Pot, taught by Food for the Road.

**Phase 5, provisions in fights.**

- `CombatantSetup.provisions` (`COMBAT_PROVISIONS`): fortified (chakra topped up a quarter as
  the fight opens), steady (no daze takes hold through the second exchange), antidote (a fresh
  burn, bleed or poison lasts an exchange less) and second wind (once a fight, health back when
  below a quarter). Rules once in `rules/provisions.ts`; Plan & Watch applies them as fighters
  are made, where a harm lands, and at the end of each exchange (`engines/plan/provisions.ts`).
- `RecipeDef.provision`: today's meal brings it into fights when cooked good or fine
  (`mealProvisions`). Eight dishes have one; the kitchen and cookbook word it.

**Snacks (decision 8).** `RecipeDef.kind: 'snack'`: eaten beside the day's meal, never
replacing it, its buff working through the stretch of the day after (`game/snacks.ts`,
`character.snack`, optional so no save version). Guests come for meals, not snacks.

**Phase 7, the library (first batch: Tōrōgakure).** The original pack's own larder
(`packs/original/kitchen.ts`: buckwheat, sesame, red beans, tea leaves, lotus root, pickled
plums) and 13 dishes (`packs/original/recipes.ts`): four teahouse snacks and nine meals. Kasumi
(the canal teahouse) and Mama Sayo (the izakaya) teach theirs, Tsune adds Ember Noodles, a
village cookbook covers four, and two jobs hand one over. 35 dishes in the original pack in all.

**Phase 7, second batch: travelling merchants (phase 8's stand-in).** Market stalls may travel
(`Stall.visits`: every few days, on a day of the cycle; `game/merchants.ts`), and the market
says who's coming. Three come to Market Street from the places you can't reach yet: the
Shiomachi fish cart (weekly), the dune caravan and a pilgrim herbalist from Mount Reikon, each
with its home's ingredients (seven in all, `packs/original/regions/`) and a cookbook of its
dishes (ten, among them the rank B Chakra Fruit Preserve). The original pack now has 47 dishes.

**Balance bench.** `src/test/pacing/food.test.ts`: every dish in every pack, cooked fine, stays
inside fixed ceilings (growth and study at most 1.4×, checks 1.25×, hard work at least 0.75 of
its energy, and so on), so eating well never matters more than training.

Not yet built: gathering (phase 4), provisions in fights (phase 5),
the library (phase 7) and other regions (phase 8).
