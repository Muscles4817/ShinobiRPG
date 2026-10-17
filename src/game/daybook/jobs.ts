/** How a finished job is headed in the record, and the job's title read back from it. */

const DONE = ' complete';

export function jobDoneHeading(title: string): string {
  return `${title}${DONE}`;
}

/** The job's title, if `heading` is a finished job's; null otherwise. */
export function jobDoneTitle(heading: string | undefined): string | null {
  return heading?.endsWith(DONE) ? heading.slice(0, -DONE.length) : null;
}
