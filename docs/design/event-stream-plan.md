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

## Done (the structural fix, as built)

The fight is told as an ordered list of `CombatEvent`s (`systems/combat/storyContract.ts`), and
`CombatView.story` replaces the log of lines.

- **Events.** `told` (a line: its words, whose turn it was, whom it names, where the fight stood,
  how big the turn was, the voices its words came from, its chips, the defences that reacted with
  whose they were and whose attack they met, why it went as it did with whom it is about and what
  kind of thing it is, off plan, divider, opens a round, a read), `stand` (where someone stands as a
  stretch opens), `join`, `health` (to what, why, by whom), `pools`, `status`, `fall` and `leave`.
  `foldStory`/`foldEvent` (`storyFold.ts`) fold them; the switch is exhaustive, so a new kind is a
  compile error until the fold decides.
- **Writers.** `say` (`plan/toldPools.ts`) is the one writer of the story: what moved since the
  last line (health, pools, who came or went) is recorded before the line, and the line is read
  into its `told` event. `setHealth` (`plan/health.ts`) is the one writer of health and records
  the change with its cause and whose it was where it is made; `wound` applies every side effect of
  a hit through it. Tools (`rules/items.ts` `itemEffect` now says the health it would move), blood
  prices, empower tolls, raises, put-downs, heals and second winds all go through it. `patch` can't
  set health, and lint keeps health out of the engine's object literals elsewhere.
- **Staging** sets a turn's lines as its maker's, the distance and force on them, and the
  statuses it changed beside its last line. Each exchange opens with a full standing (`stand` for
  everyone, then its divider); as it ends and as an act hands back, `plan/storyLevel.ts` says
  whatever the story hasn't yet (breath back, a daze worn off, a summons gone), so folding the story
  gives exactly the fight.
- **Readers** read fields, never words: `fightReplay` is a fold (one beat per told line),
  `combatLog` renders told lines, `roundWhy`/`roundAdvice`/`noticed` read the last round's events
  (`views/roundEvents.ts`: its lines, every health lost and by whom, where everyone stood as it
  opened), the fight record keeps every event, sounds read the beat's force, and the summary and
  word memory (`plan/fresh.ts`) read told events' text, voices and names. The markers survive only
  inside the narration module (`rules/narration.ts`, `causes.ts`), as how a line carries its facts
  from the helper that writes them to `say`; a lint rule keeps `⟦` out of every other file and
  `toldFrom` out of every file but the writer's.
- **Causes** carry their subject and kind (`CAUSE_KIND`): a teleport, seals coming apart and a
  leap followed are no longer counted as slipped attacks or the follower's failed step. A slip's
  cause is read from the avoid roll's own parts (`plan/causes.ts`): each is taken away in turn and
  the one whose loss drops the odds most decided it (luck when none moves them by a tenth).
- **Saves.** A fight saved mid-way with a `log` of lines is read into events as it loads
  (`plan/legacyStory.ts`, `rules/narrationLegacy.ts`); the shelved engines tell in lines and read
  them the same way in their views. The finished fight kept for the watch screen
  (`combatFinale`) holds events: save version 75 reads an older one's lines into them.
- **Invariant.** After every act the benches already play (`src/test/bench/runner.ts`,
  `content.ts`, `bestiaryFights.ts`, the told bench), `storyCheck.ts` folds the story and checks it
  against the engine (health, pools, statuses, who is on the field) and that within each exchange
  no health moves after its last line. It found shadow clones made after one had left reusing a
  standing clone's id (`plan/shadows.ts` now numbers past the highest).
