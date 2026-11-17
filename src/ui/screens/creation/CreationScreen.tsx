import { useMemo, useState } from 'react';

import {
  contextForPack,
  creationView,
  defaultDraft,
  draftProblems,
  fileView,
  notesProblems,
  packChoices,
  reviseDraft,
  rollBreakIn,
  taughtProblems,
  type BreakInRoll,
  type CreationDraft,
  type GameContext,
  type PackChoice,
} from '@/game';

import { Backdrop } from '../../art/Backdrop';
import { Notice } from '../../components/Notice';
import { useEdits } from '../../edits/EditsProvider';
import { useWideScreen } from '../../layout/useWideScreen';
import { randomSeed } from '../../randomSeed';
import { BreakInStep } from './BreakInStep';
import { CaughtStep } from './CaughtStep';
import { NindoStep, TraitsStep } from './ChoiceSteps';
import { FileStep } from './FileStep';
import { BuildStep, UpbringingStep } from './FrameSteps';
import { NotesStep, QuirksStep, ReadBackStep } from './NotesSteps';
import { RecordStep } from './RecordStep';
import { FileNav } from './FileNav';
import { FileRail } from './FileRail';
import { StandingStep } from './StandingStep';
import { TechniquesStep } from './TechniquesStep';
import type { StepProps } from './types';
import { WorldStep } from './WorldStep';

type StepId =
  | 'world'
  | 'breakin'
  | 'record'
  | 'standing'
  | 'upbringing'
  | 'build'
  | 'file'
  | 'traits'
  | 'notes'
  | 'quirks'
  | 'readback'
  | 'jutsu'
  | 'nindo'
  | 'caught';

const TITLES: Readonly<Record<StepId, string>> = {
  world: 'Choose a world',
  breakin: 'The night before graduation',
  record: 'Student record',
  standing: 'Class standing',
  upbringing: 'Family history',
  build: 'Medical record',
  file: 'Training record',
  traits: 'Instructor’s notes',
  notes: 'Special notes',
  quirks: 'What people notice',
  readback: 'The file, read back',
  jutsu: 'Techniques taught',
  nindo: 'Application essay',
  caught: 'Caught',
};

interface BlockerInput {
  readonly draft: CreationDraft;
  readonly roll: BreakInRoll | null;
  readonly problems: readonly string[];
  /** What is wrong with the file itself (training, gifts, upbringing). */
  readonly fileProblems: readonly string[];
  /** What is wrong with the special notes on it (too many for the standing). */
  readonly noteProblems: readonly string[];
  /** What is wrong with the techniques chosen beyond the basics. */
  readonly taught: readonly string[];
}

const NO_BLOCKER = (): string | null => null;

/** Why the player can't turn each page yet, or null. */
const BLOCKERS: Readonly<Record<StepId, (input: BlockerInput) => string | null>> = {
  world: NO_BLOCKER,
  breakin: ({ roll }) => (roll === null ? 'Choose how to get in.' : null),
  record: ({ draft }) => (draft.name.trim() ? null : 'Write your name.'),
  standing: NO_BLOCKER,
  upbringing: NO_BLOCKER,
  build: NO_BLOCKER,
  file: ({ fileProblems }) => fileProblems[0] ?? null,
  traits: ({ draft }) => (draft.traitIds.length < 2 ? 'Choose two traits.' : null),
  notes: ({ noteProblems }) => noteProblems[0] ?? null,
  quirks: NO_BLOCKER,
  readback: NO_BLOCKER,
  jutsu: ({ taught }) => taught[0] ?? null,
  nindo: NO_BLOCKER,
  caught: ({ problems }) => problems[0] ?? null,
};

function stepBlocker(step: StepId, input: BlockerInput): string | null {
  return BLOCKERS[step](input);
}

interface StepBodyProps extends StepProps {
  readonly step: StepId;
  readonly packs: readonly PackChoice[];
  readonly packId: string;
  readonly onPickPack: (id: string) => void;
  readonly roll: BreakInRoll | null;
  readonly onAttempt: (approachId: string) => void;
  readonly seed: number;
  readonly ctx: GameContext;
  readonly setDraft: (draft: CreationDraft) => void;
}

function StepBody({
  step,
  packs,
  packId,
  onPickPack,
  roll,
  onAttempt,
  seed,
  ctx,
  setDraft,
  ...props
}: StepBodyProps) {
  switch (step) {
    case 'world':
      return <WorldStep packs={packs} packId={packId} onPick={onPickPack} />;
    case 'breakin':
      return (
        <BreakInStep
          view={props.view}
          roll={roll}
          chosen={props.draft.breakInApproachId}
          onAttempt={onAttempt}
        />
      );
    case 'record':
      return <RecordStep {...props} />;
    case 'standing':
      return <StandingStep {...props} seed={seed} />;
    case 'upbringing':
      return <UpbringingStep {...props} />;
    case 'build':
      return <BuildStep {...props} />;
    case 'file':
      return <FileStep {...props} ctx={ctx} setDraft={setDraft} />;
    case 'traits':
      return <TraitsStep {...props} />;
    case 'notes':
      return <NotesStep {...props} ctx={ctx} />;
    case 'quirks':
      return <QuirksStep {...props} ctx={ctx} />;
    case 'readback':
      return <ReadBackStep {...props} ctx={ctx} />;
    case 'jutsu':
      return <TechniquesStep {...props} ctx={ctx} />;
    case 'nindo':
      return <NindoStep {...props} />;
    case 'caught':
      return <CaughtStep {...props} />;
  }
}

interface CreationScreenProps {
  readonly notice: string | null;
  readonly onStart: (packId: string, draft: CreationDraft, seed: number) => void;
}

/** Character creation as the opening scene: break into the academy and read your own file. */
export function CreationScreen({ notice, onStart }: CreationScreenProps) {
  const packs = useMemo(() => packChoices(), []);
  const steps: StepId[] = [
    'breakin',
    'record',
    'standing',
    'upbringing',
    'build',
    'file',
    'traits',
    'notes',
    'quirks',
    'readback',
    'jutsu',
    'nindo',
    'caught',
  ];
  if (packs.length > 1) steps.unshift('world');
  const [packId, setPackId] = useState(packs[0]?.id ?? '');
  // The editor's changes, as the game this creates will have them.
  const { editsFor } = useEdits();
  const ctx = useMemo(() => contextForPack(packId, editsFor(packId)), [packId, editsFor]);
  const [seed] = useState(randomSeed);
  // The body and mind are drawn from the same seed as the break-in, so the file shows them.
  const [draft, setDraft] = useState<CreationDraft | null>(() =>
    ctx ? { ...defaultDraft(ctx), bornSeed: seed } : null,
  );
  const [roll, setRoll] = useState<BreakInRoll | null>(null);
  const [index, setIndex] = useState(0);
  const [reached, setReached] = useState(0);
  const wide = useWideScreen();
  if (!ctx || !draft) return null;

  const view = creationView(ctx);
  const step = steps[index] ?? 'caught';
  const update = (patch: Partial<CreationDraft>) => {
    setDraft(reviseDraft(draft, patch, ctx));
  };
  const choosePack = (id: string) => {
    const next = contextForPack(id, editsFor(id));
    setPackId(id);
    if (next) setDraft({ ...defaultDraft(next), bornSeed: seed });
    setRoll(null);
  };
  const problems = draftProblems(draft, ctx);
  const fileProblems = fileView(draft, ctx).problems;
  const noteProblems = notesProblems(draft, ctx);
  const taught = taughtProblems(draft, ctx);
  const blocker = stepBlocker(step, { draft, roll, problems, fileProblems, noteProblems, taught });
  const props = { view, draft, update };
  const last = step === 'caught';
  const forward = last
    ? view.world.graduate
    : step === 'breakin'
      ? 'Find your file'
      : 'Turn the page';
  const canForward = last ? problems.length === 0 : blocker === null;
  const goForward = () => {
    if (last) {
      onStart(packId, draft, seed);
      return;
    }
    setReached(Math.max(reached, index + 1));
    setIndex(index + 1);
  };

  return (
    <div className={wide ? 'app creation wide' : 'app creation'}>
      <header className="ng-hero sky" data-slot="night">
        <Backdrop id={view.world.backdrop} />
        <div className="ng-hero-text">
          <p className="epithet gold">{view.world.epithet}</p>
          <h1 className="ng-title">{view.world.village}</h1>
        </div>
      </header>
      <div className="file-desk">
        {wide && (
          <FileRail
            pages={steps.map((id) => ({ id, title: TITLES[id] }))}
            index={index}
            reached={reached}
            onOpen={setIndex}
            draft={draft}
            view={view}
            ctx={ctx}
          />
        )}
        <div className="file-column">
          <main className="file">
            {' '}
            {notice && <Notice text={notice} />} <p className="file-stamp">Confidential</p>{' '}
            <h2 className="file-title">{TITLES[step]}</h2>{' '}
            <StepBody
              step={step}
              {...props}
              packs={packs}
              packId={packId}
              onPickPack={choosePack}
              roll={roll}
              onAttempt={(id) => {
                update({ breakInApproachId: id });
                setRoll(rollBreakIn(ctx, id, seed));
              }}
              seed={seed}
              ctx={ctx}
              setDraft={setDraft}
            />{' '}
          </main>
          <FileNav
            blocker={blocker}
            index={index}
            pages={steps.length}
            forward={forward}
            canForward={canForward}
            onForward={goForward}
            onBack={() => {
              setIndex(index - 1);
            }}
            wide={wide}
          />
        </div>
      </div>
    </div>
  );
}
