import type { CreationDraft, CreationView } from '@/game';

/** Props every page of the academy file receives. */
export interface StepProps {
  readonly view: CreationView;
  readonly draft: CreationDraft;
  readonly update: (patch: Partial<CreationDraft>) => void;
}
