// ==========================================
// Constantes partagées pour toute la plateforme
// ==========================================

/** Configuration de l'application */
export const APP_CONFIG = {
  NAME: 'Plateforme de Vente Intelligente',
  VERSION: '1.0.0',
  DESCRIPTION: 'Social Commerce · WhatsApp Bot · Logistique Automatisée',
  CONTACT_EMAIL: 'contact@plateforme-vente.com',
} as const;

/** Configuration API */
export const API_CONFIG = {
  PREFIX: '/api/v1',
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },
  AUTH: {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
    BCRYPT_SALT_ROUNDS: 12,
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
} as const;

/** Configuration WhatsApp */
export const WHATSAPP_CONFIG = {
  API_VERSION: 'v21.0',
  BASE_URL: 'https://graph.facebook.com',
  MESSAGE_TEMPLATE_NAMESPACE: 'plateforme_vente_',
  NEGOTIATION: {
    SILENCE_TIMEOUT_MS: 3 * 60 * 1000, // 3 minutes
    TIER_1_DISCOUNT_MIN: 5,
    TIER_1_DISCOUNT_MAX: 10,
    TIER_2_BUY_X: 2,
    TIER_2_DISCOUNT_PERCENT: 50,
    TIER_3_FREE_SHIPPING: true,
  },
} as const;

/** Configuration IA */
export const AI_CONFIG = {
  IMAGE: {
    DETOURAGE_SERVICE: 'remove.bg',
    INPAINTING_SERVICE: 'replicate',
    MAX_IMAGE_SIZE_MB: 10,
    SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
    OUTPUT_FORMATS: ['image/png', 'image/webp'],
  },
  COPYWRITING: {
    MAX_TITLE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
    SUPPORTED_LANGUAGES: ['fr', 'en', 'ar'],
    DEFAULT_LANGUAGE: 'fr',
  },
} as const;

/** Configuration du Mini-Store */
export const MINISTORE_CONFIG = {
  PERFORMANCE: {
    TARGET_LOAD_TIME_MS: 2000,
    BUNDLE_MAX_SIZE_KB: 150,
    IMAGE_QUALITY: 80,
  },
  SEARCH: {
    MIN_CHARS_FOR_SUGGESTION: 2,
    DEBOUNCE_MS: 300,
    MAX_SUGGESTIONS: 8,
  },
  PWA: {
    APP_NAME: 'Ma Boutique',
    THEME_COLOR: '#25D366',
    BACKGROUND_COLOR: '#FFFFFF',
    DISPLAY: 'standalone',
    ORIENTATION: 'portrait',
  },
} as const;

/** Configuration logistique */
export const LOGISTICS_CONFIG = {
  DELIVERY: {
    MAX_LOAD_PER_PERSON: 20,
    DEFAULT_DISPATCH_TIMEOUT_MS: 5 * 60 * 1000, // 5 minutes
    SUCCESS_RATE_THRESHOLD: 0.85,
  },
  TRACKING: {
    STATUS_LINKS_EXPIRE_HOURS: 48,
    NOTIFICATION_REMINDER_MS: 30 * 60 * 1000, // 30 minutes
  },
} as const;

/** Messages WhatsApp pré-définis */
export const WHATSAPP_TEMPLATES = {
  ORDER_CONFIRMATION: (orderNumber: string, amount: number) =>
    `✅ *Confirmation de commande #${orderNumber}*\n\nMerci pour votre commande !\nMontant total : ${amount.toLocaleString()} FCFA\n\nNous vous contacterons dès que votre colis sera expédié.`,
  
  DELIVERY_NOTIFICATION: (deliveryPersonName: string, estimatedTime: string) =>
    `🚚 *Votre livreur est en route !*\n\n${deliveryPersonName} arrive dans environ ${estimatedTime}.\n\nPréparez votre paiement s'il vous plaît.`,
  
  NEGOTIATION_TIER_1: (discountedPrice: number, originalPrice: number) =>
    `🎁 *Offre Spéciale !*\n\nJe vous propose une remise exclusive :\n~~${originalPrice.toLocaleString()} FCFA~~ → *${discountedPrice.toLocaleString()} FCFA*\n\nCette offre est valable 30 minutes ⏰`,
  
  NEGOTIATION_TIER_2: () =>
    `🔥 *Offre Pack Découverte !*\n\nAchetez 2 articles et recevez le 3ème à -50% !\n\nFaites le plein et économisez encore plus 💰`,
  
  NEGOTIATION_TIER_3: () =>
    `🎉 *Livraison Offerte !*\n\nJe vous offre la livraison pour cette commande ✨\n\nC'est la meilleure offre que je puisse vous faire !`,
  
  INVOICE: (items: string, total: number, deliveryFee: number) =>
    `🧾 *FACTURETTE*\n\n${items}\n\n─────────────\nLivraison : ${deliveryFee.toLocaleString()} FCFA\n*Total : ${total.toLocaleString()} FCFA*\n\nConfirmez-vous cette commande ? ✅`,
} as const;

/** Routes API */
export const ROUTES = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  PRODUCTS: {
    BASE: '/products',
    BY_ID: '/products/:id',
    UPLOAD_IMAGE: '/products/:id/images',
    GENERATE_DESCRIPTION: '/products/:id/generate-description',
    GENERATE_IMAGE: '/products/:id/generate-image',
  },
  ORDERS: {
    BASE: '/orders',
    BY_ID: '/orders/:id',
    STATUS: '/orders/:id/status',
  },
  CUSTOMERS: {
    BASE: '/customers',
    BY_ID: '/customers/:id',
  },
  DELIVERY: {
    BASE: '/delivery',
    PERSONS: '/delivery/persons',
    PERSONS_BY_ID: '/delivery/persons/:id',
    ASSIGN: '/delivery/assign',
    STATUS: '/delivery/:id/status',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_ORDERS: '/dashboard/recent-orders',
    TOP_PRODUCTS: '/dashboard/top-products',
    REVENUE: '/dashboard/revenue',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/read-all',
  },
  WEBHOOKS: {
    WHATSAPP: '/webhooks/whatsapp',
  },
} as const;