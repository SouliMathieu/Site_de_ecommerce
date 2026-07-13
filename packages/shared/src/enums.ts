// ==========================================
// Énumérations partagées pour toute la plateforme
// ==========================================

/** Rôles utilisateur */
export enum UserRole {
  VENDOR = 'VENDOR',
  DELIVERY = 'DELIVERY',
  ADMIN = 'ADMIN',
}

/** Statut d'une commande */
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

/** Statut de paiement */
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

/** Mode de paiement */
export enum PaymentMethod {
  CASH = 'CASH',
  ORANGE_MONEY = 'ORANGE_MONEY',
  WAVE = 'WAVE',
  FREE_MONEY = 'FREE_MONEY',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

/** Statut d'un produit */
export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

/** Catégorie de produit */
export enum ProductCategory {
  ELECTRONICS = 'ELECTRONICS',
  FASHION = 'FASHION',
  HOME = 'HOME',
  BEAUTY = 'BEAUTY',
  FOOD = 'FOOD',
  SPORTS = 'SPORTS',
  BOOKS = 'BOOKS',
  OTHER = 'OTHER',
}

/** Format d'export d'image */
export enum ImageFormat {
  SQUARE_1_1 = 'SQUARE_1_1',
  VERTICAL_9_16 = 'VERTICAL_9_16',
  ORIGINAL = 'ORIGINAL',
}

/** Statut de traitement IA */
export enum AIProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/** Type de média */
export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

/** Étape de négociation chatbot */
export enum NegotiationStep {
  NONE = 'NONE',
  GREETING = 'GREETING',
  FAQ = 'FAQ',
  PRICE_ANNOUNCEMENT = 'PRICE_ANNOUNCEMENT',
  TIER_1 = 'TIER_1',
  TIER_2 = 'TIER_2',
  TIER_3 = 'TIER_3',
  ORDER_COLLECTION = 'ORDER_COLLECTION',
  CONFIRMATION = 'CONFIRMATION',
  CLOSED = 'CLOSED',
}

/** Statut de livraison */
export enum DeliveryStatus {
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RETURNED = 'RETURNED',
}

/** Type de notification */
export enum NotificationType {
  NEW_ORDER = 'NEW_ORDER',
  ORDER_STATUS = 'ORDER_STATUS',
  DELIVERY_UPDATE = 'DELIVERY_UPDATE',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  STOCK_ALERT = 'STOCK_ALERT',
  SYSTEM = 'SYSTEM',
}