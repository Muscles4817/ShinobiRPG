# The editor

The editor lets a player change how a pack is written, starting with its fighters, and play
with those changes in versus and in new games.

## Where edits live

- **On the device**, in a store of their own (`shinobi-rpg/edits`), apart from any save, by pack.
- **As overrides, not copies.** A `ContentEdits` keeps only what differs from the pack. Anything
  left alone follows the pack, including later versions of it.
- **Copied into each new game.** `createNewGame` stores the pack's edits in `GameState.edits`,
  and loading rebuilds the context from that copy. A game keeps the world it began with: edits
  made later reach versus and the next new game, never a game already under way.
- **Undone by dropping them.** Resetting a fighter removes their entry; resetting a pack removes
  all of them. Setting a value back to the pack's also clears it.

## Rules

The editor never refuses a change because the pack's rules wouldn't allow it in authored
content (a jōnin with an S stat). It says so in a note instead. It only keeps out what would
break a fight: it refuses an empty technique list, and doesn't offer another clan's techniques or
a technique that summons without a contract behind it. Stats stay between 0 and 60.

## Phases

1. **Fighters (done):** stats and techniques of the pack's shinobi, versus-only duelists and
   foes, with reset per fighter and per pack.
2. **Techniques and gear:** a builder for `TechniqueDef`s (verbs, reach, accuracy, rank) and
   gear. These are new ids, not overrides, so edits gain `added` entries alongside overrides,
   and a fight bench readout (a few bouts against an AI copy) shows whether a change is sane.
3. **Foes in full:** traits, danger, retinue, `healthScale`.
4. **The setting:** people with schedules, places, jobs. This is where a runtime schema for the
   whole `ContentPack` is needed (the JSON move CLAUDE.md anticipates), and where validation
   (`validateContent`) must run on the edited pack before a game starts.
5. **Export:** write a pack's edits out as a duelist file or JSON, to share or to promote into
   the codebase.
