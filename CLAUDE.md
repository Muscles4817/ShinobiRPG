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
    modifiers/ profile/ bonds/ inventory/ cooking/ travel/ collections/
  content/    Content schema, validation and the pack registry.
    packs/<id>/   One complete setting: locations, places, techniques, missions, text…
  game/       Composition layer: GameState, player actions, mission flow, save/load, view models.
  platform/   Browser adapters (localStorage save and device-settings stores).
  ui/         React. theme/ (tokens), art/ (SVG icons & backdrops), audio/ (synth & music), components/, screens/.
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
    alike. A year's generated classmates include a varying number of **clan children**
    (`people/yearClans.ts`, from the seed: none in a thin year, several in a strong one), raised
    in their clan like a clan-born player; graduation day reads out the year's **honours**
    (`views/classHonours.ts`: the year in order by real standing, your place kept in your
    standing's band, top of the year, the clear best in each art, honours by trait, dead last,
    and how strong a year it was) before the teams. Academy grades are a reading of the starting arts (`gradesFor`), never chosen. Chakra
    **nature is found, not picked** (`game/nature.ts`): read from the seed at creation (a clan's
    nature most of the time) and hidden (`natureKnown`) until the chakra paper scene that follows
    team assignment (`testChakraPaper`). Until then it counts in fights only: no study bonus, no
    nature techniques, no sensei can see it. **Special notes** (`TalentDef`) stack: each is
    weighed major, minor or a flaw, the standing sets the room (`STANDING_INFO.notes`; a flaw
    makes room for a minor note, `systems/profile/notes.ts`), and there is no other cap: a full
    file is an easier game. Notes may be one-sided (`TalentDef.aptitude` fixes a stat, 0 =
    never). **Habits** (`QuirkDef`) are free and tilt how fast people of the traits they name
    warm to you (`warmed`). The file is **read back** in words before the essay
    (`views/fileReadBack.ts`: how hard the road looks, what comes easy and hard). The pacing bench
    (`src/test/pacing/standing.test.ts`) checks the spread and that the dead last can climb.
13. **People are data, wherever they come from.** Authored people (`PersonDef`) live in the
    pack; generated genin are built from the pack's name pools by `game/people/generator.ts`
    and stored in `GameState.people.generated` in the same shape, so every view and action
    treats them alike (look people up with `findPerson`, never `content.people` alone).
    Schedules place people at places in their home location by time slot: the start village,
    or a town they live in (`homeLocationId`, only `shinobi` and `villager` roles; `villagers`
    keeps them off your village's crews, teams and dinner table). Bonds (points,
    stages, tone reactions) are the `bonds` system; who reacts how comes from trait tastes.
    Clans live in **compounds** (`docs/design/compounds-plan.md`): a `compound` place per clan
    behind one `quarter` card, entered by an outsider only as the clan's `outsiders` stance
    allows (welcoming, reserved, guarded: the bond needed with anyone of the clan by day; bonded
    at night; `game/compounds.ts`), and someone home behind a shut gate can't be talked to. The
    village screen's Who's here shows only people you know out and about.
    A person's **profile** (`views/personSheet.ts`) is one paper sheet that grows with the bond:
    a stranger's shows who they are, a read of them and what the next stage opens
    (`views/bondPath.ts`, read from the rules that open it); an acquaintance's (or a teammate's)
    adds their day, what they can do and are growing into (`views/personFacts.ts`), what they'll
    teach you and a genin's growth since the academy; tastes come with friendship.
14. **Scenes are derived from state.** `activeScene` decides what takes over the screen
    (fight › encounter › mission › conversation › team assignment › chakra paper › the sensei's
    first meeting). Anything that must happen before
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
    the stat until a bond stage), signature `teaches` (taught only once the teacher can do them
    at their current grades), sessions a week and a templated price
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
    styles differ in decisions, not maths. Bloodlines reach combat as perks (`insight`; an awakened bloodline's `kekkeiGenkai.perks` add `foresight`, which slips, counters and sees techniques coming more often and adapts between rounds as a foe does, and `mimicry`, which copies a technique watched into the kit and plan: `rules/eyes.ts`, `plan/mimicry.ts`). A fight has a **ground**
    (`CombatSetup.ground`, `rules/ground.ts`: arena, forest, town, room, lake; arena when unset):
    the distances it has room for (a room has no far), cover for hiding, far attacks lost among
    trees or walls, elements it feeds, and footing (on a lake only water-walkers keep theirs). In
    a room an area catches its user's own side. Walking on water or trees reaches a fight as a
    perk (`game/footing.ts`: what you've mastered, chūnin and up, deadly foes). A **nature** is an affinity, never a shield: it strengthens
    techniques of its own element, and elements meet only where techniques meet (`rules/elements.ts`):
    an elemental wall (a substitution with an element) holds against an element it overpowers and
    breaks under one that overpowers it, and an elemental attack aimed at someone about to throw one
    back is met in a **clash** (`plan/clash.ts`: if they see it and are quick enough), the
    overpowering element carrying through; between even elements the clearly stronger technique.
    Each side stands in a front and a back **row** (`rules/rows.ts`, placed by kit or
    `CombatantSetup.row`): a blow up close can't reach the back row while the front stands;
    throws, longer-reach techniques and area effects can. Ask `canReach`, never test rows inline.
    **Health is 100 for every human** (`MAX_HEALTH`); creatures scale it with
    `EnemyDef.healthScale`. Damage comes from the **gap** between attacker power and defender
    defence (`rules/damage.ts`: a ratio of ratings, narrow variance), so equals trade the same
    blows at every grade and each grade of difference is decisive. **Whether an attack
    reaches** is one avoid roll for every attack, technique or plain blow
    (`rules/avoidance.ts`, `plan/avoid.ts`, `docs/design/hittability-plan.md`): a read (eyes
    and wits against the attacker's speed and skill; hand signs give a technique away more than
    a fist), the defender's avoid rating against how fast it arrives (speed with perception;
    a genjutsu is noticed, willpower with perception), a stance (anyone slips some, a ready Dodge
    many more), accuracy and an area's size (wide hard to get clear of, vast impossible). A hit
    that lands is not yet a hold: each condition rolls against its verb's resist (a pin against
    what breaks a hold of its art: strength, chakra control or willpower; a daze against poise;
    a seal against chakra control; `conditionResist`). Then guard and counter (taijutsu,
    strength) in `rules/defence.ts`: everyone guards against physical attacks, a blow meeting
    toughness or, where it is better, a blend with hand-to-hand guard (`physicalDefence` in
    `rules/damage.ts`), and a ready Guard catches much more; toughness
    is stamina (plus `armoured` kit), and toughness and will both blend in the fighter's best art
    (`SKILL_DEFENCE_SHARE`: skill defends, so specialists of a grade don't one-shot each other);
    no hit takes more than half the target's health (`cappedHit`). A daze costs the target their
    next turn and leaves them open (no dodge, a finisher target, though a Guard still works);
    afterwards they are steady for an exchange (`canDaze`), so dazes can't be chained. A plan is
    **actions** per distance, two to five by intellect grade (`slotLimit`: E 2, D 3, C 4, B+ 5):
    techniques, tools, Search and Dispel. Defences and footwork take no slot
    (`plan/readiness.ts`): each distance keeps **one defence** ready (Guard, Dodge, Counter or a
    substitution; never stacked) that reacts on its own, and a plan may say where to **fight at**:
    the fighter steps towards it first (after an emergency slot), and a step still costs the turn
    (`plan/stepping.ts`) and leaves them unable to set a Guard or a Counter that exchange
    (`plan/steps.ts`). At mid and far a plan may **hold off** with kunai or a wounding
    technique (`plan/zoning.ts`, `rules/zoning.ts`): whoever steps in on a holder who hasn't
    acted yet meets that shot instead of the step's own contest (aim against speed, areas far
    harder to get through, a vast one impossible, and short of vast never certain), spending the holder's turn, and the
    fire is told as the holder's (with why it worked). A fighter making for a distance readies the
    charge first (an empower, clones) and goes in with an **entry** where they have one (a technique
    that moves them in to strike, `isEntry` in `plan/stepping.ts`), which meets a hold-off as a step
    does (`charge` in `plan/steps.ts`). Clones on the closer's side (theirs or a teammate's) run
    ahead and may draw the shot (`plan/screening.ts`: solid ones as often as they'd take a hit,
    illusions half that; an area bursts them all), clones crowding round a fighter help their
    step, and a hit heavy enough tears through the clone it strikes into its maker with half its force (`carriesThrough`).
    Clones come in **kinds** (`rules/verbs/cloneKinds.ts`: illusion, water, wind, earth,
    lightning, fire, shadow; named on the clone effect or following the technique's element),
    each with its blow, its upkeep paid every exchange (`plan/cloneUpkeep.ts`: clones the maker
    can't pay for fade) and its trick: earth may stand a hit and rebuilds, lightning shocks a
    blow that bursts it up close, wind screens a charge best, fire feeds itself, shadow clones
    strike hardest and cost most; without one, they step home only when nothing slotted does anything
    there, else throw a plain blow (never slotted). Foes play
    their default plan by priority, as the player does, as often as their judgement keeps them to
    it, and instinct otherwise (`plan/judgement.ts`: intellect grade sets plan adherence, whether
    they read you in the moment, how hard instinct leans on a read, and how soon they adapt); a default plan keeps its best attack, brings a Search against a foe that
    hides, leads with a pure hold when every foe outclasses its owner's best art and a teammate
    still has a matchup worth fighting (`plan/roles.ts`: set them up rather than trade head-on), and a kit that fights from one distance makes for it (`fightsFromHome`). Fighters **read** each
    other (`reads.ts`: defences seen per distance, attacks by style, public to opponents); foes
    put it to use (`adapt.ts`): an attack that `beats` your seen defence comes first, a blow
    that walks into a seen Counter is held back, and between rounds, after enough attacks (`adaptsAfter`),
    a foe keeps the defence that best meets what you throw. Foes fight as a **team** when one of
    them reads a fight in the moment (`plan/foeTeam.ts`): stances like your teammates' (the
    sturdiest front-row foe covers the frailest back-row one, back-row casters with holds
    support, the rest press) and a `foeMark` on whoever on your side would fall soonest. A technique leaned on is read: past its first uses, a foe who reads the fight reads it
    more easily each time, and a mind that reads the fight reaches less for one played turns
    running and changes up a slotted attack against such a foe (`rules/familiarity.ts`). Left to their judgement, foes and
    teammates go for whoever is most worth it (`plan/targeting.ts`: the harm they do over the hits
    they'd take to fall), and a mind that reads the fight keeps chakra for its finisher
    (`plan/pacing.ts`). Chakra ebbs and flows (`rules/chakra.ts`): an area costs more for the ground it
    covers (wide ×1.5, vast ×2.2), and each exchange gives back a little, or a share of deep
    reserves. Holds are fought, not waited out (`rules/escape.ts`, `plan/struggle.ts`): a pin
    keeps its `grip` (how strongly it was cast, what breaks it), the held struggle against it at
    the end of each exchange, and a teammate may spend their turn pulling them free (the player's
    teammates always; otherwise a mind that reads the fight). A `channelled` pin keeps its
    caster's turns and hands on it, is far harder to break while they hold it (a teammate goes
    for the caster instead), and breaks when they are hurt or dazed, freeing its target of it and
    its seal (`plan/holding.ts`). Healing is ninjutsu with chakra control; chakra control
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
    Some fighters bring more than one body (**retinues**, `docs/design/retinue-plan.md`). By
    default a companion is just one more fighter on their side, by its own judgement, fighting
    on if they fall; it hits no harder for being theirs (combination techniques and what a bond
    unlocks are earned). A retinue is a real advantage, never balanced away. A foe's
    `EnemyDef.retinue` is expanded by `enemyParty`; each body has
    a `tell` (open, kept, hidden) that sets how likely a glance is to see it before the fight
    (`game/retinueSight.ts`: perception, by hash, never certain short of open), and scouting
    rates a foe with what it sees (`opponentPower`, `partyPower`). The player may have a
    **companion** (`systems/companions`, `game/companions/`): a bonded creature of a
    `CompanionKindDef` (temperament bred, stray or wild: how fast it bonds and how late it takes
    orders), born to a clan (`ClanDef.companion`), a stray won over in the village
    (`befriendStray`, drawn from the seed and day), a wild one tracked over days in a wild place of
    its biome (`trackWild`, `game/companions/wild.ts`; perception raises the odds), a kennel's pup
    (`VetFields.pups`, `takePup`: a gift to a close friend of the vet) or an animal a job rescues
    (`reward.companionKindId`: it waits at the vet until you take it; one companion at a time, so
    a vet also rehomes yours, `rehomeCompanion`). **Its body grows with time, its skills with
    training** (`systems/companions/growth.ts`, `game/companions/body.ts`): a kind's `body` is an
    adult strength, speed, stamina and perception and the days a pup takes to grow into them; each
    animal's genes roll that body (a kennel line never below its kind, a stray rougher), each day
    grows it (half when hungry, not at all starving), and nothing passes its ceiling (a dog is
    never as strong as a bear). Strength, speed and stamina are never drilled; skills are, by the
    handler rule (`trainCompanion`: how you handle it, not your own grades). It arrives as old as
    its way of coming (`ARRIVES_AT`: a kennel or rescued pup small, a stray or wild one grown); a
    pup is too young to fight and stays home. Its light routine is caught up each morning like
    peers', it fights beside you in every mission fight (never a spar: those are one against
    one), and takes stance and then card orders only as the bond opens them (`ordersOpen`); the
    bond grows from a game, a proper meal and the day's first training, and drifts on scraps alone.
    **The bond opens its arts** (`game/companions/arts.ts`): a kind's `techniques` open at bond
    stages (`shared/beastTechniques.ts`: kinds' own, never learned by people), the deeper ones
    (`handler`) only once a clinic's handler teaches them (`VetFields.handling`, `handlerTeach`);
    one is half of a combination with the academy's Pincer Strike; and at close friends it takes
    a crew job's checks in its kind's `roles` when its nose is best (`checkHand`). Handlers drill
    it better than you (`handlerSession`, their `quality` over yours), and handling lore bought
    far from home (`companionLore`, a gear place's `loreIds`) makes your own sessions count more. It is cared for
    (`systems/companions/care.ts`, `game/companions/`): a meal a day (scraps, its kind's `diet`,
    a favourite found by feeding), a game by its tastes, training together as its teacher at a
    training ground; hunger weakens it and a starved stray leaves; its health carries between
    fights (`CombatOutcome.allies`), and knocked down it is laid up until mended, sooner at a
    `vet` place or with medicine.
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
    and changes the cards (a blade's cut, needed for kenjutsu, harder than a fist, first to
    strike up close unless a foe's hands are well clear of it, open to counters in an unskilled
    hand, and in the way of hand signs short of far: `rules/blades.ts`; knuckles; thrown steel and senbon;
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
    are bought or gathered: `wilds` places (woods, river, shore, marsh, mountain water) are
    foraged (`forage`) and fished (`fish`, by spot) once a day each, drawing from `finds` by
    season, hour and cooking grade (`shared/wilds.ts`, `shared/waters.ts`, fish in `shared/fish.ts`).
    A fish has a **family** (white, oily, freshwater, shellfish), and a recipe slot may take any
    fish of one (`FamilyCount`): the cook's chosen fish first, then the cheapest, and the dish is
    named for it (`game/pantry.ts`; read a recipe's ingredients only through it).
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
    more for their `favouriteRecipeId`. Night-only places are `tavern` places (a bar: an
    izakaya, a teahouse, a gambling house) with `hours`; people's schedules bring regulars in
    at night, a round (`buyRound`) warms everyone inside once a night, and the counter hears
    more gossip (`rumoursOverheard`). **Off duty is where bonds are made**
    (`docs/design/village-places-plan.md`): a drink with one of the crowd (`drinkWith`,
    `game/bar.ts`) or a soak beside someone at an `onsen` (`soak`, `game/onsen.ts`) is the
    day's time with them, like a talk or a dinner, worth what their traits make of its tone
    (`game/people/together.ts`: you pick the drink's tone; a soak is quiet). A bar's
    `pastimes` are scenes, and one with a `game` is played: **chō-han** (`playDice`,
    `game/dice.ts`), a stake on the cup coming up even or odd, the house taking a cut of a
    win, a few rounds a night; the cups hash the seed, day and round (never the Rng), so
    perception can sometimes hear one settle before you bet. A soak costs
    ryo and a slot, gives energy and some health, and leaves you `soaked` (warm through: a
    `ModifierSpec` that `spendTime` clears at the day's end, like the meal); one a day, and
    the baths close at night (validated).
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
    The exam is the main road to chūnin, not the only one (`exam/routes.ts`; each ceremony keeps
    its `route`, which picks what is said): a genin who is ready (`readinessGap`) is raised in the
    field for a clean B-rank or deadly job, at the end of an arc with `recommends` (its patron's
    words), or on their sensei's word at a lesson after a year (high regard, no exam days away,
    never a sensei who holds students back).
    Jōnin are nominated (`notePromotions` in `dispatch`) once the record earns it, in a ceremony
    that reads the record back; S-rank hunts for jōnin-grade rogues are theirs. Those not
    sitting it are **spectators** (`exam/spectators.ts`, the exam's `spectators` lines): in the
    week before, your sensei invites you to watch when they won't put you forward (a teammate
    tells you instead when your sensei's grip is loose), and on the day anyone at home may spend
    an afternoon watching the finals (`watchFinals`): two finalists from the seed, above the
    last round's rival, in a watched fight (`exams.spectating` routes its end to
    `resolveFinals`: a card, a little perception and intellect, nothing else).
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
    (marks, threads, who is along, world marks and village **tallies**: counts kept across jobs
    such as `mercy`, moved by a `tally` effect and read as they stood when the job began); one that doesn't hold is passed over (`game/story/state.ts`
    `settle`), so a story branches by stages appearing, not by a graph. Results carry
    `Outcome`s (effects plus a ledger line): failing forward (`onFailure: 'forward'`) sets marks
    rather than docking pay. Story stages are `decision` (options with a `Tone`: the crew's bond
    and the charge's trust move by their tastes, and whoever felt it most says so; an option
    whose `when` fails may still show, closed, with its `unseen` reason), `camp`
    (pick a few activities before the fire burns down) and `ending` (the first that fits). A
    `leg` with a `region` may bring a road event (`content.roadEvents`, drawn by hash). A job
    may have a `charge` (whose trust is a thread) and `twists` (a hidden mark rolled at the
    start). What the crew say comes from `content.voices` by moment and trait. The **debrief**
    (`game/debrief.ts`) reads it all back: the ledger line by line with the pay each moved (a
    `noted` outcome, a clue found, gets a stamp),
    each crew member's bond since the start and last word, a grade (clean, rough, botched), and
    on a failure what would have helped (the best approach to the check, or the foe's trick).
24. **Jobs leave something behind.** Outcomes can make the village remember (`world` effect →
    `village.marks`) and give everyone along a shared memory (`memory` → `village.memories`).
    What lasts (world marks, tallies, memories) is held on the run and kept only when the job
    is done (`releaseHeld`), so a failed job leaves nothing behind. A job with `needsWorldMark`
    is posted only once the village remembers it (a follow-up), one with `closedBy` no longer
    once it remembers that, and a `once` job never after it is done (a job that counts a tally
    must be `once` or an arc's, validated);
    a rumour with `worldMark` goes round only then, ahead of other talk. Memories show on the
    person's sheet and come up by the fire. Clients count the jobs you've done for them
    (`village.clients`, `game/clients.ts`); one you've worked for asks for you by name and
    pays `CLIENT_RETURN_SHARE` more (not on standing jobs). `validateStory` checks every world
    mark waited for is one some job leaves behind.
25. **Long stories are arcs of jobs.** An `ArcDef` (`content.arcs`, `systems/missions/arcs.ts`)
    is acts of jobs following Harmon's circle; an act's jobs are open together once the act
    before is passed, never posted at random (`Availability` kind `arc`). An act's `pass` says
    how: every job (`all`, the default), `any` one (leads: the rest stay open until a later
    act's job is done) or `one` (a fork: taking one closes the others). Jobs read
    earlier acts through world marks (`remembers`, a snapshot taken when a job starts). The
    board pins each arc under way (`views/arcs.ts`: its rule as a stamp, the act's jobs, which
    open their notices, and leads still open), and a job's notice says what finishing it will
    close (`arcNote`: a fork's other roads, leads not followed). An act may be based in another town
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

27. **The genin years are sensei-led** (`docs/design/sensei-plan.md`). While you are a genin with
    a sensei (`underSensei`, `game/mentorship.ts`) they run your week. How each sensei does it is
    data: `SenseiWays` on the `SenseiProfile` (`content/senseis.ts`: philosophy, lens, grip,
    cadence, formats, feedback, rituals, rewards, mission posture, opening test, gatekeeping,
    class regard; validated for coherence in `validateSenseis`), and every dimension is read by a
    rule, never only by text. The week (`game/sensei/plan.ts`) is drawn from the seed and the
    week, never the Rng: their cadence of meetings, the first the full lesson, the rest short
    sessions in their formats (`senseiSession`: energy, no time slot, a share of a lesson split
    over the week). Your sensei's **regard** (`GameState.mentor`, `game/sensei/state.ts`) is
    their judgement of you, apart from the bond: kept meetings raise it, missed ones lower it by
    their grip as each day is settled (`settleMentor` in `spendTime`; excused on a job, away or
    laid up), and the nomination reads it. Their gatekeeping sets the pass and permit bond stages
    and how many jobs a nomination wants; their mission posture sets their stance in a job's
    fights. After each lesson they coach you (`game/sensei/coaching.ts`): judge last week's
    **assignment** (a stat to raise a step, set by their lens; open, it is a `ModifierSpec` on
    the character, off your best art) with a reward of their kind or lost regard, may name a
    talent you haven't found, and read you aloud (`read.ts`: your thinnest defence, what beat
    you, your edge). The **first meeting** (`opening.ts`, a scene after the chakra paper) is
    their test from the pack's `senseiTests` (never failed: your approaches against their
    philosophy set regard) and one question: shown everything, or not. The **curriculum** (the
    pack's `curriculum`, ordered by philosophy in `curriculum.ts`) is the tutorial: one beat a
    day on the sensei's slip, each once it makes sense (the slip itself always first, food
    first once you go hungry); nothing is locked behind it. Turning up raises regard only to
    `ATTENDANCE_CEILING`; past it, only what you do counts. On a job they lead, an evening
    with them is a camp choice of its own (`story/fireside.ts`): a little of who they are, and
    what they saw of you. Once a
    week they keep a **team day** (one of their rituals) and pick a job off the board for the
    team. Their **story** (`ways.story`) is four personal conversations by bond stage; a reply's
    `worldMark` may open their arc. The chūnin ceremony carries their **farewell**
    (`farewell.ts`: a parting gift, a memory), and the rank ends the years. Read a sensei's ways
    only through `waysOf` (`generate.ts`): a pack may leave `ways` out, and they are generated
    from an archetype (`content/senseiArchetypes.ts`), coherent by construction.

28. **Senseis can be composed from hand-written parts** (`docs/design/sensei-generation-plan.md`).
    A pack's `senseiParts` (`content/senseiParts.ts`) are **temperaments** (how they talk and
    teach: an archetype for their ways, a style, a lesson, a bio, traits, a haunt and a voice
    kit), **pasts** (a wound, four story conversations with slots, a foe and the text of a
    two-job arc, plus which temperaments, arts, nature and regions fit them and how they bend
    the ways) and the pack's **grounds** (where a past is settled) and grown-up **names**. When
    the context is built, `withSenseiPool` (`game/sensei/pool/`) composes one sensei for every
    past and every temperament that can carry it, from the pack and the sensei's id alone
    (`pool-<past>-<temperament>`, so adding parts never renames anyone): a `PersonDef` with
    `sensei.pooled`, `voice` and concrete `ways` (bent by the past only as far as
    `senseiWaysProblems` allows), their four conversations, their foe, their arc's jobs (posted at
    the home hall) and the arc. They are ordinary content, so every system reads them and
    validation checks them (`senseiPool.test.ts` validates the expanded packs). A save meets only
    the few its seed draws (`game/people/pooled.ts`: `POOL_IN_VILLAGE`, different pasts,
    temperaments, arts and names; `everyone` leaves the rest out) and its own sensei; team
    assignment offers the best fit and the best fit in another art from the other side of the
    roster (one authored, one generated). A sensei's `voice` speaks in coaching, by the fire and
    at the farewell; authored senseis may have one too.

29. **Sound is synthesised, decided by the game, played by the UI.** No audio files: every
    sound and loop is built on the Web Audio graph (`ui/audio/voices.ts`: koto, flute, taiko,
    bell, clappers…), so it works offline and costs nothing to ship. The game names the moment
    (`game/sound/`: `soundAfter` for an action, `reportSound`, `beatSound` for a fight's beats,
    `musicMood` from the scene, clock and calendar); `ui/audio/effects.ts` says what each
    `Sound` is made of and `loops.ts` how each `MusicMood` goes (bars of scale degrees, read by
    `score.ts`, varied by hash after the first time round, never `Math.random`). A
    fight's sounds grow with the turn behind them: the plan engine tags each turn's lines with
    its **force** (`forceLine`, `plan/staging.ts`: the maker's grade in the art, an area's
    size, the element), `beatSound` passes it on, and `ui/audio/force.ts` layers an echo, a
    boom and a roll by grade, a swell by area and a colour by element over the plain recipe. Volumes
    (`AudioSettings`) belong to the device, not the save: a second `SaveStore` (`prefs`) holds
    them. Audio starts on the first tap, as browsers require; every enabled button taps.

30. **Days end with a sheet** (`docs/design/day-end-plan.md`). The day's record
    (`GameState.daybook`, `game/daybook/`) is a snapshot taken at dawn (`openDay`) and compared
    at the next (`closeDay`) by `noteDayEnd` in `dispatch`, so a day ends the same way whether you
    slept (`sleep`, `takeRoom`) or pushed on through the night, and no action logs anything for
    it. Days on a job, a journey or an exam aren't kept (the debrief tells them). The sheet
    (`views/dayEnd.ts`) shows only the sections something happened in, each kind of change with
    its own look (moments sealed, growth as a grade bar, people with what getting closer opens
    next, finds as tiles, the purse as ledger lines read from the record's ryo chips), and the
    day ahead as plaques (`views/dayHooks.ts`). `settings.dayEnd` picks the full sheet, a morning
    slip or nothing.

31. **You have a rival** (`docs/design/rival-plan.md`, `game/rival/`). Once your team is settled,
    `chooseRival` takes a classmate on another team by a **shape** rolled from the seed (prodigy,
    neck, chaser, fallen: the gap is never evened out) and a temperament from their traits. The
    `rival` slice keeps their **heat** (Bitter to Sworn; replies move it by tone and their
    tastes, and your team and sensei lean by theirs: `replies.ts`), the **tally** (spars, races;
    first to each grade, scored by `noteRival` in `dispatch`), at most one **challenge** (theirs
    on the day's turn, on the ground that suits them, lapsing after the next; or yours from
    their sheet, once a day, for pride or a purse) and one **beat** (a moment waiting for your
    reply, a provocation among them: a scene with a `busyReason`). A **race** (`race.ts`) is
    three legs of steady, push or the roofs, each answering another, with their move read by
    perception. The **cruel** tone needs knowing them; barbed replies leave them `rattled` for
    the next race. A rival behind you trains harder (`drive.ts`), the one open exception to
    peers growing by the same rules. Their ink is `--rival`, never a gain or cost colour.

32. **Homes are a ladder you furnish** (`docs/design/home-plan.md`, `game/home/`). A pack's
    `homes` (`HomeDef`: rent and/or price, `needs`, spots, rooms) are let at a `lettings` place;
    you start in your rented room (or your clan's) with `FIRST_HOME_SPOTS`. The housing slice
    keeps `homeId`, owned `furniture`, what is `placed` in each spot, the garden's `beds` and a
    `guestId`; moving (`moveHome`) keeps your furniture. A piece (`FurnishingDef`) does one thing,
    read at one hook while you are at home (`comforts`: sleep, nap, study, guests; decor is
    comfort only), and comfort warms dinners at home. The finest pieces are gifts from new close
    friends (`noteHomeGifts` in `dispatch`). Rooms: a garden (`GardenCrop` from seed), a yard
    (cheaper drills) and a guest room (the guest is home every evening). The keepsake shelf is
    read from memories, rival wins and ranks, never stored.

33. **The field book collects what you find** (`docs/design/field-book-plan.md`,
    `game/fieldBook/`). The `fieldBook` slice (`systems/collections`) keeps counts: catches (the
    longest, measured from `IngredientDef.length` by hash, never the Rng), finds, sights followed,
    foes fought and beaten, and pages rewarded; it is written at the action that causes it
    (`fieldBook/record.ts`). The pages are read from content (every spot's fish, every wild find,
    every recipe, every sight; foes you've met or a report named), so a new fish or sight is a
    new slot with no code. Empty slots give a hint (where and when, the sight as unseen), never
    the name. A full page leaves its `content.fieldBook` reward once (`noteFieldBook` in
    `dispatch`): a furnishing only it gives, and a keepsake on the shelf. New entries make one
    line on the day's sheet.

### Content packs

- A pack is `src/content/packs/<id>/index.ts` exporting a `ContentPack`; register it in
  `src/content/packs/index.ts`. Validation runs on it automatically.
- Fan packs (names we don't own) go in the conditional branch of the registry, so
  `VITE_EXCLUDE_FAN_PACKS=true` tree-shakes them out. CI's `check:release` fails if fan names
  leak into a release build; add a marker for each new fan pack to `scripts/check-release.mjs`.
  Build a fan pack's object inside a `/*#__PURE__*/` IIFE and mark content helpers called at
  module level `/*#__NO_SIDE_EFFECTS__*/`; otherwise array spreads and calls keep its data alive.
  Name a fan pack's jobs in its arcs by literal id, not `JOB.id`: a property read survives
  tree-shaking and keeps the job's text in the release build.
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
- **Add a location:** add a `LocationDef` with a backdrop, a `map` point (and a `label` side if its name would
  run into a neighbour's) and places, and a `RouteDef` to it in
  the pack's `routes` (legs of days through road-event regions, a `danger`, any passage `cost`,
  and for a road not everyone may walk, `needs` and a `name` to say it by;
  `systems/travel` finds the quickest open way, validated so every location has a road). Leave
  `lockedReason` set until it is playable; the Travel tab shows it as coming soon, and no road
  passes through it.
  A road may `trail` through bends so it follows the land. The country itself is the pack's
  `atlas` (`content/atlas.ts`: coastlines, the home country, borders, rivers, names, in map
  units; validated on the map), drawn on the Travel tab in the player's `settings.mapStyle`
  (washi chart, lantern night or sumi-e brush: `game/mapStyle.ts`, inks set per style in CSS).
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
  each dodged alone; a Guard or Counter meets only the first). An `area` effect has a `size` (small,
  wide, vast; `rules/verbs/area.ts`): a wide one is hard to slip, beats a plain Guard (only a
  swap or a wall escapes it) and throws the fight apart to mid; a vast one can't be outrun,
  throws it to far and leaves dust that blinds both sides (`plan/blast.ts`). Keep vast rare. The academy's technique sheet
  (`views/techniqueSheet.ts`) reads all of it, so what the player is told is what the fight does.
- **Add a clan, talent or trait:** add it to the pack's `clans` (or the shared `talents`/
  `traits`) with stat bonuses and a `ModifierSpec`. A talent (special note) has a `weight`
  (major, minor or flaw) and, if it contradicts another, a mutual `opposite`. **Add a habit:** a
  `QuirkDef` in `shared/quirks.ts` with the traits it `warms` and `cools` (validated real, never
  both). Clan-only techniques set `clan` on the
  `TechniqueDef` and are listed at the academy; only members see and learn them. Every pack
  needs a `none` clan (validated).
- **Add a person:** add a `PersonDef` to the pack's `people` (appearance via `look()`, whose
  last argument pins the face parts that make them themselves; every part left out is read from
  their id by `faceFromKey`, so nobody shares a face, and facial hair is never handed out; a
  schedule of place ids in the start location, or in their `homeLocationId` if they live elsewhere, a `rank` and `stats` via `statLine()`, and
  optionally an `aptitude` via `talent()`, and an `arsenal`: the techniques and perks they fight
  with in place of the academy kit, each a pack technique with its own source; validated). List
  their whole canon kit: they fight with, and teach, a technique only once their current
  grades carry it (`canPerform`, `game/people/capable.ts`), so a genin grows into theirs. Their best stat must fit their rank (genin E–C,
  chūnin C–B, jōnin B–A, kage A–S, civilians no better than D; validated). Senseis need `role: 'sensei'`, a
  `sensei` profile (style, lesson text) and a `teacher` profile (quirk, steering, `teaches`
  technique ids, price) with its `ways` (how they run a team, `content/senseis.ts`, and their
  story: four personal conversations at stages one to four, validated, the last leaving the
  world mark that opens their arc, tested for every sensei who takes a team); at least two
  specialties must exist among senseis taking a team (validated). A sensei who already leads a
  team of their own sets `offered: false`: never offered, kept by a save that chose them.
  Anyone else who should teach on their own terms gets a `teacher` profile too. A favour price
  needs a conversation reply with that `favour` id (validated).
- **Add a versus-only fighter (a duelist):** a `PersonDef` in the pack's `duelists`
  (`packs/naruto/duelists/`, a file each with their own techniques and gear): shinobi rank, no
  schedule, no teaching, and an `arsenal` (which may name `gearIds` and `tools`, carried into
  every fight). They show in versus by rank and nowhere else; their arsenal sources their
  techniques (validated in `validateDuelists.ts`). Plumbing one in moves them to `people`, where
  their techniques then need a real source.
- **Add a sensei temperament or past:** a `SenseiTemperament` in
  `content/shared/sensei/temperaments.ts` (an existing archetype, traits, a haunt, a full
  voice kit) or a `SenseiPast` in `content/shared/sensei/pasts/` (the temperaments that can carry
  it, at least three; regions some ground of every pack has; a foe and its encounter; four beats;
  the arc's text), using only the slots `{name}`, `{art}`, `{lost}`, `{foe}`, `{keepsake}`,
  `{place}`, `{you}` and `{them}` (validated). Write it gender-neutral: names are drawn. The pool
  grows by itself; `senseiPool.test.ts` checks every new sensei is valid content.
- **Add an enemy:** add an `EnemyDef` (stats, techniques, a `danger` that fits its strength,
  optional `nature`, `traits`, and `healthScale` for a creature bigger or smaller than a person) to the
  pack's `enemies` and use it in a mission's combat stage. A new trait goes in
  `COMBAT_TRAITS`, its rule in `rules/kit.ts` or `rules/conditions.ts`, its counter text in
  `game/scouting.ts`, and every engine must honour it.
- **Add a technique verb:** a technique's `effects` is a list of verbs applied in order
  (`systems/techniques/effects.ts`). A new verb goes in `VERBS` with its scaling profile
  (which user stats drive it, which target stats resist it) in `rules/verbs/profiles.ts`;
  Plan & Watch applies it in `engines/plan/jutsu.ts`. An empower may open a step of a
  **ladder** (`opens`, `systems/techniques/ladders.ts`: the Eight Gates), climbing at most
  `LADDER_REACH` steps past the one open and holding until the body gives out; a technique may
  need a step open (`needsOpen`). Each step's lift, the chakra surge and when a deep step is worth
  opening live in `rules/verbs/ladders.ts`; validation checks every needed step can be climbed to
  by the pack and by each arsenal that holds it. Shelved engines read a technique
  through `primaryEffect`. Verbs that leave something behind (knock, pin, drain, afflict:
  burn, bleed, poison; counter, a readied riposte) keep their rules in
  `rules/verbs/lingering.ts` and their play in `engines/plan/lingering.ts`, which wears them
  down at the end of each exchange.
- **Add a clan compound:** a `compound` place (`clanId`, optional `headId`) in the clan's
  village, listed in that village's `quarter`, an `outsiders` stance on the `ClanDef`, and
  schedules that bring its people home for a slot or two (and out for others, so they can be
  met). Validated in `validateCompounds.ts`.
- **Add a companion kind:** a `CompanionKindDef` in the pack's `companions.ts` (temperament, a
  grown `body` (adult strength, speed, stamina and perception, and `maturesInDays`; the body
  decides those stats, never `statBonuses`), skills that start no better than a fresh genin's
  best, `healthScale`, traits, a talent shape with
  0 for arts it never learns, names, and a `stray` haunt for kinds found on the streets, at
  places of the start village, or a `wild` haunt by biome for wild kinds; shared wild kinds live
  in `shared/wildKinds.ts`; `techniques` it opens by bond stage, `handler` ones taught at a
  clinic whose `handling.teaches` lists them, and the job `roles` it takes); give a clan one with
  `ClanDef.companion`, breed a bred kind at a vet (`pups`) or hand one over from a job
  (`reward.companionKindId`). Validated in `validateCompanions.ts`; a clinic's `handling`
  (quality, price, the bond stage with the vet) and handling lore (`companionLore`, sold through
  a gear place's `loreIds`) in `validateCompanionArts.ts`.
- **Give a foe a companion:** add the companion as its own `EnemyDef` (stats, a `danger` no
  worse than its master's, its traits and `healthScale`) and list it in the master's `retinue`
  with a `tell` (`open` at heel, `kept` out of sight, `hidden` inside the body). Validation
  checks the link; the fight, scouting and the notice pick it up.
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
  lesson, `game/permits.ts`; B is the restricted stacks, chūnin only; A is the sealed archive,
  jōnin only), a teacher's `teaches` (clan techniques only from clan members), or a mission's
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
  job lives once in `systems/missions/encounterPay.ts`. Give a fight stage a `ground` when it isn't open
  ground (forest, town, room, lake). Keep a plain `combat` stage only where a
  straight fight is the point (a duel, a surprise attack). On team jobs a check falls to the best
  teammate for it (`bestHandFor`, `game/missionRoles.ts`).
- **Add a school technique:** a fighting style (Lantern Wind, River Draw…) is techniques with
  the same `school`, taught by that school's teachers (`teaches`), never shelved. Standard
  techniques (no `school`, no `clan`) go on the academy rack (E–D) and the library (C open
  shelves, B restricted, A sealed), so every art has plain moves at every grade before any style.
- **Add a combination technique:** two `TechniqueDef`s whose `combo.partnerTechniqueId` name
  each other (validated); offer them at the academy. A teammate knows the half in their
  specialty, and a half plays only beside someone on your side who knows the other.
- **Add gear:** add a `GearDef` (`kind` weapon/armour/focus with its shape, level or boosts,
  `rank`, cost) to the pack's `gear` and list it at a `gear` place (a smith, an outfitter);
  `unique` pieces are never listed. **Add an ingredient or recipe:** ingredients go in
  `shared/kitchen.ts` (sold at a market stall's `ingredientIds`) or `shared/wilds.ts` (found
  in a `wilds` place's `finds` or a fishing spot's `catches`; a fish needs a `length` and, unless
  only its own dishes take it, a `family`); recipes go in
  `shared/recipes.ts` (or a pack's own list) with a `rank`, one role (don't make a bigger copy
  of another dish's buff) and a way to learn it: a cookbook (`CookbookDef`, sold at a stall's
  `cookbookIds`), a person's `recipes`, or a job's `reward.recipeId` (validated). **Add a meal
  effect:** a field on `ModifierSpec` combined in `combine`, worded in `describeSpec`, read at
  one hook in `game/`.
- **Add a home or a piece of furniture:** a `HomeDef` in the pack's `homes.ts` (rent and/or
  price, `needs`, spots, rooms; a yard needs `yardTrainingIds`, a garden `beds`; `lockedReason`
  until it is playable) listed at a `lettings` place's `homeIds`; a `FurnishingDef` in
  `shared/furnishings.ts` with one `effect` (a new kind is a case in `comforts`), listed at a
  lettings place's `furnishingIds` unless it has no `cost` (a gift). Validated in
  `validateHomes.ts`.
- **Add to the field book:** a fish on a fishing spot needs a `length` (validated); a wild find,
  a recipe or a night sight needs nothing more: its slot appears with a hint read from where it
  is. A page's reward is in `shared/fieldBook.ts` (a furnishing with no cost, and a keepsake);
  a new page is a `FIELD_BOOK_PAGES` id with a case in `pageCount`, its entries and its seal.
- **Add a bar or hot water:** a `tavern` place (`keeper`, `foodIds`, `roundCost`, `cupCost`,
  evening/night `hours`, optional `pastimes` with unique ids) or an `onsen` place (`keeper`,
  `waters` spring or bathhouse, `soakCost`, `hours` without night), validated in
  `validateLeisure.ts`. Put people in it through their schedules; a town with no residents
  needs one (a `homeLocationId` regular) or the room stays empty. Not every town gets one:
  see `docs/design/village-places-plan.md` for which fit where.
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
- **Add something to the end-of-day sheet:** a change the dawn snapshot can see goes in
  `DayStart`/`DayEnd` (`game/daybook/state.ts`, with a save migration) and its row in
  `views/dayEndRows.ts`; a reason to come back tomorrow is a hook in `views/dayHooks.ts`, read
  from the rule that makes it true.
- **Add a sound or a music mood:** add the id to `SOUNDS` or `MUSIC_MOODS` (`game/sound/`), have
  the game pick it, and give it a recipe in `ui/audio/effects.ts` or a loop in `loops.ts` (both
  `Record`s keyed by id, so a missing one is a type error). Keep effects short and in the music's
  keys; check levels stay under the limiter.
- **Add a backdrop or icon:** add the id to `BackdropId`/`IconId` in `content/art.ts` and the
  drawing to `ui/art/` (a `Record` keyed by id, so a missing drawing is a type error). A
  backdrop is a scene in `ui/art/scenery/` (400×240, bottom-anchored), built from the kit there
  (ridges, lanterns, townhouses, pines) and painted with the `bd-*` classes, whose inks
  `tokens.css` sets per time slot; glows are gradients, never blur filters. An icon
  (`ui/art/icons/`) is two-tone: its outline is `currentColor`, so it takes the ink of where it
  sits, over fills from the icon palette; discipline signs fill with a tint of that ink. A
  portrait (`ui/art/portrait/`) is put together from an appearance's `FaceParts` (shape, figure,
  eyes, brows, nose, ears, expression, age, facial hair, a mark): a new part is a union member in
  `systems/profile/face.ts` and a drawing in the matching `Record`.
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
