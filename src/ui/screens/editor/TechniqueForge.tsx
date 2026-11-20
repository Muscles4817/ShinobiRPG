import { FORGE_CHOICES, type TechniqueDraft } from '@/game';

import { CheckLine, ChipPicker, ChipToggles } from './ForgeFields';
import { ForgeEffects } from './ForgeEffects';

/**
 * The forge's form: a technique's name and words, its art, element and rank, how surely it
 * lands, how far it reaches, what it does in order and what it asks of its user. Every change
 * goes straight into the draft; the preview beside it reads the draft as a fight would.
 */

const NAME_MAX = 40;
const DESCRIPTION_MAX = 200;
const BODY_ARTS: readonly string[] = ['taijutsu', 'kenjutsu'];
const NO_ELEMENT = 'none';
const ELEMENT_CHOICES = [{ id: NO_ELEMENT, label: 'None' }, ...FORGE_CHOICES.elements];
const RANK_CHOICES = FORGE_CHOICES.ranks.map((r) => ({ id: r, label: r }));

function pick<T extends string>(choices: readonly { readonly id: T }[], id: string): T | null {
  return choices.find((c) => c.id === id)?.id ?? null;
}

function Words({ draft, onChange }: ForgeProps) {
  return (
    <>
      <label className="forge-text">
        <span>Name</span>
        <input
          type="text"
          value={draft.name}
          maxLength={NAME_MAX}
          placeholder="Lantern Comet"
          onChange={(e) => {
            onChange({ ...draft, name: e.target.value });
          }}
        />
      </label>
      <label className="forge-text">
        <span>What it looks like</span>
        <textarea
          rows={2}
          value={draft.description}
          maxLength={DESCRIPTION_MAX}
          placeholder="A ball of fire flung high, falling like a lantern cut loose."
          onChange={(e) => {
            onChange({ ...draft, description: e.target.value });
          }}
        />
      </label>
    </>
  );
}

function Shape({ draft, onChange }: ForgeProps) {
  return (
    <>
      <ChipPicker
        label="Art"
        choices={FORGE_CHOICES.arts}
        value={draft.discipline}
        onPick={(id) => {
          const discipline = pick(FORGE_CHOICES.arts, id);
          if (discipline) onChange({ ...draft, discipline });
        }}
      />
      <ChipPicker
        label="Element"
        choices={ELEMENT_CHOICES}
        value={draft.element ?? NO_ELEMENT}
        onPick={(id) => {
          const element = pick(FORGE_CHOICES.elements, id);
          onChange({ ...draft, element, needsNature: element ? draft.needsNature : false });
        }}
      />
      <ChipPicker
        label="Rank"
        choices={RANK_CHOICES}
        value={draft.rank}
        onPick={(id) => {
          const rank = pick(RANK_CHOICES, id);
          if (rank) onChange({ ...draft, rank });
        }}
      />
      <ChipPicker
        label="Lands"
        choices={FORGE_CHOICES.lands}
        value={draft.accuracy}
        onPick={(id) => {
          const accuracy = pick(FORGE_CHOICES.lands, id);
          if (accuracy) onChange({ ...draft, accuracy });
        }}
      />
    </>
  );
}

function Reach({ draft, onChange }: ForgeProps) {
  const usual = draft.reach === null;
  return (
    <div className="forge-reach">
      <CheckLine
        checked={usual}
        onChange={(on) => {
          onChange({ ...draft, reach: on ? null : ['close'] });
        }}
      >
        Reaches as its art usually does
      </CheckLine>
      {!usual && (
        <ChipToggles
          label="Reaches"
          choices={FORGE_CHOICES.bands}
          picked={draft.reach}
          onChange={(ids) => {
            const reach = FORGE_CHOICES.bands.filter((b) => ids.includes(b.id)).map((b) => b.id);
            onChange({ ...draft, reach });
          }}
        />
      )}
    </div>
  );
}

function Asks({ draft, onChange }: ForgeProps) {
  return (
    <fieldset className="forge-field">
      <legend>What else it is</legend>
      <CheckLine
        checked={draft.oncePerFight}
        onChange={(oncePerFight) => {
          onChange({ ...draft, oncePerFight });
        }}
      >
        A trump card: once a fight
      </CheckLine>
      <CheckLine
        checked={draft.lethal}
        onChange={(lethal) => {
          onChange({ ...draft, lethal });
        }}
      >
        Kills in one strike a foe who can’t see it coming or can’t move
      </CheckLine>
      <CheckLine
        checked={draft.needsNature}
        disabled={draft.element === null}
        onChange={(needsNature) => {
          onChange({ ...draft, needsNature });
        }}
      >
        {draft.element === null
          ? 'Only for those of its nature (give it an element first)'
          : 'Only for those of its nature'}
      </CheckLine>
      {BODY_ARTS.includes(draft.discipline) && (
        <CheckLine
          checked={draft.moulded}
          onChange={(moulded) => {
            onChange({ ...draft, moulded });
          }}
        >
          Moulds chakra: costs chakra, not breath
        </CheckLine>
      )}
      <CheckLine
        checked={draft.taught}
        disabled={draft.rank === 'S'}
        onChange={(taught) => {
          onChange({ ...draft, taught });
        }}
      >
        {draft.rank === 'S'
          ? 'Taught in the home village (an S technique is taught by no one)'
          : 'Taught in the home village, so you can learn it in a new game'}
      </CheckLine>
      {draft.discipline === 'kenjutsu' && (
        <p className="muted">A blade art needs a blade in hand.</p>
      )}
    </fieldset>
  );
}

interface ForgeProps {
  readonly draft: TechniqueDraft;
  readonly onChange: (draft: TechniqueDraft) => void;
}

export function TechniqueForge({ draft, onChange }: ForgeProps) {
  return (
    <form
      className="forge-form"
      aria-label="Make a technique"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <Words draft={draft} onChange={onChange} />
      <Shape draft={draft} onChange={onChange} />
      <Reach draft={draft} onChange={onChange} />
      <ForgeEffects
        effects={draft.effects}
        onChange={(effects) => {
          onChange({ ...draft, effects });
        }}
      />
      <Asks draft={draft} onChange={onChange} />
    </form>
  );
}
