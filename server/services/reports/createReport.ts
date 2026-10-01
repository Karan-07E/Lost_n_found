import { createReportSchema } from '../../validation/reports';
import { createReport as createReportRepo } from '../../repositories/reports';
import { uploadImage } from '../../utils/upload';
import { triggerMatching } from '../matching/engine';

export async function createReportService(formData: FormData, userId: string) {
  const rawData: Record<string, any> = {};
  
  for (const [key, value] of formData.entries()) {
    if (key !== 'image') {
      rawData[key] = value;
    }
  }

  const validated = createReportSchema.parse(rawData);
  
  let imagePath = null;
  const imageFile = formData.get('image') as File | null;
  if (imageFile && imageFile.size > 0) {
    imagePath = await uploadImage(imageFile);
  }

  const newReport = await createReportRepo({
    ...validated,
    imagePath,
    userId,
    status: 'ACTIVE',
  });

  // Run matching engine asynchronously (fire and forget)
  triggerMatching(newReport.id).catch(console.error);

  return newReport;
}
