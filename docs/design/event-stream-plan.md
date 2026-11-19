# The fight as an ordered event stream

Why the fight screen's bars and story drifted apart, and the structural fix. Investigated 19
November after the owner saw Itachi start a bout below full health, shadow clones missing from the
stage, "?" boxes in the acting order, and bars moving ahead of or behind the story.

## How the watch screen worked

The engine plays a whole exchange or round at once and the view exposes only the end state
(`plan/engine.ts`, `view.combatants = plan.fighters`). `game/views/fightReplay.ts` then rebuilds a
timeline from three sources with no shared order:

1. **Health walked backwards** from the end state, undoing each line's harm and heal chips and
   guessing whose they were from the names in the line. Any change without a chip (a health cost,
   a clone set to nothing, a raise) is invisible to it.
2. **Pool snapshots** carried on exchange dividers and on the last line of each turn only
   (`plan/staging.ts`).
3. **Who is on the stage** from the end-of-round roster (`WatchScreen.tsx`), so a clone made and
   popped within the stretch never appears.

Phases that run after the turns (empowers, clones, summons, shadows, veils, holds, lingering harm,
raises, recovery, dazes wearing off) stamp nothing. And the log was trimmed to `LOG_LIMIT` after
every exchange, so a stretch watched to its end could start partway through, its first bars
already carrying hits it never told.

## Fixed first (the quick fixes)

- The log is trimmed only as an act begins (`plan/cast.ts`, `trimmedLog`), never inside a stretch.
- The engine keeps a **cast** of everyone who has stood on the field (`CombatView.cast`), so the
  acting order names and sides a clone that has since popped.

## The structural fix

The engine emits an **ordered event list** per exchange: lines, and the changes between them
(`join`, `health`, `pool`, `status`, `fall`, `leave`), each recorded where the value is set (the
few functions that change fighters) so their order is the order things happened. Within an action
the order is fixed: what they do is told, its cost is paid, the outcome is told with its effects,
anyone who falls is marked, and bodies leave at the exchange's end. Each stretch starts with a full
snapshot of the cast.

`fightReplay` becomes a fold of the events: the walking back, the guessing of owners, `present`,
`before` and the switch to the end state on the last beat all go. The stage and the acting order
read the folded cast. An invariant test asserts that folding each stretch's events gives exactly
the engine's end state, for every fight the benches play.

Size: roughly 1,000 to 1,500 lines plus tests; a save mid-fight in the old shape falls back to the
current replay.
