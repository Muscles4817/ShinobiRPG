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

## Stage 1: the state, every fight as before (this change)

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

## Stage 2: movement per foe

Every writer of `range` becomes a writer of pairs:

| Writer                                                | What moves                                                                                                    |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| A step                                                | The stepper and the foe they step on (their target, else the foe they face). Other pairs keep their distance. |
| An entry or a flicker                                 | The user and their target.                                                                                    |
| A knock                                               | The attacker and the one knocked.                                                                             |
| A conceal that goes where the user fights best (Mole) | The user and the foe they come up on, not everyone.                                                           |
| A wide area that throws the fight apart               | The maker and each foe it caught.                                                                             |
| A vast blast                                          | Everyone: every pair goes to far, and `range` with it.                                                        |
| Walls (a room has no far)                             | Every pair, as the ground allows.                                                                             |
| Holding off                                           | Who fires is whoever the closer steps in on; the pair is the holder and the closer.                           |
| Fleeing                                               | Judged from the nearest chaser.                                                                               |

Rules that stay as they are:

- **Rows.** The front row still covers the back up close (`canReach`). Stepping in on a
  back-row foe while their front row stands brings you close to the front row first.
- **Targets.** A card aims only at foes within its reach from the attacker's distance to each.

Re-measure the benches, and retune the named constants where they move.

## Stage 3: the screens

- **The formation** shows each foe's distance to you.
- **"You are here"** on the plan's distance tabs follows your own distance.
- **Foe cards** say "close to you" or "at mid range".
- **The watch screen** tags each line with the distance between the one acting and their
  target. The "why" strip gains a row when a foe kept their distance.
