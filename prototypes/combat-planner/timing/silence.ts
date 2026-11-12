/**
 * Silent narration for the whole timing study (`../perf/silent/setup.ts` mocks: told lines become
 * the non-empty constant 'x', which the perf study checked changes no outcome). `LOUD=1` turns it
 * off, to check a figure against the loud engine.
 */
(globalThis as { __SILENT__?: boolean }).__SILENT__ = process.env.LOUD !== '1';
