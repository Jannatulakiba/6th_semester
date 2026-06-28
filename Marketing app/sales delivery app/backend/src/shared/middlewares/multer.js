import multer from 'multer';
import { ALLOWED_FILE_TYPES, FILE_LIMITS } from '../constants/index.js';

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const extname = ALLOWED_FILE_TYPES.test(file.originalname.toLowerCase());
  const mimetype = ALLOWED_FILE_TYPES.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
  }
};

export const productUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: FILE_LIMITS.PRODUCT_IMAGE_SIZE },
});

export const profileUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: FILE_LIMITS.PROFILE_PHOTO_SIZE },
});

export default productUpload;
