# Who was right: the objective layer against today's AI

The shadow run (`docs/design/research/objectives-shadow.md`) found where the objective layer and
today's AI disagree. This experiment settles some of it in the real engine:

- at each such moment of a watched chūnin fight (every ordered pair of the bench cast, one fight
  each), the fight is copied and played out twice, with the same seeds (common random numbers):
  - once as today's AI plays it;
  - once with the layer's move forced for that one exchange, and today's AI after it;
- each moment is played out six times;
- a moment counts only if the forced move was really played.

`npx vitest run --config prototypes/objectives/vitest.config.ts --silent=false`

| Moment                                             | Found | Played | Wins, today | Wins, layer | Margin, today | Margin, layer | Layer better / worse / same |
| -------------------------------------------------- | ----- | ------ | ----------- | ----------- | ------------- | ------------- | --------------------------- |
| recover: a dry caster fights on → Gather           | 302   | 227    | 50.3%       | 56.7%       | −0.009        | +0.010        | 50 / 34 / 143               |
| find: nobody in sight, improvised → Search         | 131   | 16     | 93.8%       | 94.8%       | 0.768         | 0.769         | 2 / 2 / 12                  |
| stay: a step while at home → the best attack       | 290   | 138    | 17.5%       | 16.3%       | −0.333        | −0.342        | 34 / 37 / 67                |
| set-up: attacked when a hold was on offer → a hold | 383   | 122    | 45.6%       | 43.9%       | −0.045        | −0.080        | 13 / 26 / 83                |

Margin is the fighter's health share left minus the foe's at the end. "Better" means the
layer's move came out ahead by more than a sliver, counting wins and a quarter of the margin.

## What it says

- **Recover: the layer is right, probably.** A caster out of chakra who stops to Gather wins
  about six points more often than one who keeps throwing improvised blows. A first run, before
  the fix below, agreed (52.6% against 62.4% on the moments it could play). That is
  suggestive, not proof: 50 moments better against 34 worse is a sign test of about p = 0.1.
  Worth adopting in step 5, and worth a larger run first.
- **Stay: neither.** Today's extra footwork (stepping while the layer thinks the fighter is
  already home) neither helps nor hurts. These are mostly losing positions anyway (17% wins).
  The disagreement comes from two readings of "home": the plan's set distance
  (`strongestBand`) against the identity's (`homeBand`). They should be one reading.
- **Set-up: today's AI is right here.** Swapping an attack for a hold, just because a hold is on
  offer, does slightly worse (26 moments worse, 13 better). A set-up has to be worth it: the hold
  must lead somewhere (a finisher, a killing blow), which a single forced exchange doesn't
  test. This supports letting the planner value objectives (step 5) rather than raising
  set-up's hand-tuned weight.
- **Find: no verdict.** The forced Search was played in only 16 of 131 moments. Something else
  takes the turn first: a hold, a daze, or the kit. Too few to say anything.

Two caveats:

- One forced exchange is a narrow test of an objective that is meant to last several.
- One-on-one, chūnin only.

The planner (step 5) tests whole plans under each objective, which is the real comparison.
