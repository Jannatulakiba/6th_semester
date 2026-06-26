export const BCRYPT_SALT_ROUNDS = 10;

export const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived Access Token (15 minutes)
export const REFRESH_TOKEN_EXPIRY = '7d';  // Long-lived Refresh Token (7 days)

export const FILE_LIMITS = {
  PRODUCT_IMAGE_SIZE: 10 * 1024 * 1024,  // 10MB
  PROFILE_PHOTO_SIZE: 5 * 1024 * 1024,   // 5MB
};

export const CLOUDINARY_FOLDERS = {
  PRODUCTS: 'cloth_delivery/products',
  PROFILES: 'cloth_delivery/profiles',
};

export const ALLOWED_FILE_TYPES = /jpeg|jpg|png|gif|webp/;

export const PASSWORD = {
  MIN_LENGTH: 8,
  UPPERCASE_REGEX: /[A-Z]/,
  NUMBER_REGEX: /[0-9]/,
  SPECIAL_REGEX: /[!@#$%^&*(),.?":{}|<>]/,
};

export const RATING = {
  MIN: 1,
  MAX: 5,
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL: 500,
};
