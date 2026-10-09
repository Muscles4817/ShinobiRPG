import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement scrolling; the feeds call scrollIntoView to show the latest line.
if (typeof Element !== 'undefined') {
  const proto = Element.prototype as Partial<Element>;
  proto.scrollIntoView ??= () => undefined;
}
