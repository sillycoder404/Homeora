import multer from 'multer';
import { ApiError } from './errorHandler';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

export const propertyUpload = multer({
  storage: multer.memoryStorage(),
  // Four compressed uploads must fit under Vercel's 4.5 MB request limit.
  limits: { fileSize: 1024 * 1024, files: 4 },
  fileFilter: (_req, file, callback) => {
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new ApiError(400, 'Only JPG, PNG and WebP images are allowed'));
    }
  },
});
