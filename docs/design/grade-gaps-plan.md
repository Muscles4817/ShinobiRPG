# Grade gaps, speed and pace: notes for later

Status: **direction agreed in conversation, to review before work.** Nothing here is built.
Related: the defence question in `docs/design/clones-and-element-variants-plan.md`.

## The model we want

- **The body is not the rank.** Genin graduate as grown adults (18). Speed is mostly born: someone
  fast at 18 is fast, someone slow never becomes fast. Strength can be built a long way, and bulk
  past the frame costs speed. Stamina can be trained hard, with diminishing returns, and not
  everyone is built for it.
- **Below S, a faster fighter has an edge, never a blitz.** As with elite fighters in real life:
  the slowest of them can still stand and trade with the fastest; they are just always at a
  disadvantage.
- **S is the jump: beyond human.** S speed blitzes C and below, B fights for its life to keep up,
  A is clearly slower but stays in the mix. S spans a wide range (40 to 60), and climbing within
  it keeps mattering. Reaching S should feel huge.
- **Stamina is the pursuer's weapon.** An S-stamina fighter can keep pressing in taijutsu and win
  by the other tiring first. The answer is creativity: a quick counter and out, a substitution
  and hiding, a trap. (Direction for substitutions: later, a swap leaves the foe not knowing where
  you went.)

## What the game does today

The game already follows the body model in its stats:

- Body stats are read against real athletes, not rank (`stats/tiers.ts`, `GRADE_WORDS.body`):
  E ordinary, D athletic, C fine athlete, B national class, A world class, S beyond human. Only
  skills (the arts, chakra control) read by rank.
- Speed is `born` (`stats/limits.ts`): about one grade left in it after graduation; strength and
  stamina a couple. Strength over the build's `comfortStrength` lowers the speed limit.
- Grades: E 0–7, D 8–12, C 13–19, B 20–27, A 28–39, S 40–60 (`STAT_TIERS`).

**But the combat maths doesn't match it.** Every contest is a ratio, `gapRatio` in
`rules/damage.ts`: `(a + 1) / (b + 1)`, clamped to 4. It drives damage (raised to `GAP_EXPONENT`
1.8), slipping (`rules/avoidance.ts`, a logistic on the log of the ratio), reads, conditions
taking hold, and **pace** (`rules/pace.ts`): a body's attack starts to outpace a defender at
`OUTPACE_FROM` 1.5× their avoid rating (speed 0.7, perception 0.3) and can't be slipped at all
from `OUTPACE_FULL` 2×; only a swap escapes.

Worked by hand (every stat mid-grade, so approximate):

| Attacker vs defender | Ratio | Damage each way | Pace                           |
| -------------------- | ----- | --------------- | ------------------------------ |
| A (34) vs B (24)     | 1.4   | ×1.8 / ×0.55    | none                           |
| S (45) vs A (34)     | 1.3   | ×1.6 / ×0.6     | none                           |
| S (45) vs B (24)     | 1.8   | ×3 / ×0.33      | about a third of slipping left |
| S (45) vs C (16)     | 2.7   | ×6 / ×0.17      | none left                      |
| D (10) vs E (5)      | 1.8   | ×3 / ×0.33      | about a third of slipping left |

The S rows are close to the model. The last row is the problem: because raw values are small at
the bottom, **ordinary against athletic is as brutal as S against B**, for speed and for every
other contest. A grade means more at the bottom of the scale than at the top, which nobody chose
(the `gapRatio` comment says a ratio of 2 is "about two grades"; true mid-scale only).

Also worth checking: a jōnin purely defending (Dodge ready and Evade) against a good jōnin slips
about 38% of blows against about 57% between equals, taking hits about 1.8× as hard. That is a
few exchanges, which may already be close to the "defending is easier" intuition.

## Proposed changes (to review ?)

1. **Outpacing only from S.** Pace needs the attacker's speed to be beyond human (S) and far
   above the defender's avoid rating. Below S it never applies. Within S, a high S may outpace a
   low S or a top A.
2. **Below S, speed is a steady edge.** A modest lean on slipping and being slipped, plus things
   that are not dodge odds: who acts first in an exchange, who controls distance (stepping in,
   getting away), and what a chase costs each side in breath.
3. **A grade means the same everywhere.** Count gaps in grades (or soften the ratio at low
   values, e.g. a larger `RATING_OFFSET`), so ordinary against athletic is a modest gap in
   damage and slipping too, the same as B against A.
4. **Damage may stay steep; survival is about defence.** A stronger fighter should hit much
   harder. The intuition that defending is easier than attacking belongs to slipping and
   committed defence (a gentler avoid curve, a stronger Evade), with breath, not the grade gap,
   as what ends turtling.
5. **Stamina decides chases.** Make sure the breath pool (`rules/breath.ts`) delivers the
   pursuer who outlasts you, and that swaps and traps are the way out.

## Measure first

Widen the defence bench (`src/test/bench/defenceBench.test.ts`): pure defence against one and two
grades up, **at genin, chūnin, jōnin and S levels**, and a speed-only gap (same skills, one body
a grade faster) at each level. Record exchanges survived, slip rates and breath spent. Expect
today's genin rows to be the worst; after the change, a grade below S should read about the same
at every level, and S should still be the jump.

## Open questions

- Initiative: should speed decide who acts first in an exchange, and how strongly?
- Does the same apply to other body stats (strength against toughness), or only speed?
- Where exactly does S outpacing start: at S itself, or at a gap from S?
- How do the Gates (which lift speed past human) fit: do they lift you into S for the purpose
  of pace, as now?
