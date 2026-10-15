# Village places: where people go off duty

Bonds are mostly made off duty. The jobs board and the training ground decide how strong you
get; the places below decide who you know. This note covers the two such places that exist
(the bar and hot water) and proposes which other kinds would fit later, and where. Not every
town gets every place. That depends on its size, its wealth and its culture.

## Built

### The bar (`tavern`)

An izakaya, a teahouse or a gambling house's front room, open evenings and nights.

- **The crowd.** People's schedules bring regulars in. A round (`buyRound`) warms everyone
  inside, once a night, and doesn't use up anyone's time.
- **A seat beside someone** (`drinkWith`, `game/bar.ts`). A drink counts as the day's time
  with that person, like a talk or a dinner. You choose how to spend it: _trade stories_
  (joke), _a quiet cup_ (quiet) or _cup for cup_ (challenge). Their traits decide how the
  tone lands (`reactionTo`), plus a small `DRINK_BONUS` for the drink. Once you know their
  tastes (the same bond stage as the person sheet), each way is stamped "their kind of thing"
  or "not their thing". You can sit with a stranger: a bar is where you meet people.
- **The counter hears more** (`rumoursOverheard`), including talk that carries to another
  town.
- **The back tables** (`TavernFields.pastimes`). Each bar lists what is played there: lantern
  dice, shōgi, knot races, chō-han, fan-tossing, a go game left for the next traveller. Today
  a pastime is a scene on the page, a plaque with no numbers on it. **This is the mini-game
  hook.** A future mini-game is keyed by pastime id: give `Pastime` a `game` id, add a
  `playPastime` action and its scene, and the plaque gets a "Sit in" button. Nothing else on
  the page has to move.

Where the bars are:

| Pack     | Town           | Bar                  | Character                                          |
| -------- | -------------- | -------------------- | -------------------------------------------------- |
| original | Tōrōgakure     | The Paper Lantern    | The village izakaya: dice, a shōgi board           |
| original | Port Shiomachi | The Salt Lantern     | Sailors: knot races, arm-wrestling                 |
| original | Kiri Ford      | The Low Water (new)  | Ferrymen on stilts; drawing lots for the dawn boat |
| naruto   | Konoha         | Izakaya Tanuki       | Off-duty shinobi: shōgi, hanafuda                  |
| naruto   | Tanzaku Town   | The Short Odds       | A gambling house: chō-han                          |
| naruto   | Otafuku Town   | The Willow Teahouse  | Parlour games: fan-tossing                         |
| naruto   | Shukuba Town   | The Waystation (new) | Travellers' drinking stand: a go game in progress  |

No bar in the Land of Waves (too poor, and under Gatō's thumb) or at the Fire Temple
(monks). Kiri Ford and Shukuba each got a resident regular (Tobei the ferry pilot, Sōta the
courier) so the room isn't empty.

### Hot water (`onsen`)

A natural spring (`waters: 'spring'`) or a town bathhouse (`'bathhouse'`). It is open by day
and drains at night (validated: a soak takes a stretch of the day, and the night is for
sleeping).

- **A soak** (`soak`, `game/onsen.ts`) costs ryo and takes one slot. It gives back energy
  (more than a nap) and a little health, and leaves you **warm through** until the day ends.
  That state is `character.soaked`, a `ModifierSpec` of `sleepHealing` ×1.2 read by
  `characterModifiers` and cleared by `spendTime` at the day's end, like the meal. One soak a
  day.
- **Beside someone.** Whoever the schedule puts in the water can be soaked with. It is a
  quiet hour, so it counts as the day's time with them and lands by their taste for `quiet`.

Where it is: **Tōrōgakure** has the Ember Springs. The Land of Embers runs hot under the
ground, so a natural spring in the village fits. **Konoha** has its bathhouse (canon; the
attendant has chased a certain white-haired writer off the fence). Port Shiomachi, Kiri Ford
and the other towns have none for now.

## Proposed (not built)

Each of these would be a `PlaceDef` kind with its own page. Each should give a reason to
visit that no existing place gives.

- **Shrine** (`shrine`). Pray once a day for a small, day-long `ModifierSpec` (luck on job
  checks, calm for genjutsu study). Hang an ema plaque with a wish, which a person can answer
  later as a memory. Festivals are held here. Fits Tōrōgakure (its spirit lanterns, Nanami the
  shrine-keeper), Mount Reikon (the spirit mountain, once it opens), the Fire Temple (as a
  temple, with the monks' training) and Konoha (the Naka shrine, for Uchiha players).
- **Teahouse** (`teahouse`). A daytime counterpart to the bar: tea, sweets, a game of go, and
  a sitting with someone who dislikes noise. The bar's ways with tea in the cups: calm and
  humble people like it best. Snacks (`snack`) already exist to sell there. Fits Tōrōgakure
  (Kasumi's tea shop could graduate into one), Otafuku (its Willow is half a teahouse
  already), Tanzaku (castle town) and Konoha.
- **Gambling den** (`den`). Ryo in, ryo out, against the house's odds, with a mini-game per
  table. This could be the bar's back tables grown up rather than a new kind: a `tavern`
  whose pastimes take stakes. Fits Tanzaku (the Short Odds), Port Shiomachi (dockside dice)
  and Kiri Ford. Never in a hidden village's centre.
- **Theatre** (`theatre`). Kabuki or puppets on festival nights. Take someone along for a
  bond outing that counts double on a festival; a genjutsu user picks up a little from
  watching the illusions of the stage. Fits Tanzaku (castle town), Otafuku (pleasure
  quarter) and Konoha.
- **Dojo** (`dojo`). A school's hall: sparring against its students for its style, and the
  place a school technique's teacher is found. It overlaps the training place and teachers,
  so build it only when schools become a progression path (milestone 3). Fits Tōrōgakure
  (the Lantern Wind school), Port Shiomachi (wire and nets), and Konoha (the Hyūga compound
  as a closed dojo).
- **Bathhouse versus natural spring.** These stay one kind (`onsen`) with `waters`, because
  the play is the same. A town sentō should be cheaper and plainer. A wild spring could later
  move to a `wilds` place in the mountains (Mount Reikon), free to use but a day's walk
  away. A port town (Shiomachi) would get a sentō for the fishermen before anything grander.
  A spa town such as Yugakure would be a whole location built around a spring.

Rough order: shrine and teahouse first (cheap, both feed bonds and festivals). After that,
mini-games on the bar's pastimes, which a gambling den then reuses. Theatre and dojo come
with the milestones that give them a job.
