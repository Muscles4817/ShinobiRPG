# CLAUDE.md

Guidance for anyone (human or AI) changing this codebase. Read it before writing code.
Rules marked **(enforced)** fail CI if broken; the rest are enforced in review.

## What this is

**Shinobi RPG** — a text-based shinobi life-sim RPG, built as an offline-first PWA so it can be
played on a phone while travelling. Original setting: Tōrōgakure, the Village Hidden Among
Lanterns. Stack: TypeScript (strict), React, Vite, vite-plugin-pwa, Vitest.

Roadmap (milestones): **1. vertical slice** (done) → **2. people & relationships** (done) → 3. progression (ranks, elements, spirits) → 4. world & travel → 5. branching paths (rogue / Kage)
→ 6. depth. Before 3, combat is being playtested in several styles (see decision 16).

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
    modifiers/ profile/ bonds/ inventory/
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
   `allies` (teammates on team missions) who act on their own; a fight's purpose (mission,
   spar) is game state (`people.sparringWith`), never the engine's concern. The player's
   choice is a `CombatChoice` (option id + optional target); the view may add `range`,
   `prompt`, `meters` and per-combatant `intent`, and options say their `kind` so one fight
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
11. **Identity is modifiers.** Clan, talent, traits, academy grades and chakra nature each
    declare a `ModifierSpec`; `characterModifiers` (`game/profile.ts`) multiplies them into one
    `Modifiers` value that training growth, study speed and hunger read. A new kind of identity
    (bloodline stage, gear, a sensei's teaching) is another spec, not new branches in actions.
    Option cards show `describeSpec` output, so what the player is told is what the code does.
12. **Character creation is the opening scene.** The academy break-in collects a
    `CreationDraft`; `draftProblems` validates it and `createNewGame` builds the first state.
    The break-in roll is seeded, so the scene and the game agree on the outcome.
13. **People are data, wherever they come from.** Authored people (`PersonDef`) live in the
    pack; generated genin are built from the pack's name pools by `game/people/generator.ts`
    and stored in `GameState.people.generated` in the same shape, so every view and action
    treats them alike (look people up with `findPerson`, never `content.people` alone).
    Schedules place people at places in the start location by time slot. Bonds (points,
    stages, tone reactions) are the `bonds` system; who reacts how comes from trait tastes.
14. **Scenes are derived from state.** `activeScene` decides what takes over the screen
    (fight › mission › conversation › team assignment). Anything that must happen before
    normal play (like team assignment) is a scene plus a `busyReason`, not UI-only logic.
15. **Companions grow with you, not on their own.** Teammates and sparring partners have no
    stored stats; `companionStats` derives them from their specialty and your record, so a
    teammate is always a fair match. Your sensei teaches weekly (`lesson`) and hands over
    their `teaches` techniques once your bond is high enough.
16. **Fight styles are engines, chosen per save.** `GameContext.engines` lists every engine
    (Classic, Plan & Watch, Deck, Mind Game); `settings.combatStyle` picks the one that starts
    new fights and `engineFor` routes to it. A fight in progress always continues in the engine
    whose id is in its `CombatState`. What the player sets up in a style (Plan & Watch cards) comes
    back as an opaque `CombatOutcome.plan`, is kept in `settings.combatPlans` by engine id, and is
    handed to that engine's next fight as `CombatSetup.plan` (`startFight`); the engine validates it. The newer engines share `systems/combat/rules/` (range
    bands and reach, the elemental cycle, damage and resist formulas, the common `Body`), so
    styles differ in decisions, not maths. Bloodlines reach combat as perks (`insight`).
17. **The jobs board rotates.** Most jobs are postings that stay up a few days; `standing`
    jobs (patrols) are always there, once a day; jobs above your record are never shown, not
    even sealed. Postings come from `hashUnit(seed, day, id)` (`game/board.ts`), so the board
    is reproducible and catches up lazily without consuming the game's Rng. Tests that take a
    specific job use `postEverything` (the default `newGame` fixture does).
18. **Gear counts in fights; meals count for a day.** Equipped gear (`inventory` system,
    `game/gear.ts`) adds its `statBonuses` to the stats a fight sees (`combatStats`), never
    to trained stats, so it works the same in every fight style. A home-cooked recipe sets
    `character.meal`; its `buff` is another `ModifierSpec` in `characterModifiers` and
    `spendTime` clears it when the day ends.
19. **Village life is derived from the calendar.** `game/village.ts` decides what is open
    (`hours` on places and stalls; closed ones say when they open), today's festival (cheaper
    market, warmer talks), the gossip (`rumoursToday`: a job's rumour goes round the day
    before `newPostingsTomorrow` posts it) and tonight's sight, which only an awakened
    bloodline can follow. Like the board it hashes the seed and day, never the Rng; only
    `village.lastSightDay` is stored. Festivals can bring their own `stalls`, which
    `stallsHere` sets up in the market on the day. Dinner invites (`hostDinner`) cook a
    recipe for two in the evening; they count as the day's time with that person and are worth
    more for their `favouriteRecipeId`.

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
  in the fight-style picker automatically. No other code changes. Removing an engine or
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
- **Add a location:** add a `LocationDef` with a backdrop and places. Leave `travel.lockedReason`
  set until it is playable; the Travel tab shows it as coming soon.
- **Add a place kind:** add a variant to `PlaceDef`, its references to `validateWorld`, a view
  model in `game/views/`, a page in `ui/screens/places/` and a case in `PlacePage` (the
  compiler lists every switch you missed).
- **Add a clan, talent or trait:** add it to the pack's `clans` (or the shared `talents`/
  `traits`) with stat bonuses and a `ModifierSpec`. Clan-only techniques set `clan` on the
  `TechniqueDef` and are listed at the academy; only members see and learn them. Every pack
  needs a `none` clan (validated).
- **Add a person:** add a `PersonDef` to the pack's `people` (appearance via `look()`, a
  schedule of place ids in the start location). Senseis need `role: 'sensei'` and a
  `sensei` profile (style, lesson text, `teaches` technique ids); at least two specialties
  must exist for the team choice (validated).
- **Add a mission:** add a `MissionDef` and list it at a mission hall. It is posted from time
  to time once the player's record reaches `minMissionsCompleted`; set `standing: true` for
  jobs that are always available (every pack needs one a fresh genin can take — validated).
- **Add a team mission:** set `withTeam: true` on a `MissionDef`; teammates join every
  fight as allies and each gains bond on success. Offer it at a mission hall as usual.
- **Add gear:** add a `GearDef` (slot, cost, `statBonuses`) to the pack's `gear` and list it at
  a `gear` place (a smith, an outfitter). **Add an ingredient or recipe:** add it to
  `shared/kitchen.ts` (or a pack's own list); ingredients must be sold at a market stall's
  `ingredientIds`, and recipes may only use known ingredients (validated).
- **Add village life:** rumours (`missionId` for a job hint, `personId` for gossip), night
  sights (with a small stat `reward`) and festivals (season, day, `marketPrices`,
  `bondBonus`, optional `stalls` of festival-only food) go in the pack's `village`. Give a
  person a `favouriteRecipeId` to make dinner with them special. Give shops and stalls `hours` if they close.
  Validation checks references, real dates and that nothing is never open.
- **Add a conversation:** add a `ConversationDef` (generic, or with `personId`) with a
  `minStage` and choices that each carry a `Tone`. Traits' `likes`/`dislikes` decide how a
  tone lands, so new tones need tastes on the traits that care.
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
