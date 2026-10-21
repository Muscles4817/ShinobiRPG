import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement scrolling; the feeds call scrollIntoView to show the latest line, and
// the desk's Record opens a book at the top of the window.
if (typeof Element !== 'undefined') {
  const proto = Element.prototype as Partial<Element>;
  proto.scrollIntoView ??= () => undefined;
  window.scrollTo = () => undefined;
}
