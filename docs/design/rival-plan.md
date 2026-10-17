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

Spars (yields don't count), races, and **first to a grade**: for each stat, the first of you to reach
each grade above where you both started. It is scored at dawn and on the day's sheet as a
moment under the rival's 競 seal.

## Moments

- **Meeting**: word gets round which team you landed on, and they come to find you.
- **A challenge**: a slip above the village when one of you has just reached a grade first, or
  now and then (by temperament), never within `CHALLENGE_GAP` days of the last. It stands until
  the next day is out. They choose the ground that suits them: a race when the course favours
  them, otherwise a spar or a race as the day falls.
- **A provocation** (`provocations.ts`): on a quiet day, now and then (more often when things
  are bitter), something specific they did, by temperament: a proud rival takes the job you
  wanted and says why, a kind one pities you in public, a cold one corrects you and walks on.
- **After a contest**: a word with them, won or lost, and your reply.

## Answering

Every reply has a tone, and the rival's tastes decide how it lands, as in any talk. Your team
and sensei hear how you answered (except at the first meeting) and lean by their own tastes:
each reply says who would like it and who wouldn't (`replies.ts`). There is no good or evil
meter, only people.

- A barbed reply (a tease, or **cruel**) leaves them **rattled**: they run worse in the next
  race.
- **Cruel** is a tone of its own. It goes for the sore spot the shape of the gap leaves them
  ("you peaked at the academy"), so it is offered only once you know them (acquaintance or
  closer). It cools the heat hard; cunning and brash people like it, kind, calm and diligent
  ones don't.
- "Settle it, then" to a provocation has them name the day: a challenge.

## Settling it on your terms

From the Rivalry section of their sheet, at a training ground, once a day: a **spar** or a
**race**, each stamped with whose ground it is (fighting power for a spar, the course for a
race), for **pride** or a **purse** (`PURSE` ryo each; the winner takes it, yielding a spar
forfeits it).

## The race

Three legs from the training ground to the bell tower (`race.ts`), each asking for its stats
(speed, then stamina, then speed and willpower). On each leg you choose a move, and so do they:

| Move           | What it does                                                          |
| -------------- | --------------------------------------------------------------------- |
| Hold steady    | Run as you are. Behind a push, you ride the pusher's wake.            |
| Push           | Gain ground now; it tells on every leg after.                         |
| Take the roofs | Even odds: a lot of ground, won or lost (slightly ahead, on average). |

Each answers another: steady beats a push (the wake takes its gain), a push beats a gamble, a
gamble beats steady on average. What they mean to do is chosen as the leg begins, by
temperament and how the race stands, and you read it when your perception is at least theirs
(or now and then by luck): "they keep glancing at the rooftops". So the race rewards reading
them, not using your best stat three times. A race costs a slot and energy, works both
runners' legs, and ends in a reply unless it is a dead heat.

## Closing the gap

The Rivalry section lists the ways that apply now, each read from the rule behind it: ask them
to teach you a stat they're ahead in (anyone ahead of you can), sharpen your eyes to read every
leg, or rattle them.

A rival who has fallen **behind** you trains harder: more drills a day for as long as you lead
(`drive.ts`, `TRAILING_DRIVE`). Peers otherwise grow on their own by the same rules as everyone;
this is the one open exception, and their sheet says so ("at the grounds before dawn all week").
A rival far ahead is never evened out.

## Their look

The rival has an ink of their own (`--rival`, `--rival-ink`) and the 競 mark, so nothing about
them reads as a gain, a cost or harm: a ring on their face, the slip, the read in a race, the
Rivalry section on their sheet and their day-sheet moments.

## Next

- Fates: friend, partner, leaving, Kage, defection, an early death; some combine.
- The shared job and the exam bout.
