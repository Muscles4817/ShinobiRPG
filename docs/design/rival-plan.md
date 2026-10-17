# Your rival

The second "come back tomorrow" hook: someone from your own year who measures themselves
against you, and whom you can't help measuring yourself against. The code is `game/rival/`.

## Who they are

Once your team is settled (sensei chosen, nature read, the first meeting over) the game picks
one classmate on another team (`chooseRival`). The gap is never evened out: it is real, and it
differs from one game to the next.

| Shape       | The gap                                   |
| ----------- | ----------------------------------------- |
| The prodigy | Well ahead of you, and knows it           |
| The neck    | Level with you, and every grade is a race |
| The chaser  | Behind you, and closing                   |
| The fallen  | Ahead now, but with less in them than you |

The shape is rolled from the seed, then the classmate who fits it best is taken from the year
in order (`yearOrder`); a year with nobody who fits takes the shape the nearest one has. Their
**temperament** (proud, kind, cold) comes from their traits, and sets how they talk, how they
take a refusal and how often they come looking for you.

## Heat

How the rivalry runs, 0–100, read as four stages: Bitter, Grudging, Respect, Sworn. Replies to
their moments move it by the reply and by how the rival's traits take its tone (the same
`toneReaction` every conversation uses). Turning down a challenge cools it by temperament;
letting one lapse cools it by half that.

## The tally

Spars (yields don't count), and **first to a grade**: for each stat, the first of you to reach
each grade above where you both started. It is scored at dawn and on the day's sheet as a
moment under the rival's 競 seal.

## Moments

- **Meeting**: word gets round which team you landed on, and they come to find you.
- **A challenge**: a slip above the village when one of you has just reached a grade first, or
  now and then (by temperament), never within `CHALLENGE_GAP` days of the last. It stands until
  the next day is out. Taking it on is a spar at a training ground.
- **After a spar**: a word with them, won or lost, and your reply.

## Their look

The rival has an ink of their own (`--rival`, `--rival-ink`) and the 競 mark, so nothing about
them reads as a gain, a cost or harm: a ring on their face, the slip, the Rivalry section on
their sheet (shape, the tally, side by side in four stats, heat) and their day-sheet moments.

## Next

- A race as a contest, challenges you issue (choosing the ground), provocations and a cruel
  tone, ways to close the gap.
- Fates: friend, partner, leaving, Kage, defection, an early death; some combine.
