/**
 * Application-wide constants.
 * Centralizes magic strings and configuration values.
 */

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://cloth-delivery-app.vercel.app';


// ── API Endpoints ──────────────────────────────────────────────────────────────
export const API_ENDPOINTS = Object.freeze({
  AUTH: {
    ADMIN_LOGIN: '/api/user/admin',
  },
  PRODUCT: {
    ADD: '/api/product/add',
    LIST: '/api/product/list',
    REMOVE: '/api/product/remove',
  },
  ORDER: {
    LIST: '/api/order/list',
    STATUS: '/api/order/status',
  },
});

// ── Product Form Options ───────────────────────────────────────────────────────
export const PRODUCT_CATEGORIES = Object.freeze(['Men', 'Women', 'Kids']);

export const PRODUCT_SUB_CATEGORIES = Object.freeze([
  'Topwear',
  'Bottomwear',
  'Winterwear',
]);

export const PRODUCT_SIZES = Object.freeze(['S', 'M', 'L', 'XL', 'XXL']);

export const MAX_PRODUCT_IMAGES = 4;

// ── Order Statuses ─────────────────────────────────────────────────────────────
export const ORDER_STATUSES = Object.freeze([
  'Order Placed',
  'Packing',
  'Shipped',
  'Out for delivery',
  'Delivered',
]);

// ── Local Storage Keys ─────────────────────────────────────────────────────────
export const STORAGE_KEYS = Object.freeze({
  TOKEN: 'token',
});
