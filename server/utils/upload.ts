import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

export async function uploadImage(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Validate file type
  const mimeType = file.type;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
  }

  // File size limit (e.g., 5MB)
  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error('File size exceeds 5MB limit.');
  }

  // Generate safe filename
  const ext = path.extname(file.name) || (mimeType === 'image/jpeg' ? '.jpg' : mimeType === 'image/png' ? '.png' : '.webp');
  const safeFilename = crypto.randomBytes(16).toString('hex') + ext;
  
  const uploadPath = path.join(/*turbopackIgnore: true*/ process.cwd(), UPLOAD_DIR);
  await fs.mkdir(uploadPath, { recursive: true });
  
  const filePath = path.join(/*turbopackIgnore: true*/ uploadPath, safeFilename);
  await fs.writeFile(filePath, buffer);
  
  return safeFilename;
}
