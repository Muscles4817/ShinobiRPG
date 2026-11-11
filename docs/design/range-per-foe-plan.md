# Range per foe

Until now a fight had one distance (`PlanState.range`): everyone was close, mid or far from
everyone. That is wrong whenever a side has more than one body. Kakashi steps in on Zabuza,
and Haku, who meant to keep to mid range with his needles, is dragged in with him. One Mole
pulls both foes in at once. A caster can never hang back while a swordsman presses.

Every pair of foes now keeps a distance of its own.

```
Kakashi ── close ── Zabuza
   └────── mid ──── Haku

Kakashi steps in on Haku:
Kakashi ── close ── Zabuza (unchanged)
   └───── close ─── Haku
```

## The model

- **A distance per pair.** `distances` (on `PlanState` and `Round`) maps a pair of foes,
  keyed by `pairKey`, to a band. A pair not in it stands at `range`, the fight's distance,
  which is also where everyone starts. Teammates have no distance to each other.
- **A fighter's own distance** is their distance to the nearest foe still standing, the one
  they face (`bandOf`). Their plan plays the slots for that distance. Their footwork moves from
  it, their trap waits at it, and the screen says it of them.
- **Read through the helpers.** Ask a pair with `distanceBetween`, and a fighter with `bandOf`.
  Never read `range` for one fighter's sake.

## Stage 1: the state, every fight as before (done)

- `distances` and the helpers live in `engines/plan/distance.ts`.
- Every read of the shared distance goes through the helpers:
  - with an attacker and a target in hand, the distance between them (avoid rolls, counters,
    chains, clashes, clone blows, traps, holding off);
  - otherwise, the fighter's own distance (their plan, their footwork, intents, readiness,
    the screen's distance).
- Nothing writes a pair's distance yet. With no pair of its own, every pair stands at `range`,
  so every fight plays exactly as before. The unchanged goldens and benches show it.
- Saves need nothing. `distances` is optional, and a fight saved without it resumes with every
  pair at `range`.

## Stage 2: movement per foe (done)

Every writer of `range` now writes pairs (`pairMoves.ts`, `pairsMoved` in `groundPlay.ts`):

| Writer                                           | What moves                                                                                                              |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| A step in                                        | The stepper and the foe they step on (their target, else the foe they face). Other pairs keep their distance.           |
| A step back                                      | The stepper gets clear of every foe nearer than where they go, but each of the others may keep pace (the same contest). |
| An entry, a flicker, a conceal that moves (Mole) | The user and their target (else the foe they face), the same way as a step.                                             |
| A knock                                          | The attacker and the one knocked.                                                                                       |
| A wide area                                      | The maker and each foe it caught.                                                                                       |
| A vast blast                                     | Everyone: every pair goes to far, and `range` with it.                                                                  |
| Walls (a room has no far)                        | Each pair, as the ground allows.                                                                                        |
| A summons, a shadow clone                        | Joins standing from every foe where its caller or maker stands (`joinedBeside`).                                        |
| Holding off                                      | Unchanged: any foe whose own distance to the closer has a hold-off ready may fire.                                      |

Rules that keep a crowd a crowd:

- **Rows.** Going in on a back-row foe while their front row stands brings you as near the
  front row too (`closingIn`); the front row still covers the back up close (`canReach`).
- **Ganging up.** A step in on a foe someone of your side is already fighting up close is sure:
  nobody keeps a second foe off while busy with the first. Without it, a caster held a gang of
  three off one at a time (the content bench's gang went from 5% to 50% won).
- **Targets.** A card aims only at foes within its reach from the attacker's distance to each.

The benches held after these two rules (the gang 9%, the bandit chief 63% for a ninjutsu
graduate, against 5% and 65% before).

## Stage 3: the screens (this change)

- **Every fighter's distance** reaches the screen on its view (`CombatantView.distance`,
  `plan/combatantView.ts`): a foe's from you, and anyone on your side's from the foe they face.
- **The formation** tags each foe with its own distance beneath its seal, on the plan screen,
  whenever a foe still standing is at a distance other than yours (`foesSpread`). The watch
  screen leaves the tags off: its gap says the distance of the beat being shown.
- **A foe's read** (tapped in the formation) says "Close to you", "At mid range from you" or
  "Far off from you".
- **"You are here"** on the plan's distance tabs follows your own distance (`view.range`, your
  `bandOf`), and a teammate's tab follows theirs.
- **The watch screen** tags each turn's lines with the distance between the one acting and whom
  the turn was aimed at (`Round.aimedAt`, read in `staged`); a turn aimed at no foe (or at a
  teammate) is told from the foe its maker faces.
- **The "why" strip** gains a row, "Kept a distance of their own", naming each foe still
  standing at a distance other than yours.
