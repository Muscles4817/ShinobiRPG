# What the world does to you: one sequencer for happenings

Why a rival challenged you from another town, and what it has in common with the fight screen
moving bars before the story told the hits (`event-stream-plan.md`). Written 21 November after the
owner asked for the cause one layer above both bugs.

## Two kinds of change, one of them designed

Everything that changes the game is one of two things.

1. **What you do.** A player verb. It has a contract: a `GameAction`, a handler with `check` (why
   not, pure) and `perform`, `blockerFor` for the UI, one registry the compiler checks. When a verb
   is wrong, it is wrong in one place.
2. **What the world does to you.** Your rival challenges you; a friend brings a gift; the village
   promotes you; your sensei notes a missed meeting; a page of the field book pays out; a day ends.
   Nothing declares these. Each one was added where it was convenient: as an observer chained in
   `dispatch`, inside `spendTime`, or inside another verb's `perform`. Each one decides for itself
   when it runs, whether it may, and how it is told.

The fight had the same problem in a different place. Fighters' health was changed in many
functions, and the story was written separately and stitched back together afterwards, so the
screen could show a change before the line that caused it. The fix (#343) made one writer,
`say()`, stamp each line with the changes it caused, in the order they happened. The world has no
`say()` yet.

## The shape of the gap

Every happening has to answer five questions. Today, each answers them in its own way, or not at
all.

| Question                                              | What a verb has                 | What a happening has today                                                                                                                                                                                           |
| ----------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **When** does it run?                                 | When the player picks it        | Three triggers in three styles: after any action (`note*` in `dispatch`), when time passes (`spendTime`), inside another verb (`afterLessonRecommendation`, `afterFieldWork`, `chooseRival`)                         |
| **Whether**: who must be where?                       | `check`, tested by every caller | Written by hand, or missing. The rival only checked "no job or exam" until this week. Gifts and the jōnin nomination checked nothing. Seven sites tested "home" against `startLocationId` instead of `atHomeVillage` |
| **What instead** if it can't happen now?              | Disabled, with a reason         | Undecided. A rival challenge made anyway, a promotion scene opened abroad, a gift "turning up" in another town                                                                                                       |
| **In what order** relative to others?                 | One at a time                   | The nesting order of calls in `dispatch` (`noteHomeGifts(noteRival(notePromotions(noteGradeUps(…))))`). It matters, and nothing says so                                                                              |
| **How is a day caught up** when several pass at once? | n/a                             | Three ways: `eachDay` loops (hives, dust, hunt), a "last done" day kept on the slice (mentor, peers, board), and a before/after diff that runs once however many days passed (rival, daybook)                        |

A second hole lets the "whether" be skipped even where it exists: a verb may call another verb's
`perform` directly. `acceptChallenge` and `challengeRival` ran `spar.perform`, so `spar.check`'s
"is your partner around?" never ran for the rival. Nothing stops this from happening again.

## What happened, by symptom

- **Missing "who must be here"**: the rival's challenges and needling (fixed), a friend's gift
  (fixed: left at the door), the village's promotions (fixed: a day at home, or collected at the
  hall).
- **Two definitions of one fact**: "am I home" (`atHomeVillage` against `startLocationId`), fixed by
  using one. "Is this person around" exists three times: `whereNow`, `inTownWith` and the guest-room
  rule.
- **A check skipped by calling `perform` directly**: rival contests (fixed by repeating the check,
  which is a patch, not a structure).
- **Order by nesting**: no bug seen yet, but nothing would show one.
- **Catch-up by diff**: the rival's day turn runs once for any number of days. A job that spans
  days skips it, which happens to be right. A future happening written the same way may not be.

## The structure

One list of happenings, run by one sequencer in `dispatch`, as the handler registry is for verbs:

```ts
interface Happening {
  readonly id: string;
  /** One vocabulary of triggers. */
  readonly on: 'action' | 'dayEnded' | 'arrived';
  /** Who must be where: typed, so a test can check them. */
  readonly needs: readonly Need[]; // 'free' | 'atHome' | { with: (s) => personId } | { at: PlaceKind }
  /** When the needs aren't met: pass over it, hold it until they are, or let it lapse. */
  readonly otherwise: 'skip' | 'hold' | 'lapse';
  readonly run: (state: GameState, ctx: GameContext) => GameState;
}

export const HAPPENINGS: readonly Happening[] = [/* in order: the array is the order */];
```

- **When**: `dayEnded` happenings run once for each day that ended, by the one catch-up loop, so a
  three-day journey settles three days in order. The per-slice "last done" markers stay as guards.
- **Whether**: the sequencer tests `needs` before `run`, from one set of predicates (`atHomeVillage`,
  `inTownWith`, `busyReason`). A happening can't forget them, because they are fields, not code.
- **What instead**: `hold` keeps a happening waiting on the slice that owns it (as
  `exams.promotionDay` and `housing.doorstep` now do) and runs it when its needs are met.
- **Order**: the array. A test lists it, so a reorder shows in review.
- **Verbs calling verbs**: they go through `perform`'s own `check` (a `performChecked` helper), and a
  lint rule (`no-restricted-syntax`) forbids `.perform(` inside `game/actions/`.

### Invariants, tested

- **Nothing reaches you where you aren't.** A property test puts the player in every other town, on
  a job, on a journey and in an exam for sixty days, and asserts that no happening with `atHome` or
  `with` needs ran (journal entries carry the happening's id).
- **A day is a day.** Ending three days one at a time and ending them in one stretch give the same
  state.
- **Order is declared.** A snapshot test of `HAPPENINGS.map((h) => h.id)`.

## Size

Moving the twelve `note*` observers and the day work in `spendTime` onto the list: about 600 to 900
lines, mostly moved rather than new. Behaviour shouldn't change, except where the property test
finds another happening that reaches you where you aren't. No save change: holds live on the
slices that own them.
