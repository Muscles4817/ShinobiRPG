import { createContext, useContext } from 'react';

import type { CombatOption } from '@/game';

import type { HoverHandlers } from '../../../layout/useHoverPreview';

/**
 * What a plan card spreads on its button so pointing at it previews its technique beside the
 * table. The plan screen provides it on a wide screen; anywhere else a card gets nothing.
 */
export type PreviewFor = (option: CombatOption) => HoverHandlers;

const NOTHING: PreviewFor = () => ({});

export const PlanPreviewContext = createContext<PreviewFor>(NOTHING);

/** The hover handlers for one plan card. */
export function usePlanPreview(option: CombatOption): HoverHandlers {
  return useContext(PlanPreviewContext)(option);
}
