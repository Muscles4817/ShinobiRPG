# CLAUDE.md

Guidance for anyone (human or AI) changing this codebase. Read it before writing code.
Rules marked **(enforced)** fail CI if broken; the rest are enforced in review.

## What this is

**Shinobi RPG** — a text-based shinobi life-sim RPG, built as an offline-first PWA so it can be
played on a phone while travelling. Original setting: Tōrōgakure, the Village Hidden Among
Lanterns. Stack: TypeScript (strict), React, Vite, vite-plugin-pwa, Vitest.

Roadmap (milestones): **1. vertical slice** (done) → **2. people & relationships** (done) → 3. progression (ranks, elements, spirits) → 4. world & travel → 5. branching paths (rogue / Kage)
→ 6. depth. Combat has settled on Plan & Watch; other styles are shelved (see decision 16).

The game ships **content packs** (whole settings). `naruto` is a fan pack for personal play;
`original` is the game's own world and the only one a public release may contain.

## Commands

```bash
npm run dev            # local dev server
npm run check          # EVERYTHING CI runs: typecheck, lint, format, arch, test, build
npm test               # unit + integration + UI smoke tests
npm run arch           # module-boundary check (dependency-cruiser)
npm run check:release  # release build without fan packs, verified free of fan names
npm run format         # auto-format with Prettier
```

Run `npm run check` before every commit. Nothing merges unless it is green.

## Architecture

```
src/
  core/       Game-agnostic utilities: seeded Rng, Result, math. Knows nothing about the game.
  systems/    Self-contained domain modules. Pure functions over their own slice of state.
    time/ stats/ vitals/ wallet/ housing/ techniques/ missions/ combat/ standing/ journal/
    modifiers/ profile/ bonds/ inventory/ cooking/ travel/
  content/    Content schema, validation and the pack registry.
    packs/<id>/   One complete setting: locations, places, techniques, missions, text…
  game/       Composition layer: GameState, player actions, mission flow, save/load, view models.
  platform/   Browser adapters (localStorage save store).
  ui/         React. theme/ (tokens), art/ (SVG icons & backdrops), components/, screens/.
  main.tsx    App composition root: picks platform adapters and the game context.
```

### Dependency rules (enforced by `npm run arch`)

```
ui ──► game ──► content ──► systems ──► core
```

- `core` imports nothing from the project.
- `systems/*` import only `core` and **other systems' `index.ts`** — never their internals,
  never `content`, `game`, `ui`, or React.
- `content` imports only system public APIs (for types). It is data, not logic.
- `game` imports systems via their `index.ts`, plus `content` and `core`. Never `ui`/`platform`/React —
  the whole game must run headless (tests prove this).
- `ui` imports **only `@/game`** (its `index.ts`). Never systems or content directly.
- `platform` imports only `@/game`'s public API.
- No circular imports. No orphan modules.

### Key design decisions

1. **State is one immutable, JSON-serialisable `GameState`** (`src/game/state.ts`). Each field is a
   slice owned by one system. Never mutate; return new objects.
2. **All change goes through `dispatch(state, action, ctx)`.** Player verbs are a discriminated
   union (`GameAction`); each has a handler with `check` (why not? — pure) and `perform`.
   The UI uses `blockerFor` to disable buttons with a reason.
3. **Determinism.** Randomness only via the `Rng` passed into `perform`; its state is stored
   in `GameState.rngState`. Same state + action ⇒ same result. `Math.random`/`Date.now` are
   lint errors **(enforced)**.
4. **Dependency injection via `GameContext`** (`src/game/context.ts`): content and the combat
   engine are injected, so tests can substitute them.
5. **Combat is behind a contract** (`src/systems/combat/contract.ts`). The game builds a
   `CombatSetup` and reads a `CombatOutcome`; the UI renders a generic `CombatView`; saves hold
   an opaque `CombatState`. Only the engine looks inside its own state. A setup has
   `allies` (teammates on team missions) who fight by a `stance` and take only the `orders`
   the game says your bonds have earned (`game/people/teamOrders.ts`); a fight's purpose (mission,
   spar) is game state (`people.sparringWith`), never the engine's concern. The player's
   choice is a `CombatChoice` (option id + optional target); the view may add `range`,
   `prompt`, `meters` and per-combatant `intent` (a foe's telegraphed next move), and options say their `kind` so one fight
   screen can lay out any engine.
6. **The UI renders view models** (`src/game/views/`), not raw state. Activity lists are
   `ActionOption`s that already carry the `GameAction` to dispatch and the blocker reason.
7. **Content is data, validated by tests.** Unique ids, resolvable references, reachable
   activities and sane numbers are checked for every pack in `content.test.ts`, so a typo fails
   CI rather than crashing on a phone.
8. **No setting names in code.** Every name, place and line of setting-specific text comes
   from the active `ContentPack` (`SettingText` covers engine wording such as sleep and hospital
   lines). Code may reference ids only through content, never hard-code `'konohagakure'`.
9. **A save belongs to one pack.** `GameState.packId` is fixed at creation; the context is
   built from it on load. Ids are only unique within a pack.
10. **Places decide what you can do.** Location → places (`PlaceDef`, discriminated by `kind`).
    Actions check the current location offers them (`placeHere`). Each place kind has its own
    view model and page.
11. **Identity is modifiers.** Clan, talent, traits, build, upbringing, class standing and
    chakra nature each declare a `ModifierSpec`; `characterModifiers` (`game/profile.ts`) multiplies them into one
    `Modifiers` value that training growth, study speed and hunger read. A new kind of identity
    (bloodline stage, gear, a sensei's teaching) is another spec, not new branches in actions.
    Option cards show `describeSpec` output, so what the player is told is what the code does.
    **Talent is aptitude**: a hidden multiplier per stat (`character.aptitude`, 0 = never),
    rolled at creation (`game/aptitude.ts`; clan `arts`, talent floors, clan and talent growth
    as tilts) and found out by training (`aptitudeKnown`). All growth goes through
    `growCharacter` (`game/growth.ts`): base × solo efficiency by grade × aptitude × modifiers
    (× a teacher); hard-work traits set a `soloEfficiencyFloor`. Players see reads, never numbers.
    **Talent is also a limit** (`systems/stats/limits.ts`): each stat has a kind (speed and
    reserves are born, strength is the frame's, the rest are trained) and aptitude sets how far
    it can go; growth eases near the limit and trickles past it (`PAST_LIMIT_TRICKLE`), teachers
    included. Only a `limitBonus` moves a limit: a build, or a **breakthrough**
    (`game/breakthroughs.ts`, stored in `character.breakthroughs` by source, once each; a
    promotion deepens reserves, and the Gates or an awakening are the same kind of thing). Strength
    above the build's `comfortStrength` lowers the speed limit (bulk). The stat sheet says, in
    words, when a stat whose talent you've read is near or at its limit (`naturalLimits`).
12. **Character creation is the opening scene.** The academy break-in collects a
    `CreationDraft`; `draftProblems` validates it and `createNewGame` builds the first state.
    The break-in roll is seeded, so the scene and the game agree on the outcome. Creation keeps
    **development** (how trained you are at graduation) apart from **talent** (how fast and far
    you can go). The **academy file** (`systems/profile/academyFile.ts`) is early training bought
    with development points (`development.ts`: steps of +2, dearer as a stat climbs; most may
    take a stat to a solid D, the best of the year a few to C), known **gifts and flaws**
    (`gifts.ts`: laid over the hidden roll and known from day one; a flaw gives points back) and
    when you bloomed (trade a gift for training or back). **Class standing**
    (`systems/profile/standing.ts`: dead last to genius, or fate, read from the seed as your file
    says it) is the one creation choice that isn't a trade-off: it is the difficulty. It sets the
    file's budgets, the band the hidden talent is rolled in (`TalentShape` in `game/aptitude.ts`;
    your best-graded arts are never a hole) and, at the bottom, a hard-work floor so solo training
    keeps paying through C. The **upbringing** (`UpbringingDef`) adds early training, and a clan
    child's must go into the clan's arts first (`focus`), so no clan child graduates with nothing
    in them; the **build** (`BuildDef`) is the frame. Quick picks (`archetypes.ts`) fill the file
    as a kind of student and follow later changes until it is edited by hand (`creationDraft.ts`).
    `game/student.ts` turns a file into graduation stats for the player and generated classmates
    alike. Academy grades are a reading of the starting arts (`gradesFor`), never chosen. Chakra
    **nature is found, not picked** (`game/nature.ts`): read from the seed at creation (a clan's
    nature most of the time) and hidden (`natureKnown`) until the chakra paper scene that follows
    team assignment (`testChakraPaper`). Until then it counts in fights only: no study bonus, no
    nature techniques, no sensei can see it. Talents
    may be one-sided (`TalentDef.aptitude` fixes a stat, 0 = never) or blank. The pacing bench
    (`src/test/pacing/standing.test.ts`) checks the spread and that the dead last can climb.
13. **People are data, wherever they come from.** Authored people (`PersonDef`) live in the
    pack; generated genin are built from the pack's name pools by `game/people/generator.ts`
    and stored in `GameState.people.generated` in the same shape, so every view and action
    treats them alike (look people up with `findPerson`, never `content.people` alone).
    Schedules place people at places in their home location by time slot: the start village,
    or a town they live in (`homeLocationId`, only `shinobi` and `villager` roles; `villagers`
    keeps them off your village's crews, teams and dinner table). Bonds (points,
    stages, tone reactions) are the `bonds` system; who reacts how comes from trait tastes.
14. **Scenes are derived from state.** `activeScene` decides what takes over the screen
    (fight › encounter › mission › conversation › team assignment › chakra paper). Anything that must happen before
    normal play (like team assignment) is a scene plus a `busyReason`, not UI-only logic.
15. **People have real stats and a rank; peers grow on their own.** (The old rule, companions
    derived from your mission record, is retired.) Every `PersonDef` has a `rank` and `stats`
    (authored with `statLine`; validated against rank and role) and may have an `aptitude`;
    generated genin get theirs at generation from the save's seed. Genin train every day
    (`game/people/regimen.ts`) through the same growth formula as you, caught up lazily per day
    like the board (`peopleGrown` in `game/people/progress.ts`, hashing the seed, never the
    Rng) into `people.progress` (stats plus `lastGrownDay`); your teammates also get your
    sensei's weekly lesson, and a spar trains your partner too. Fights and scouting read
    `personStats`. **Training with people** (`trainWith`, at a training place where they are):
    anyone ranked shinobi offers the stats they are ahead of you in, grown by the teacher rule
    (`systems/stats/teaching.ts`, the grade gap) × their rank and quirk (`game/people/
teachingFactor.ts`). A `TeacherProfile` on the `PersonDef` sets quirk, steering (they pick
    the stat until a bond stage), signature `teaches`, sessions a week and a templated price
    (bond, ryo, a finished mission, a favour done in conversation, or `all` of them;
    `game/people/price.ts`); without one, defaults by rank apply. Sessions are counted per
    teacher per week (`people.taught`). Your sensei is the special case: no price, comes to the
    training ground for you by day, once a week, and the session is the lesson card.
16. **Fight styles are engines; Plan & Watch is the canonical one.** `GameContext.engines` lists
    every engine on offer, and today that is Plan & Watch (`plan-v1`) alone, so the fight-style
    picker is hidden. Classic (`engines/duel/`) and Deck (`engines/deck/`) are **shelved**: their
    code and tests stay and must keep passing, but they aren't offered, and new traits, tools and
    verbs need not reach them ("every engine" below means Plan & Watch). Tests that need a
    shelved engine inject it into the context. `settings.combatStyle` picks the one that starts
    new fights and `engineFor` routes to it. A fight in progress always continues in the engine
    whose id is in its `CombatState`, even a shelved one (`GameContext.shelvedEngines` keeps
    Classic routable for saves made mid-fight in it). What the player sets up in a style (Plan & Watch cards) comes
    back as an opaque `CombatOutcome.plan`, is kept in `settings.combatPlans` by engine id, and is
    handed to that engine's next fight as `CombatSetup.plan` (`startFight`); the engine validates it. The newer engines share `systems/combat/rules/` (range
    bands and reach, the elemental cycle, damage and resist formulas, the common `Body`), so
    styles differ in decisions, not maths. Bloodlines reach combat as perks (`insight`).
    Each side stands in a front and a back **row** (`rules/rows.ts`, placed by kit or
    `CombatantSetup.row`): a blow up close can't reach the back row while the front stands;
    throws, longer-reach techniques and area effects can. Ask `canReach`, never test rows inline.
    **Health is 100 for every human** (`MAX_HEALTH`); creatures scale it with
    `EnemyDef.healthScale`. Damage comes from the **gap** between attacker power and defender
    defence (`rules/damage.ts`: a ratio of ratings, narrow variance), so equals trade the same
    blows at every grade and each grade of difference is decisive. Defence has layers:
    evasion (speed, perception), guard and counter (taijutsu, strength) and resistance
    (willpower against genjutsu, perception against the rest) in `rules/defence.ts`; toughness
    is stamina (plus `armoured` kit), and toughness and will both blend in the fighter's best art
    (`SKILL_DEFENCE_SHARE`: skill defends, so specialists of a grade don't one-shot each other);
    no hit takes more than half the target's health (`cappedHit`). A daze costs the target their
    next turn and leaves them open (no dodge, a finisher target, though a Guard still works);
    afterwards they are steady for an exchange (`canDaze`), so dazes can't be chained. Foes play
    their default plan by priority, as the player does, most of the time (`PLANNED_CHANCE`), and
    instinct otherwise; a default plan always keeps a defence and brings a Search against a foe
    that hides. Healing is ninjutsu with chakra control; chakra control
    breaks illusions and shortens confusion (`rules/conditions.ts`). Perception at least a
    foe's names the technique they telegraph. The bench (`src/test/bench`) asserts the
    lethality targets (equals fight two to three rounds and win about half) and the content bench
    (`contentBench.test.ts`) a fresh character's real fights: against an AI copy, the genin of
    their year and D-rank foes; retune the named constants there, not by eye.
    Every number has a frame of reference: `statTier` grades a stat value E–S (E–D genin, C chūnin,
    B–A jōnin, S kage) and
    `fightingPower` rates a whole stat line; `game/scouting.ts` reads an opponent against you
    (threat, fighting style, and with sharp eyes their standout stats) for fights, sparring
    partners and mission notices, from the same stats the fight uses.
    Fighters also have a **kit**: `CombatTrait`s (archer, brawler, illusionist, armoured,
    swift, pack, coward, spirit) on `EnemyDef.traits` → `CombatantSetup.traits`. What they
    mean lives once in `rules/kit.ts` (reach, `kitDamageScale` by `AttackKind`, pack, coward)
    and `rules/conditions.ts` (Hidden and Confused, Search and Dispel chances); every engine
    applies them, so an archer is an archer in every fight style. Scouting names each trait
    with its counter. Genin get traits from their specialty (`companionTraits`).
    **Preparation** happens before the fight: fight tools (`ToolDef`, sold by the piece at
    `gear` places' `toolIds`, kept in `inventory.tools`) ride in as `CombatantSetup.items`;
    what they do lives once in `rules/items.ts`, every engine offers them, and
    `CombatOutcome.items` writes back what's left (`afterPouch`). A mission notice shows only
    the threat until you buy the client's report (`buyIntel`, `board.intel`), which names every
    foe and their tricks.
17. **The jobs board rotates.** Most jobs are postings that stay up a few days; `standing`
    jobs (patrols) are always there, once a day; jobs above your record are never shown, not
    even sealed. Postings come from `hashUnit(seed, day, id)` (`game/board.ts`), so the board
    is reproducible and catches up lazily without consuming the game's Rng. Tests that take a
    specific job use `postEverything` (the default `newGame` fixture does).
18. **Gear counts in fights; meals count for a day.** Equipped gear (`inventory` system,
    `game/gear.ts`) never adds to stats: it rides in as `CombatantSetup.gear` (`gearContract.ts`)
    and changes the cards (a blade's cut, needed for kenjutsu; knuckles; thrown steel and senbon;
    armour levels that trade protection for speed, eased by strength; a focus that sharpens a
    verb or art), with the rules once in `rules/weapons.ts`, `armour.ts`, `focus.ts`. Gear has
    ranks D–A: shops sell D and C, B to chūnin; A and `unique` named weapons are never sold. A home-cooked recipe sets
    `character.meal`; its `buff` is another `ModifierSpec` in `characterModifiers` and
    `spendTime` clears it when the day ends. **Cooking is a skill** (`systems/cooking`,
    `GameState.cooking`): recipes are learned (three `starter`s, cookbooks at a grocer, people's
    `recipes` lessons, a job's `reward.recipeId`), each has a `rank` (a cook manages one above
    their grade) and a mastery from times cooked, and every dish has one role
    (`docs/design/cooking-plan.md`): its buff may also make hard work cheaper (`energyCost`,
    read through `hardWorkEnergy`), sleep heal more (`sleepHealing`), injuries mend sooner
    (`injuryNights`), time with people count for more (`bondGain`, `warmed`) or your own job
    checks sharper (`checks`, `yourCheckValue`); `health`/`chakra` come back as you eat.
    Dishes are cooked by hand at the stove (`game/stove.ts`: three beats against the recipe's
    `method`, giving a `mealQuality` that scales the dish through `buffAt`/`amountAt`) or as
    usual; `experiment` puts pantry ingredients together to discover recipes. Ingredients
    are bought or gathered: `wilds` places (woods, river) are foraged (`forage`) and fished
    (`fish`, by spot) once a day each, drawing from `finds` by season, hour and cooking grade.
    A dish cooked well brings its `provision` into the day's fights (`CombatantSetup.provisions`,
    rules in `rules/provisions.ts`: fortified, steady, antidote, second wind); never a stat.
    A `snack` (tea, sweets) sits beside the meal for the next stretch of the day (`snacks.ts`).
    A pack's own dishes live in `packs/<id>/recipes.ts`, taught by its people and books;
    travelling merchants (`Stall.visits`, `game/merchants.ts`) bring other regions' food.
    Hunger works the same way: the player sees a Hunger meter (100 − satiety), and each
    stage (`hungerLevel`: peckish, hungry, starving) is a `ModifierSpec` plus a fight-strength
    multiplier in `game/hunger.ts`; starving also blocks hard work (`weakFromHunger`).
19. **Village life is derived from the calendar.** `game/village.ts` decides what is open
    (`hours` on places and stalls; closed ones say when they open), today's festival (cheaper
    market, warmer talks), the gossip (`rumoursToday`: a job's rumour goes round the day
    before `newPostingsTomorrow` posts it) and tonight's sight, which only an awakened
    bloodline can follow. Like the board it hashes the seed and day, never the Rng; only
    `village.lastSightDay` is stored. Festivals can bring their own `stalls`, which
    `stallsHere` sets up in the market on the day. Dinner invites (`hostDinner`) cook a
    recipe for two in the evening; they count as the day's time with that person and are worth
    more for their `favouriteRecipeId`. Night-only places are `tavern` places (an izakaya)
    with `hours`; people's schedules bring regulars in at night, a round (`buyRound`) warms
    everyone inside once a night, and the counter hears more gossip (`rumoursOverheard`).
20. **Ranks are earned in scenes.** The chūnin exam (`ExamDef`, `systems/exams`) is held on its
    calendar dates (twice a year; rumours and the sensei's word the week before) and entered at
    the mission hall with the sensei's nomination (bond, their judgement of your grades, a
    record of jobs) and a team of three (`game/exam/entry.ts`; a replacement only if the
    sensei's `toleratesReplacement`). The run (`exams.run`) is a scene with a `busyReason`; its
    stages are a discriminated union (`mind`, `survival`, `tournament`): the forest is an
    `examOnly` team mission of encounters whose ends come back to the exam, the tournament is
    bouts against rivals generated from the seed. Every stage records conduct marks
    (`conduct.ts`), and the verdict weighs conduct with results. A promotion is its own scene
    (`exams.ceremony`): the rank, the vest, and unlocks derived from data (`exam/unlocks.ts`).
    Jōnin are nominated (`notePromotions` in `dispatch`) once the record earns it.
21. **Crews are assigned per job.** Who goes with you is decided for each posting
    (`systems/missions/crew.ts` for the rules, `game/crew.ts` for the people, both hashing the
    seed and the day it went up): alone, your old team (the sensei leads it from C-rank, and
    out of the village), genin you lead, a chūnin squad, or under a jōnin. The rules read the
    job's rank, its **danger** (its worst foe's `EnemyDef.danger`: petty, armed, deadly, elite),
    whether it is **away** (a road, an `endsAt`, or posted only in another town; `jobProfile`)
    and your rank and record: a genin goes alone only on in-village chores against petty foes
    and never on B or A, and in the genin years (`underSensei`, `game/mentorship.ts`) every job
    out of the village is led by the sensei (`docs/design/sensei-plan.md`); a chūnin takes
    only safe B-rank work and A-rank only under a jōnin; a jōnin's A-rank work goes to them alone
    as their senior record grows. The board, the start action and `validateCrews` all enforce
    them. The run keeps its `crew`; allies, orders, the medic, check roles and bond all read it
    (`game/missionTeam.ts`), never your genin team directly.
22. **Jobs can keep you away for days.** A `leg` stage is days on the road (`game/road.ts`):
    each day passes to the next morning through the same `spendTime` as home (hunger,
    healing, peers and the board catch up), with an evening meal from your pack (ingredients
    with `road`, sold at the grocer) and a night in camp (`CAMP_HEALTH_SHARE` of a bed's
    healing). Your sensei, leading your team out, gives the week's lesson by the fire
    (`lessonAway`). A job's days away (`daysAway`) show on its notice, it must pay at least
    `MIN_RYO_PER_DAY_AWAY` a day (validated), and your sensei won't sign you out for one that
    would make you miss an exam they'd nominate you for (`game/awayNotes.ts`).
23. **Missions remember.** A run keeps **marks** (flags), **threads** (counters shown as a word
    and dots, `ThreadDef`) and a **ledger** (what changed the outcome, and why, for the debrief)
    (`systems/missions/story.ts`, `outcomes.ts`). Any stage can carry a `when` `Condition`
    (marks, threads, who is along); one that doesn't hold is passed over (`game/story/state.ts`
    `settle`), so a story branches by stages appearing, not by a graph. Results carry
    `Outcome`s (effects plus a ledger line): failing forward (`onFailure: 'forward'`) sets marks
    rather than docking pay. Story stages are `decision` (options with a `Tone`: the crew's bond
    and the charge's trust move by their tastes, and whoever felt it most says so), `camp`
    (pick a few activities before the fire burns down) and `ending` (the first that fits). A
    `leg` with a `region` may bring a road event (`content.roadEvents`, drawn by hash). A job
    may have a `charge` (whose trust is a thread) and `twists` (a hidden mark rolled at the
    start). What the crew say comes from `content.voices` by moment and trait. The **debrief**
    (`game/debrief.ts`) reads it all back: the ledger line by line with the pay each moved,
    each crew member's bond since the start and last word, a grade (clean, rough, botched), and
    on a failure what would have helped (the best approach to the check, or the foe's trick).
24. **Jobs leave something behind.** Outcomes can make the village remember (`world` effect →
    `village.marks`) and give everyone along a shared memory (`memory` → `village.memories`).
    A job with `needsWorldMark` is posted only once the village remembers it (a follow-up);
    a rumour with `worldMark` goes round only then, ahead of other talk. Memories show on the
    person's sheet and come up by the fire. Clients count the jobs you've done for them
    (`village.clients`, `game/clients.ts`); one you've worked for asks for you by name and
    pays `CLIENT_RETURN_SHARE` more (not on standing jobs). `validateStory` checks every world
    mark waited for is one some job leaves behind.
25. **Long stories are arcs of jobs.** An `ArcDef` (`content.arcs`, `systems/missions/arcs.ts`)
    is acts of jobs following Harmon's circle; an act's jobs are open together once every job
    of the act before is done, never posted at random (`Availability` kind `arc`). Jobs read
    earlier acts through world marks (`remembers`, a snapshot taken when a job starts). The
    board pins each arc under way (`views/arcs.ts`). An act may be based in another town
    (`ArcAct.baseLocationId`): its jobs are posted at the office there, and while it is open,
    going there is orders, not leave. A job may leave you somewhere else (`MissionDef.endsAt`,
    walked there by its legs): the "go" act's job takes you to the base, the last brings you home.
26. **Travel is a journey along routes, on leave** (`docs/design/world-plan.md`). A pack's
    `routes` join its locations (legs of days through road-event regions, a `danger`, a
    passage `cost`); `systems/travel` finds the quickest open way (a road through a place still
    locked is closed, as is one whose `needs` you don't meet: a rank, a world mark, or walking
    on water or trees, asked only of `canWalk` in `game/walking.ts`). Setting out (`travel`) starts a mission run carrying a `journey` plan, so
    the road plays as on a job (`game/journeys.ts`: a leg per stretch, a camp between, road
    events); `quick` hurries on until a road event needs a choice. Away from home you sleep at
    an `inn`; a friend may come along (`game/trips.ts`, a `companion` crew, found at your
    lodging), you may turn back at a camp, and coming home shows what the village did while
    you were away; people who live in a town (`homeLocationId`) are met there, its festivals
    (`FestivalDef.locationId`) are held there, and the village's street talk stays at home.
    **Leave is strict** (`game/leave.ts`, the `leave` slice): a genin goes only on the pass
    their sensei signs at the weekly lesson, by safe roads (the quickest safe way, where there
    is one); a chūnin spends a season's days of leave; a jōnin comes and goes; going home never
    needs leave, and jobs need none. Walking on water or up trees is a **control exercise**
    mastered (`docs/design/milestone3-plan.md`): `ExerciseDef`s practised at training places
    (`practise`, `game/exercises.ts`), some started by your sensei at a lesson; mastering one is
    a breakthrough, and `canWalk` (`game/walking.ts`) is the only place that reads it for roads.

### Content packs

- A pack is `src/content/packs/<id>/index.ts` exporting a `ContentPack`; register it in
  `src/content/packs/index.ts`. Validation runs on it automatically.
- Fan packs (names we don't own) go in the conditional branch of the registry, so
  `VITE_EXCLUDE_FAN_PACKS=true` tree-shakes them out. CI's `check:release` fails if fan names
  leak into a release build; add a marker for each new fan pack to `scripts/check-release.mjs`.
  Build a fan pack's object inside a `/*#__PURE__*/` IIFE and mark content helpers called at
  module level `/*#__NO_SIDE_EFFECTS__*/`; otherwise array spreads and calls keep its data alive.
- Content is typed TypeScript for now (type-checked, validated, zero runtime cost). If packs
  ever need to be authored outside the codebase or loaded at runtime (mods, downloads), move
  them to JSON with a runtime schema at the same `ContentPack` boundary — nothing else changes.

### Recipes

- **Add or rewrite a combat engine (fight style):** implement `CombatEngine` in
  `systems/combat/engines/<name>/` on top of `rules/`, export its factory from
  `systems/combat/index.ts`, and add it to `defaultEngines()` in `game/context.ts`. It appears
  in the fight-style picker automatically (shown once more than one style is offered). No
  other code changes. Shelving an engine moves it to `shelvedEngines()` (if saves may be
  mid-fight in it) and migrates saves that chose it. Narrate damage and healing
  with `harmLine`/`healLine` (`rules/narration.ts`) so the amount shows as a chip, never in the story.
  A staged engine (one that offers plans, not a hand) tags each turn's lines with `turnLine` (whose
  turn, and where the fight stands) and defences with `reactionLine`; the watch screen stages the
  log from those (`game/views/fightReplay.ts`) between the plan screen's rounds. A fight that ends
  is kept as `combatFinale` (its last view) so the stage plays the final exchange before the
  result card; like a report, it never blocks play, and `leaveFight` closes it. Removing an engine or
  changing its id needs a migration for saves that are mid-fight in it or have it chosen.
- **Add a player action:** add a variant to `GameAction` (`game/actions/types.ts`), write a
  handler (`check` + `perform`), register it in `game/actions/registry.ts` (the compiler
  insists), expose it through a view model, add tests.
- **Add a system:** create `systems/<name>/` with `<name>.ts`, `index.ts` (public API) and
  `<name>.test.ts`. Add its slice to `GameState` + `createNewGame` + a save migration.
- **Add content:** add entries to the pack's arrays _and_ offer them at a place (training at a
  training place, food at a stall, missions at a mission hall). Run `npm test` — validation
  catches broken references and anything no place offers.
- **Add a content pack:** copy `packs/original/`, change ids/names, register it. Keep every
  pack complete; packs don't inherit from each other.
- **Add a location:** add a `LocationDef` with a backdrop, a `map` point and places, and a `RouteDef` to it in
  the pack's `routes` (legs of days through road-event regions, a `danger`, any passage `cost`,
  and for a road not everyone may walk, `needs` and a `name` to say it by;
  `systems/travel` finds the quickest open way, validated so every location has a road). Leave
  `lockedReason` set until it is playable; the Travel tab shows it as coming soon, and no road
  passes through it.
- **Add a control exercise:** an `ExerciseDef` (grade, pace, energy, `startedBy: 'sensei'` with a
  `start` line if the sensei begins it, an optional `walk` surface, a `limitBonus`, practice and
  fall lines) in `shared/exercises.ts` or a pack's own list, offered at a training place's
  `exerciseIds` (validated).
- **Add a wild place:** a `wilds` `PlaceDef` with a `biome`, `finds` and optional fishing
  `spots` (reuse the shared lists in `shared/wilds.ts` where the country is the same).
- **Add a place kind:** add a variant to `PlaceDef`, its references to `validateWorld`, a view
  model in `game/views/`, a page in `ui/screens/places/` and a case in `PlacePage` (the
  compiler lists every switch you missed).
- **Add a technique:** give it a `rank` (E–S, the letters of ability grades): one rank above the
  learner's grade in its discipline is slow and arrives unstable, two is impossible from any
  source. Physical needs (nature, reserves, control grade) go in `needs`. Starters must be rank E.
  Its shape in a fight: `reach` (bands, when not its art's usual reach; ask `reachOf`),
  `accuracy` (sure, steady, wild: a multiplier on slipping it, and wild hits harder; `slipChance`
  in `rules/defence.ts`) and a damage effect's `hits` (a flurry: the power split over 2–5 blows,
  each dodged alone; a Guard or Counter meets only the first). The academy's technique sheet
  (`views/techniqueSheet.ts`) reads all of it, so what the player is told is what the fight does.
- **Add a clan, talent or trait:** add it to the pack's `clans` (or the shared `talents`/
  `traits`) with stat bonuses and a `ModifierSpec`. Clan-only techniques set `clan` on the
  `TechniqueDef` and are listed at the academy; only members see and learn them. Every pack
  needs a `none` clan (validated).
- **Add a person:** add a `PersonDef` to the pack's `people` (appearance via `look()`, a
  schedule of place ids in the start location, or in their `homeLocationId` if they live elsewhere, a `rank` and `stats` via `statLine()`, and
  optionally an `aptitude` via `talent()`, and an `arsenal`: the techniques and perks they fight
  with in place of the academy kit, each a pack technique with its own source and within their
  grade in its art; validated). Their best stat must fit their rank (genin E–C,
  chūnin C–B, jōnin B–A, kage A–S, civilians no better than D; validated). Senseis need `role: 'sensei'`, a
  `sensei` profile (style, lesson text) and a `teacher` profile (quirk, steering, `teaches`
  technique ids, price); at least two specialties must exist for the team choice (validated).
  Anyone else who should teach on their own terms gets a `teacher` profile too. A favour price
  needs a conversation reply with that `favour` id (validated).
- **Add an enemy:** add an `EnemyDef` (stats, techniques, a `danger` that fits its strength,
  optional `nature`, `traits`, and `healthScale` for a creature bigger or smaller than a person) to the
  pack's `enemies` and use it in a mission's combat stage. A new trait goes in
  `COMBAT_TRAITS`, its rule in `rules/kit.ts` or `rules/conditions.ts`, its counter text in
  `game/scouting.ts`, and every engine must honour it.
- **Add a technique verb:** a technique's `effects` is a list of verbs applied in order
  (`systems/techniques/effects.ts`). A new verb goes in `VERBS` with its scaling profile
  (which user stats drive it, which target stats resist it) in `rules/verbs/profiles.ts`;
  Plan & Watch applies it in `engines/plan/jutsu.ts`. Shelved engines read a technique
  through `primaryEffect`. Verbs that leave something behind (knock, pin, drain, afflict:
  burn, bleed, poison; counter, a readied riposte) keep their rules in
  `rules/verbs/lingering.ts` and their play in `engines/plan/lingering.ts`, which wears them
  down at the end of each exchange.
- **Add a fight tool:** add a `ToolDef` to `shared/tools.ts` (or a pack's own list) with an
  existing `effect` and list it in a gear place's `toolIds`. A new effect goes in
  `COMBAT_ITEM_EFFECTS` with its rule in `rules/items.ts`; every engine must offer it.
- **Add a mission:** add a `MissionDef` and list it at a mission hall. It is posted from time
  to time once the player's record reaches `minMissionsCompleted`; set `standing: true` for
  jobs that are always available (every pack needs one a fresh genin can take — validated).
  `reward.scrollId` / `reward.gearId` hand over a technique scroll or a named weapon once.
- **Add a journey (a medium job):** fill the escort template (`jobs/templates/dRankEscort.ts`,
  the reference: `docs/design/missions-plan.md`), or write one like it: a charge, a few legs
  with a `region`, a check that fails forward, a camp, a twist with a decision, an encounter
  and an `ending`, then the road home. A template's `threads`, `charge` and `twists` are filled
  like its stages.
- **Add a long story:** write its jobs (any tier), list them at a mission hall, and add an
  `ArcDef` to the pack's `arcs` with its acts (beats, a line, the jobs, and a `baseLocationId`
  for an act lived in another town, with `endsAt` on the jobs that take you there and back). Leave world marks in
  outcomes for later acts to `remember` (validated: every remembered mark is left by some job).
- **Add many jobs of one shape:** write a `MissionTemplate` (`content/missionTemplates.ts`) with
  `{slot}` placeholders and their meanings in `placeholders`, then add `MissionFill`s giving every
  slot a value (`packs/original/jobs/`). Fills become ordinary missions on the board; validation
  reports any slot left unfilled, and tests check each fill gives exactly what its template asks.
- **Add a technique:** give it a source (validated): the academy (rank E–D), a library (its open
  shelves keep standard techniques to C, for genin once their sensei signs the permit at a
  lesson, `game/permits.ts`; the rest is the restricted stacks, chūnin only), a teacher's `teaches` (clan techniques only from clan members), or a mission's
  scroll reward. A person's `arsenal` is not a source.
- **Decide who goes on a mission:** nothing to set. A job's rank and its foes' danger decide
  the crews it may get (decision 21); a crew joins every fight as allies and each member gains
  bond on success. Give a check approach a `role` (tracker, sensor, medic) when the best crew
  member should take it (validated: only on jobs someone takes with a crew).
- **Add an exam stage kind:** add a variant to `ExamStageDef` and `StageProgress`
  (`systems/exams/exams.ts`), its play in `game/exam/`, its choices in `views/exam.ts` and its
  checks in `validateExams.ts` (the compiler lists the switches). Exam text (the paper's
  questions, the forest mission, the bouts' lines) lives in the pack's `exam.ts`; ceremony words
  in `SettingText.promotions`.
- **Write a mission's story:** declare its `threads`, an optional `charge` and `twists`; gate
  stages, approaches and options with `when`; give results `Outcome`s with a `ledger` line; end
  on an `ending` stage whose last ending has no `when`. `validateStory` checks every mark read
  is set somewhere, every thread named is kept, tones are real and every region has road
  events. **Add a road event or a voice line:** `content/shared/road/events.ts` (effects may
  name only `daylight` and `charge` threads) or `content/shared/talk/voices.ts` (every trait
  needs a line for every moment).
- **Add foes to a mission:** use an `encounter` stage (recon, then an approach, then maybe a
  fight) with a shared template (`content/shared/encounters.ts`: which approaches and recon make
  sense, base alertness, flavour a stage may swap) and a `job` kind; how each way past pays per
  job lives once in `systems/missions/encounterPay.ts`. Keep a plain `combat` stage only where a
  straight fight is the point (a duel, a surprise attack). On team jobs a check falls to the best
  teammate for it (`bestHandFor`, `game/missionRoles.ts`).
- **Add a school technique:** a fighting style (Lantern Wind, River Draw…) is techniques with
  the same `school`, taught by that school's teachers (`teaches`), never shelved. Standard
  techniques (no `school`, no `clan`) go on the academy rack (E–D) and the library (C open
  shelves, B restricted), so every art has plain moves at every grade before any style.
- **Add a combination technique:** two `TechniqueDef`s whose `combo.partnerTechniqueId` name
  each other (validated); offer them at the academy. A teammate knows the half in their
  specialty, and a half plays only beside someone on your side who knows the other.
- **Add gear:** add a `GearDef` (`kind` weapon/armour/focus with its shape, level or boosts,
  `rank`, cost) to the pack's `gear` and list it at a `gear` place (a smith, an outfitter);
  `unique` pieces are never listed. **Add an ingredient or recipe:** ingredients go in
  `shared/kitchen.ts` (sold at a market stall's `ingredientIds`) or `shared/wilds.ts` (found
  in a `wilds` place's `finds` or a fishing spot's `catches`), and must be one or the other
  (validated); recipes go in
  `shared/recipes.ts` (or a pack's own list) with a `rank`, one role (don't make a bigger copy
  of another dish's buff) and a way to learn it: a cookbook (`CookbookDef`, sold at a stall's
  `cookbookIds`), a person's `recipes`, or a job's `reward.recipeId` (validated). **Add a meal
  effect:** a field on `ModifierSpec` combined in `combine`, worded in `describeSpec`, read at
  one hook in `game/`.
- **Add village life:** rumours (`missionId` for a job hint, `personId` for gossip), night
  sights (with a small stat `reward`) and festivals (season, day, `marketPrices`,
  `bondBonus`, optional `stalls` of festival-only food) go in the pack's `village`. Give a
  person a `favouriteRecipeId` to make dinner with them special. Give shops and stalls `hours` if they close.
  Validation checks references, real dates and that nothing is never open.
- **Add a build or upbringing:** add a `BuildDef` (`shared/builds.ts`: starting bonuses, a
  `ModifierSpec` whose `limitBonus` moves strength and speed limits, and `comfortStrength`) or an
  `UpbringingDef` (`shared/upbringings.ts`: `family` clan or clanless, `earlyTraining` points,
  an optional `focus` they must go into, and a spec). Every pack needs the defaults old saves are
  given (`DEFAULT_BUILD_ID`, `DEFAULT_UPBRINGING`; validated).
- **Add a kind of student (quick pick):** add an `Archetype` to `systems/profile/archetypes.ts`:
  where its training goes (slots: a stat, `specialty`, `clan-arts`), its gifts in order, an
  optional flaw and bloom. Tests check every quick pick spends the file and never more.
- **Add a conversation:** add a `ConversationDef` (generic, or with `personId`) with a
  `minStage` and choices that each carry a `Tone`. Traits' `likes`/`dislikes` decide how a
  tone lands, so new tones need tastes on the traits that care.
- **Add talk for everyone:** a `ConversationDef` with `about` (specialty, trait, clan or role)
  is a template: anyone with a topic of that kind may say it, and its `{slots}` are filled from
  the topic. The slots each kind offers are `TOPIC_SLOTS` (`content/conversationTopics.ts`);
  topics give exactly those words (validated). Shared templates and topics live in
  `content/shared/talk/`; clan topics in each pack. A friend's newest stage is talked about first.
- **Add a discipline:** add it to `STAT_IDS` and `DISCIPLINES`, a colour token, a card glyph,
  starter technique in every pack's `disciplineStarters`, drills, and a save migration that
  gives existing characters the base value.
- **Add a backdrop or icon:** add the id to `BackdropId`/`IconId` in `content/art.ts` and the
  drawing to `ui/art/` (a `Record` keyed by id, so a missing drawing is a type error).
- **Change the save shape:** bump `SAVE_VERSION`, add a migration in `game/persistence.ts`, and
  a test that a previous-version save still loads. Never break existing saves.

## Code quality rules

### Structure

- One concept per file. **Files ≤ 300 lines (enforced)**; split before you hit it.
- Every module folder exposes a deliberate public API through `index.ts`; everything else is private.
- Functions do one thing: **complexity ≤ 15, nesting depth ≤ 3, ≤ 4 parameters (enforced)**.
  Group related parameters into a named object type rather than adding a fifth.
- Prefer pure functions `(input) => output`. Side effects live only in `ui/` and `platform/`.
- Put logic in the lowest layer that owns it: formulas in systems, orchestration in `game`,
  presentation in `ui`. If the UI is computing game rules, move it into a view model.

### TypeScript

- `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` are on. Don't weaken them.
- **No `any` (enforced).** Use `unknown` and narrow. Casts (`as`) only at true trust boundaries
  (deserialising a save, decoding an engine's opaque state), with a comment.
- **No `enum` (enforced)** — use string-literal unions (`as const` arrays when you need a list).
- **Named exports only (enforced).** `import type` for types **(enforced)**.
- Mark data `readonly`. Model alternatives as discriminated unions and `switch` exhaustively
  **(enforced)**.
- Expected failures return `Result<T>` (`core/result.ts`); `throw` only for programmer errors
  (e.g. an unknown id that validation should have caught).

### Naming & readability

- Names say what things are in game terms: `missionsCompleted`, not `mc`; `slotsUntilNextMorning`, not `calc()`.
- Tunable numbers are named constants at the top of the file (`HOSPITAL_FEE`), not magic numbers.
- Comments explain **why** or a non-obvious rule, not what the next line does. Every public
  module gets a short header comment describing its responsibility.
- Player-facing text lives in content or in the handler that produces it — keep it in one place.

### Testing

- Every system has a colocated `*.test.ts` covering its rules and edge cases.
- Game-layer behaviour is tested by dispatching actions (`src/test/gameFixtures.ts`).
- Use seeded `createRng(n)` for anything random; tests must be deterministic.
- A bug fix comes with a test that would have caught it.
- The UI has smoke tests (`ui/App.test.tsx`) for the core loop; keep them passing and add one
  for each new screen.

### UI design rules (the "Village Hub" design)

- **Navigation has three layers.** The dock (里 Here · 旅 Travel · 術 Jutsu · 縁 Bonds · 忍 Shinobi · 記 Record)
  is always present except in scenes. _Here_ is the current location's village screen, whose
  place cards open place pages. Scenes (missions, fights) take over the whole screen and
  return to where you were.
- **Each page is designed for its job**, not built from one generic list: training is a drill
  board, the market is stalls with price tags, home is your room with tappable objects, the
  mission hall is a notice board, the academy is a scroll rack. New place kinds get their own
  presentation.
- **Every village looks different**: backdrop + sky by time slot (`.sky[data-slot][data-land]`).
- **Feedback lands near the thumb**: the ticker above the dock, the choice bar in scenes, and
  report cards for milestones (fight result, mission debrief, defeat).
- **Story text never contains numbers.** Numbers go in chips: green gain, amber cost, red harm.
- **Discipline colours are fixed**: taijutsu ember, ninjutsu blue, genjutsu violet, kenjutsu
  steel, fūinjutsu ink-gold, spirit teal.
  Techniques are always shown as the same card (`TechniqueCard`), in the deck and in fights.
- **Disabled things say why**, and when possible what fixes it ("Needs 30 energy. Nap or eat first.").
- **Locked content folds away** (sealed notices, "Coming up" scrolls, coming-soon destinations)
  with what unlocks it.
- **Materials, not app chrome.** The look is a lantern-lit village at night: paper (notices,
  records, slips), lacquer and wood (panels, the dock), ink (stamps, seals). Surfaces carry the
  washi grain (`--grain`, `--grain-ink`); corners are near-square (`--radius`). Status marks are
  ink stamps (`.badge`, `.place-badge`), never filled pills. Colour marks meaning (a discipline,
  a gain, a cost), never decoration: no gradient fills on cards or tiles.
- **Avoid the generic-template look.** No small uppercase letter-spaced labels (labels are
  sentence case; a section label is a serif heading), no " · "-joined meta lines (write a
  phrase), no coloured left-edge bars on cards, no emoji. Check new screens by screenshot at
  390px, not just by tests.
- **Tokens only**: colours, fonts and radii come from `ui/theme/tokens.css`. Icons and scenery
  are inline SVG in `ui/art/` (offline, no image files). Tap targets ≥ 40px. Motion is subtle
  and always disabled under `prefers-reduced-motion`. Night is the default theme.

### Formatting & hygiene

- Prettier decides formatting **(enforced)**. ESLint must pass with zero warnings **(enforced)**.
- No dead code, commented-out code, or orphan files **(enforced for orphans)**.
- Keep dependencies few. Justify any new runtime dependency.

## Definition of done

1. `npm run check` (and `npm run check:release`) are green.
2. New behaviour has tests; boundaries respected without lint/arch exceptions.
3. Save compatibility preserved (migration + test if the shape changed).
4. Works at phone width (≈390px) and offline.
