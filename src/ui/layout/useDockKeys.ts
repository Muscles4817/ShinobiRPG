import { DOCK_TABS, type DockTab } from '../components/Dock';
import { useKeys } from './useKeys';

/** Number keys switch dock tabs on the desktop layout: 1 is Here, 6 is Record. */
export function useDockKeys(enabled: boolean, onSelect: (tab: DockTab) => void): void {
  const bindings = Object.fromEntries(
    DOCK_TABS.map((t, i) => [
      String(i + 1),
      () => {
        onSelect(t.id);
      },
    ]),
  );
  useKeys(bindings, enabled);
}
