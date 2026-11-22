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

## Content review: the Konoha genin (fan pack, to review ?)

Their body stats as authored (`packs/naruto/people/genin.ts`, `geninTeamTen.ts`,
`seniorGenin.ts`):

| Genin     | Strength | Speed | Stamina |
| --------- | -------- | ----- | ------- |
| Naruto    | 8 D      | 9 D   | 15 C    |
| Sasuke    | 9 D      | 14 C  | 9 D     |
| Sakura    | 4 E      | 7 E   | 5 E     |
| Ino       | 4 E      | 7 E   | 5 E     |
| Hinata    | 5 E      | 7 E   | 6 E     |
| Shikamaru | 6 E      | 7 E   | 5 E     |
| Shino     | 7 E      | 7 E   | 8 D     |
| Tenten    | 7 E      | 10 D  | 8 D     |
| Neji      | 9 D      | 12 D  | 9 D     |
| Kiba      | 10 D     | 13 C  | 10 D    |
| Chōji     | 20 B     | 5 E   | 13 C    |
| Lee       | 12 D     | 20 B  | 16 C    |

**Problems.**

- **The floor is too low.** Five of twelve are "ordinary" (E) in nearly every body stat, though
  they are grown adults who trained daily since childhood. E should mean a civilian or a truly
  poor build. Graduates sit at D (athletic) or better, C common.
- **Today's maths turns their born speed gaps into blitzes** none of them should have: Lee against
  Hinata is fully outpaced (about 2×), Sasuke against Sakura has about a third of her slipping
  left, Kiba against Ino has started to outpace. None is near S. Lifting the floor (bigger raw
  numbers, smaller ratios) and counting gaps in grades fix it together; either alone half works.
- The relative order is mostly right: Lee fastest, Kiba and Sasuke quick, Chōji strong and slow
  (bulk costs speed).

**Agreed direction.**

- **Sakura, Ino, Shikamaru:** strength and speed low D, stamina D.
- **Hinata:** speed D to C, stamina D (Gentle Fist since childhood).
- **Shino:** D across the body.
- **Naruto:** stamina **B** from the start (his defining body trait).
- **Sasuke:** talented in speed and in his skills, ahead of many chūnin: speed C, high; his
  ninjutsu and taijutsu at chūnin level (C).
- **Gai's team (Lee, Neji, Tenten):** a year ahead and drilled on fitness by a sensei who leans
  on the body: each hyper-specialised in their art, all with a base of taijutsu he drills into
  them, and **good stamina** (C at least, Lee B).
  - **Lee:** speed B, A with his weights off; stamina B.
  - **Neji:** speed C, growing into B (his real strength stays perception: he reads everything).
  - **Tenten:** taijutsu up from 7 to at least D, plausibly low C, after a year sparring with two
    taijutsu specialists; never a great taijutsu fighter, but not ordinary.
- **Chōji:** unchanged.

**Check with it.**

- **Talent and limits must allow the growth we expect.** Speed is born, so its limit
  (`stats/limits.ts`, from aptitude) decides whether Neji can reach B and Lee A. Review their
  authored `talent()` alongside the stats.
- **The player and generated classmates** (`game/student.ts`, the academy file's development)
  should graduate on the same floor, or authored genin and the player read as different species.
- **The original pack's** authored people need the same pass.
- The sensei's lens in play (Gai's ways) should match: a team he trains keeps growing in body.
