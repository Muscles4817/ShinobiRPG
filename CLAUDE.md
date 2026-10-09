# CLAUDE.md

Guidance for anyone (human or AI) changing this codebase. Read it before writing code.
Rules marked **(enforced)** fail CI if broken; the rest are enforced in review.

## What this is

**Shinobi RPG** — a text-based shinobi life-sim RPG, built as an offline-first PWA so it can be
played on a phone while travelling. Original setting: Tōrōgakure, the Village Hidden Among
Lanterns. Stack: TypeScript (strict), React, Vite, vite-plugin-pwa, Vitest.

Roadmap (milestones): **1. vertical slice** (done) → 2. people & relationships → 3. progression
(ranks, elements, spirits) → 4. world & travel → 5. branching paths (rogue / Kage) → 6. depth.

## Commands

```bash
npm run dev            # local dev server
npm run check          # EVERYTHING CI runs: typecheck, lint, format, arch, test, build
npm test               # unit + integration + UI smoke tests
npm run arch           # module-boundary check (dependency-cruiser)
npm run format         # auto-format with Prettier
```

Run `npm run check` before every commit. Nothing merges unless it is green.

## Architecture

```
src/
  core/       Game-agnostic utilities: seeded Rng, Result, math. Knows nothing about the game.
  systems/    Self-contained domain modules. Pure functions over their own slice of state.
    time/  stats/  vitals/  wallet/  techniques/  missions/  combat/  standing/  journal/
  content/    Static game data (techniques, missions, enemies, food…) + integrity validation.
  game/       Composition layer: GameState, player actions, mission flow, save/load, view models.
  platform/   Browser adapters (localStorage save store).
  ui/         React components. Renders view models, dispatches GameActions.
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
   an opaque `CombatState`. Only the engine looks inside its own state.
6. **The UI renders view models** (`src/game/views/`), not raw state. Activity lists are
   `ActionOption`s that already carry the `GameAction` to dispatch and the blocker reason.
7. **Content is data, validated by tests.** Unique ids, resolvable references and sane numbers
   are checked in `content.test.ts`, so a typo fails CI rather than crashing on a phone.

### Recipes

- **Swap/rewrite the combat engine:** implement `CombatEngine` in
  `systems/combat/engines/<name>/`, export its factory from `systems/combat/index.ts`, and use
  it in `createDefaultContext`. No other code changes. If you change the engine id, old
  mid-fight saves need a migration (or to resolve the fight on load).
- **Add a player action:** add a variant to `GameAction` (`game/actions/types.ts`), write a
  handler (`check` + `perform`), register it in `game/actions/registry.ts` (the compiler
  insists), expose it through a view model, add tests.
- **Add a system:** create `systems/<name>/` with `<name>.ts`, `index.ts` (public API) and
  `<name>.test.ts`. Add its slice to `GameState` + `createNewGame` + a save migration.
- **Add content:** add entries to the relevant `content/*.ts` array. Run `npm test` —
  validation will catch broken references.
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

### Formatting & hygiene

- Prettier decides formatting **(enforced)**. ESLint must pass with zero warnings **(enforced)**.
- No dead code, commented-out code, or orphan files **(enforced for orphans)**.
- Keep dependencies few. Justify any new runtime dependency.

## Definition of done

1. `npm run check` is green.
2. New behaviour has tests; boundaries respected without lint/arch exceptions.
3. Save compatibility preserved (migration + test if the shape changed).
4. Works at phone width (≈390px) and offline.
