// Unions de littéraux (et non des `enum` TS) pour rester structurellement compatibles
// avec les types d'énumération générés par Prisma côté API, sans conversion nécessaire.

export const UserRole = { ADMIN: 'ADMIN', VENDEUR: 'VENDEUR' } as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ProductStatus = { ACTIF: 'ACTIF', BROUILLON: 'BROUILLON', ARCHIVE: 'ARCHIVE' } as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const OrderStatus = { EN_ATTENTE: 'EN_ATTENTE', CONFIRMEE: 'CONFIRMEE', ANNULEE: 'ANNULEE' } as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const DeliveryStatus = {
  EN_ATTENTE: 'EN_ATTENTE',
  EN_COURS: 'EN_COURS',
  LIVRE: 'LIVRE',
  ECHEC: 'ECHEC',
} as const;
export type DeliveryStatus = (typeof DeliveryStatus)[keyof typeof DeliveryStatus];

export const NotificationType = {
  NOUVELLE_COMMANDE: 'NOUVELLE_COMMANDE',
  LIVRAISON_MISE_A_JOUR: 'LIVRAISON_MISE_A_JOUR',
  SYSTEME: 'SYSTEME',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const SUPPORTED_CURRENCIES = [
  { code: 'XOF', label: 'Franc CFA (UEMOA) — XOF' },
  { code: 'XAF', label: 'Franc CFA (CEMAC) — XAF' },
  { code: 'MAD', label: 'Dirham marocain — MAD' },
  { code: 'DZD', label: 'Dinar algérien — DZD' },
  { code: 'TND', label: 'Dinar tunisien — TND' },
  { code: 'EGP', label: 'Livre égyptienne — EGP' },
  { code: 'NGN', label: 'Naira nigérian — NGN' },
  { code: 'GHS', label: 'Cedi ghanéen — GHS' },
  { code: 'USD', label: 'Dollar américain — USD' },
  { code: 'EUR', label: 'Euro — EUR' },
  { code: 'GBP', label: 'Livre sterling — GBP' },
  { code: 'CAD', label: 'Dollar canadien — CAD' },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]['code'];
export const SUPPORTED_CURRENCY_CODES = SUPPORTED_CURRENCIES.map((c) => c.code);

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  currency: string;
  createdAt: string;
}

export interface ProductDto {
  id: string;
  vendorId: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemDto {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: { id: string; name: string };
}

export interface OrderDto {
  id: string;
  vendorId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItemDto[];
  delivery: DeliveryDto | null;
}

export interface DeliveryDto {
  id: string;
  orderId: string;
  driverName: string | null;
  driverPhone: string | null;
  zone: string | null;
  status: DeliveryStatus;
  updatedAt: string;
  order?: { customerName: string; customerPhone: string; address: string; total: number };
}

export interface NotificationDto {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface StatsOverviewDto {
  revenue: number;
  ordersCount: number;
  conversionRate: number;
  productsCount: number;
  deliveredCount: number;
  topProducts: { productId: string; name: string; sales: number }[];
}

export interface AuthTokensDto {
  accessToken: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
