# The end of the day

The first of the "come back tomorrow" hooks. Mockups: `day-end-mockups/approved.png` (the
design as approved: a strip of sky, the ledger on paper, the day ahead as ema on a cord).

## When it shows

A day ends whenever time passes into the next morning, by a bed or not. `dispatch` notes it
(`game/daybook/record.ts`) after every action:

| How the day ended              | What you see                                                                                                            |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| In bed (`sleep`, `takeRoom`)   | The sheet under the moon: "Spring 9 draws to a close", **Sleep**.                                                       |
| Pushed through the night       | The sheet at dawn: "Spring 9 ran on into Spring 10", a **No sleep** hurt, the day ahead called **Today**, **Carry on**. |
| Several days at once (laid up) | One sheet for all of them.                                                                                              |
| On a job, a journey or an exam | Nothing: the debrief and the trip home tell those days. The record starts again from there.                             |
| Setting: brief                 | No sheet; a slip above the village next morning.                                                                        |
| Setting: off                   | Nothing.                                                                                                                |

The sheet waits for scenes and report cards (it comes after a debrief), and one tap puts it
away (`dismissDay`).

## What it shows

The record is a snapshot taken at dawn (`openDay`) compared at the next one (`closeDay`), so no
action has to remember to log anything. Sections appear only when something happened in them,
always in this order, each with its own look:

- **Moments** (an ink seal and a line): a technique learned, a grade reached, a promotion, a
  job done.
- **Hurt** (red ink): a new injury and when it mends, hunger that now costs you, no sleep.
- **What grew** (the grade and a bar towards the next, today's share lit): words for how close
  you are, never decimals.
- **People** (a face, the bond, and what getting closer opens next, from `bondPath`): only bonds
  that moved; a new stage is stamped, and your sensei's regard says if it rose or fell.
- **Found** (tiles): gathered, caught, bought or given; something new to you is outlined.
- **Purse** (ledger lines): read from the day's record by its ryo chips, added up by what it was
  for, with "Other" for anything unaccounted, and what's left.
- **Tomorrow** (ema, the first lit): always there, up to three, most pressing first
  (`views/dayHooks.ts`): wounds, the exam, your sensei's meeting or team day, a festival, new
  work and rumoured jobs, rent.
