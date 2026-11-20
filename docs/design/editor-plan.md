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
2. **Techniques (made, 2a) and gear (to come):** the editor's Techniques page is a forge for
   new `TechniqueDef`s (`game/edits/made/`). See "Made techniques" below. Still to come: gear,
   and a fight bench readout (a few bouts against an AI copy) to show whether a change is sane.
3. **Foes in full:** traits, danger, retinue, `healthScale`.
4. **The setting:** people with schedules, places, jobs. This is where a runtime schema for the
   whole `ContentPack` is needed (the JSON move CLAUDE.md anticipates), and where validation
   (`validateContent`) must run on the edited pack before a game starts.
5. **Export:** write a pack's edits out as a duelist file or JSON, to share or to promote into
   the codebase.

## Made techniques (Phase 2a)

- **New content, not overrides.** `ContentEdits.techniques` holds whole `TechniqueDef`s by id,
  each `made-<name>` (`made/ids.ts`), so they never meet a pack's ids. The field is optional, so
  books and saves from before need no migration. `withEdits` adds them to the pack's techniques.
- **A draft and one table.** The form holds a `TechniqueDraft` (`made/draft.ts`): name, words,
  art, element, rank, how surely it lands, reach, up to four effects and a few flags. What each
  verb asks for besides its power is declared once in `VERB_FIELDS` (`made/verbFields.ts`); the
  form, the checker (`draftProblems`) and the reader of untrusted data (`madeFrom`) all read it.
  Summoning and the Gates' ladder steps are left out (they need a contract or the pack's ladder).
- **Cost is never written.** A made technique's `chakraCost` is 0, so a fight charges what it
  does (`chakraWorth`): a made technique can't be cheap for what it is. Study difficulty follows
  its rank. A blade art needs a blade, as the pack's do.
- **The forge reads it as a fight will** (`made/view.ts`): its card, its sheet in the hands of a
  fighter of its rank, what stops it being kept and notes that never refuse (a cost past what a
  fighter of its rank holds, a vast blast, a killing blow's set-up).
- **Given to fighters on the Fighters page**, where made techniques are listed first and stamped.
  Dropping one takes it from every fighter given it; a fighter left with none goes back to the
  pack's list. Resetting every fighter keeps the techniques made.
- **Where they reach:** versus at once, and every new game (copied into `GameState.edits` with the
  rest). They have no source in the game itself (no academy, library or teacher offers them), so
  only fighters given one use it; letting the player learn one is part of Phase 4, with places.
