# Clan compounds: where the clans live

Working document for giving the village's clans homes of their own. Today every clan member is
scheduled at the common places (the training grounds, the academy, the bar), so the village
screen lists almost everyone, and nothing says where a clan lives or how it treats outsiders.
Part 1 reviews what the game has today. Part 2 records what we agree. Part 3 is the design.
Part 4 is the build plan. Part 5 records what was built. Nothing here is binding until it is in
Part 2.

---

## Part 1: The review

- **People are found by schedule** (`PersonDef.schedule`, `whereNow` in `game/people/cast.ts`):
  a place id per time slot in their home location, or nobody home.
- **Talking needs only that they are about** (`actions/talk.ts`): anyone somewhere in your
  village right now can be talked to from the Bonds tab. Where they are doesn't matter.
- **The village screen shows everyone at each place** (`PlaceCard.people`, `facesByPlace`), and
  with the authored cast and the pooled senseis that is a crowd.
- **Clans** (`ClanDef`) carry stats, a modifier spec, arts, a nature, techniques, a lodging, a
  bloodline and (since the retinue work) a companion; nothing about a place or a temperament.
- Naruto has 16 clan people across eight clans; the original pack 16 across four.

---

## Part 2: What we agree

1. **Each clan has a compound** in its village: a place of a new kind, `compound`, where its
   people live part of the day.
2. **How a clan treats outsiders is its own** (`ClanDef.outsiders`): an open clan (the Akimichi)
   lets anyone through the gate by day; a reserved one wants you to know someone inside; a
   guarded one (the Hyūga) only lets in those close to a member.
3. **Every compound is closed to outsiders at night**, unless you are very close (bonded) to
   someone inside. Members are always home.
4. **The gate means something:** someone inside a compound you may not enter can't be talked to
   until they come out.
5. **The village screen stays calm:** compounds sit behind one card for the clans' quarter, and
   a place card shows a few faces, then how many more.
6. **Room to grow, not built now:** being received by a clan head, clan training, standing with a
   clan, arranging a marriage once you can found a clan; and clans tied to the village's life
   (in naruto, the Akimichi keep the best restaurant, the Nara farm and make medicine with the
   Akimichi, the Aburame help with the farming), so where you meet people has a reason. The
   original pack's clans get ties of the same kind when its setting is discussed.
7. **Before companions' care (step 2b):** in Konoha the vet works in the Inuzuka compound, the
   clan's kennels.

---

## Part 3: The design

### Content

- `PlaceDef` kind **`compound`**: a place with a `clanId` and an optional `headId` (the clan
  head, a person). Validated: the clan exists, has members in the pack, and has one compound.
- `PlaceDef` kind **`quarter`**: the clans' quarter, listing its `compoundIds`. Compounds listed
  in a quarter are left off the village screen; the quarter's card stands for them.
- `ClanDef.outsiders`: `welcoming`, `reserved` or `guarded` (validated: a clan with a compound
  says how it treats outsiders).
- People's schedules put clan members in their compound for part of the day (most often the
  evening).

### The rule (`game/compounds.ts`)

The bond stage an outsider needs with someone of the clan, by the clan's stance and the hour:

| Stance        | By day (needs)         | At night (needs) |
| ------------- | ---------------------- | ---------------- |
| **welcoming** | nothing                | bonded           |
| **reserved**  | an acquaintance inside | bonded           |
| **guarded**   | a close friend inside  | bonded           |

The bond is with **any** member of the clan, so knowing one Hyūga well opens the gate. A
member of the clan is always let in. `compoundAccess` returns why not, in words ("The Hyūga
don’t let strangers past the gate. Get to know one of them first."), and the talk action asks
it for anyone standing in a compound.

### The screens

- **The quarter's page:** one card per compound, with the clan, how it treats outsiders in a
  phrase, whether you'd be let in now, and who is home.
- **A compound's page:** the gate (let in or turned away, and why), who is home, the head. Talk
  to the people there from it.
- **Place cards** show at most three faces, then "and so many more".

### Content in this step

- **Naruto:** a quarter with compounds for the Uchiha (guarded), Hyūga (guarded), Nara
  (reserved), Akimichi (welcoming), Yamanaka (reserved), Aburame (reserved) and Inuzuka
  (reserved). The Uzumaki have no compound.
- **Original:** a quarter with compounds for the Hibana, Tokaku, Kurogane and Shimenawa, each
  with a stance that fits the clan.

---

## Part 4: The build plan

One PR: the two place kinds and `ClanDef.outsiders` (validated), the access rule and its use in
talk, the quarter and compound pages, face caps on place cards, schedules in both packs, tests
and a screenshot at 390px. No save change: compounds are content and the rule is derived.

---

## Part 5: What was built

Nothing yet.
