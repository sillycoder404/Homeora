import multer from 'multer';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

export const propertyUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 4 },
  fileFilter: (_req, file, callback) => {
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Only JPG, PNG and WebP images are allowed'));
    }
  },
});
