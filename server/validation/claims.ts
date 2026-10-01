import { z } from 'zod';

export const createClaimSchema = z.object({
  foundReportId: z.string().uuid('Invalid report ID'),
  justification: z.string().min(10, 'Please provide more details for justification'),
});

export type CreateClaimInput = z.infer<typeof createClaimSchema>;
