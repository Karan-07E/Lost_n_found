import { createReport as createReportRepo } from '../../repositories/reports';
import { uploadImage } from '../../utils/upload';
import { triggerMatching } from '../matching/engine';

export async function createReportService(formData: FormData) {
  const title = (formData.get('title') as string) || '';
  const description = (formData.get('description') as string) || '';
  const category = (formData.get('category') as string) || '';
  const location = (formData.get('location') as string) || '';
  const eventDate = (formData.get('eventDate') as string) || '';
  const reporterName = (formData.get('reporterName') as string) || '';
  const reporterContact = (formData.get('reporterContact') as string) || '';
  const reportType = (formData.get('reportType') as 'LOST' | 'FOUND') || 'LOST';

  let imagePath: string | null = null;
  const imageFile = formData.get('image') as File | null;
  if (imageFile && imageFile.size > 0) {
    imagePath = await uploadImage(imageFile);
  }

  const newReport = await createReportRepo({
    reportId: `LF-${Date.now().toString().slice(-6)}`,
    reportType,
    title,
    description,
    category,
    location,
    eventDate,
    reporterName,
    reporterContact,
    imagePath,
    status: 'SUBMITTED',
  });

  // Run matching engine asynchronously
  triggerMatching(newReport.id).catch(console.error);

  return newReport;
}
