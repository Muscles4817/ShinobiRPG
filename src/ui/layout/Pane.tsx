import type { ReactNode } from 'react';

/**
 * A named part of a screen that the desktop layout may set beside another (the map beside the
 * destinations, the deck beside the chosen card). On a phone a pane is `display: contents`, so
 * its children sit in the page's column exactly as if it weren't there.
 */
export function Pane({ name, children }: { readonly name: string; readonly children: ReactNode }) {
  return <div className={`pane pane-${name}`}>{children}</div>;
}
