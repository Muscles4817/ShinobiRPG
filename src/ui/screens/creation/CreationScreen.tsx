import { useMemo, useState } from 'react';

import {
  contextForPack,
  creationView,
  defaultDraft,
  draftProblems,
  packChoices,
  rollBreakIn,
  type BreakInRoll,
  type CreationDraft,
  type PackChoice,
} from '@/game';

import { Backdrop } from '../../art/Backdrop';
import { Notice } from '../../components/Notice';
import { randomSeed } from '../../randomSeed';
import { BreakInStep } from './BreakInStep';
import { CaughtStep } from './CaughtStep';
import { NatureStep, NindoStep, TalentStep, TraitsStep } from './ChoiceSteps';
import { RecordStep } from './RecordStep';
import { ReportCardStep, type GradeMode } from './ReportCardStep';
import { StandingStep } from './StandingStep';
import type { StepProps } from './types';
import { WorldStep } from './WorldStep';

type StepId =
  | 'world'
  | 'breakin'
  | 'record'
  | 'standing'
  | 'grades'
  | 'nature'
  | 'traits'
  | 'talent'
  | 'nindo'
  | 'caught';

const TITLES: Readonly<Record<StepId, string>> = {
  world: 'Choose a world',
  breakin: 'The night before graduation',
  record: 'Student record',
  standing: 'Class standing',
  grades: 'Report card',
  nature: 'Chakra assessment',
  traits: 'Instructor’s notes',
  talent: 'Special notes',
  nindo: 'Application essay',
  caught: 'Caught',
};

interface BlockerInput {
  readonly draft: CreationDraft;
  readonly roll: BreakInRoll | null;
  readonly problems: readonly string[];
}

const NO_BLOCKER = (): string | null => null;

/** Why the player can't turn each page yet, or null. */
const BLOCKERS: Readonly<Record<StepId, (input: BlockerInput) => string | null>> = {
  world: NO_BLOCKER,
  breakin: ({ roll }) => (roll === null ? 'Choose how to get in.' : null),
  record: ({ draft }) => (draft.name.trim() ? null : 'Write your name.'),
  standing: NO_BLOCKER,
  grades: ({ problems }) => problems.find((p) => p.includes('points')) ?? null,
  nature: NO_BLOCKER,
  traits: ({ draft }) => (draft.traitIds.length < 2 ? 'Choose two traits.' : null),
  talent: NO_BLOCKER,
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
  readonly mode: GradeMode;
  readonly setMode: (mode: GradeMode) => void;
  readonly seed: number;
}

function StepBody({
  step,
  packs,
  packId,
  onPickPack,
  roll,
  onAttempt,
  mode,
  setMode,
  seed,
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
    case 'grades':
      return <ReportCardStep {...props} mode={mode} setMode={setMode} />;
    case 'nature':
      return <NatureStep {...props} />;
    case 'traits':
      return <TraitsStep {...props} />;
    case 'talent':
      return <TalentStep {...props} />;
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
    'grades',
    'nature',
    'traits',
    'talent',
    'nindo',
    'caught',
  ];
  if (packs.length > 1) steps.unshift('world');
  const [packId, setPackId] = useState(packs[0]?.id ?? '');
  const ctx = useMemo(() => contextForPack(packId), [packId]);
  const [draft, setDraft] = useState<CreationDraft | null>(() => (ctx ? defaultDraft(ctx) : null));
  const [seed] = useState(randomSeed);
  const [roll, setRoll] = useState<BreakInRoll | null>(null);
  const [mode, setMode] = useState<GradeMode>('quick');
  const [index, setIndex] = useState(0);
  if (!ctx || !draft) return null;

  const view = creationView(ctx);
  const step = steps[index] ?? 'caught';
  const update = (patch: Partial<CreationDraft>) => {
    setDraft({ ...draft, ...patch });
  };
  const choosePack = (id: string) => {
    const next = contextForPack(id);
    setPackId(id);
    if (next) setDraft(defaultDraft(next));
    setRoll(null);
  };
  const problems = draftProblems(draft, ctx);
  const blocker = stepBlocker(step, { draft, roll, problems });
  const props = { view, draft, update };

  return (
    <div className="app creation">
      <header className="ng-hero sky" data-slot="night">
        <Backdrop id={view.world.backdrop} />
        <div className="ng-hero-text">
          <p className="epithet gold">{view.world.epithet}</p>
          <h1 className="ng-title">{view.world.village}</h1>
        </div>
      </header>
      <main className="file">
        {notice && <Notice text={notice} />}
        <p className="file-stamp">Confidential</p>
        <h2 className="file-title">{TITLES[step]}</h2>
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
          mode={mode}
          setMode={setMode}
          seed={seed}
        />
      </main>
      <nav className="file-nav">
        {blocker && <p className="blocker">{blocker}</p>}
        <div className="row-buttons">
          <button
            type="button"
            className="btn ghost"
            disabled={index === 0}
            onClick={() => {
              setIndex(index - 1);
            }}
          >
            Back
          </button>
          {step === 'caught' ? (
            <button
              type="button"
              className="btn"
              disabled={problems.length > 0}
              onClick={() => {
                onStart(packId, draft, seed);
              }}
            >
              {view.world.graduate}
            </button>
          ) : (
            <button
              type="button"
              className="btn"
              disabled={blocker !== null}
              onClick={() => {
                setIndex(index + 1);
              }}
            >
              {step === 'breakin' ? 'Find your file' : 'Turn the page'}
            </button>
          )}
        </div>
        <p className="file-progress num">
          Page {index + 1} of {steps.length}
        </p>
      </nav>
    </div>
  );
}
