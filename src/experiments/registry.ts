import { z } from 'zod';
export const experimentRegistry = {
  'needleman-wunsch': {
    component: 'NeedlemanWunsch', algorithm: 'nw-linear-v1', execution: 'browser', implementation: 'ready',
    inputSchema: z.object({ a: z.string().regex(/^[ACGT]*$/).max(24), b: z.string().regex(/^[ACGT]*$/).max(24) }),
  },
} as const;
