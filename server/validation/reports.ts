import { z } from 'zod';

export const createReportSchema = z.object({
  reportType: z.enum(['LOST', 'FOUND']),
  title: z.string().min(3, 'Title is too short').max(200),
  description: z.string().min(10, 'Description is too short'),
  category: z.string().min(2, 'Category is required'),
  location: z.string().min(2, 'Location is required'),
  specificLocation: z.string().optional().nullable(),
  eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  eventTime: z.string().optional().nullable(),
  contactInfo: z.string().optional().nullable(),
  additionalDetails: z.string().optional().nullable(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
