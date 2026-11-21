# Objectives choosing moves

Step 5 of the objective-driven combat AI (`docs/design/combat-ai-plan.md` Parts 6, 7 and 10). Until
now the objective a fighter held only weighed how the planner scored outcomes, and only four of the
eight did anything; the moves tried came from the kit by worth and from today's hand-written rules,
whose move was the one to beat. Now an objective **proposes** the moves a fighter holding it means
to try (`engines/plan/mind/planner/proposals.ts`): they are scored beside the planner's other
candidates, and the first that can be played is the move to beat, after a held plan's next step.

Objectives are taken on one at a time, each measured before the next. One not yet taken on proposes
nothing, and its fighter keeps today's rules.

## How each is measured

The whole bench cast at chūnin, every ordered pair, two seeds, with **only the foes thinking** (the
player plays its default plan): 924 fights, run with and without the new proposals on the same
seeds. Foes thinking is what the game plays; letting only one side change shows what the change is
worth to it. One standard error of the overall rate is about 1.6 points, of a single kit's about 7.

Run locally (`VITE_BENCH_THINKING=true`), never in the pipeline.

## Recover

Proposes Gather, or a step out of reach first with a foe up close (gathering leaves you open).

| Foe             | Wins, before | Wins, with recover |
| --------------- | ------------ | ------------------ |
| **All**         | **54.3%**    | **55.4%**          |
| illusionist     | 69%          | 79%                |
| sensor          | 55%          | 67%                |
| medic           | 69%          | 71%                |
| assassin        | 43%          | 45%                |
| foresight       | 55%          | 57%                |
| trapper         | 26%          | 24%                |
| mimic           | 57%          | 55%                |
| every other kit | unchanged    | unchanged          |

What it says:

- The casters who run dry gain most, as the shadow experiment found
  (`prototypes/objectives/RESULTS.md`: a dry caster who gathers wins about six points more).
- Most kits never hold recover in a fight this short, so nothing changes for them.
- The small drops (trapper, mimic) are well inside one standard error of a single kit.

Kept. Today's resting rule (`plan/resting.ts`) stays for fighters who don't think (the test
runner's); a thinking fighter no longer defers to it.

## Survive: tried, not kept

Proposed every way of playing for time (a hold on the killer, Evade, a step back, Brace), with
today's survival judgement (`plan/survival.ts`) first as the move to beat.

| Fights                                                 | n   | Foe wins, before | Foe wins, with survive |
| ------------------------------------------------------ | --- | ---------------- | ---------------------- |
| the whole cast                                         | 924 | 55.4%            | 55.0%                  |
| every foe against the two killers (gates and assassin) | 336 | 58.0%            | 55.4%                  |

Neither is outside the noise (about ±3.8 points on the second), but both lean the wrong way. The
extra ways let the planner trade today's judgement for an alternative its two-exchange look
prefers, and the trade is no better: what a Brace or a step back buys against a killer shows only
once the gate burns out, past the horizon. Survive stays on today's rule until the planner can see
that far (a terminal estimate of the race, Part 13's open item), or until opponent prediction
(Part 5) lets it value getting clear.

## Still to take on

Find, set up with finish, escalate; then control distance and wear down. Survive waits on a longer
look.
