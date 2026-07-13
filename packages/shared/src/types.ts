// ==========================================
// Types partagés pour toute la plateforme
// ==========================================
import {
  UserRole,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ProductStatus,
  ProductCategory,
  ImageFormat,
  AIProcessingStatus,
  MediaType,
  NegotiationStep,
  DeliveryStatus,
  NotificationType,
} from './enums';

// ========== AUTH ==========
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  storeName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  storeName?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ========== PRODUITS ==========
export interface Product {
  id: string;
  vendorId: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  minPrice?: number;
  stock: number;
  status: ProductStatus;
  category: ProductCategory;
  tags: string[];
  images: Media[];
  videos?: Media[];
  aiDescription?: string;
  aiCopywriting?: string;
  features: string[];
  benefits: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  minPrice?: number;
  stock: number;
  category: ProductCategory;
  tags?: string[];
  features?: string[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

export interface ProductFilters {
  category?: ProductCategory;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'createdAt' | 'name' | 'sales';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========== MÉDIAS ==========
export interface Media {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: MediaType;
  format: ImageFormat;
  alt?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  processingStatus?: AIProcessingStatus;
  createdAt: string;
}

// ========== COMMANDES ==========
export interface Order {
  id: string;
  orderNumber: string;
  vendorId: string;
  customerId: string;
  customer: Customer;
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  deliveryFee: number;
  finalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  negotiationStep?: NegotiationStep;
  notes?: string;
  delivery?: Delivery;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateOrderRequest {
  customerId: string;
  items: { productId: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  deliveryAddress: string;
  notes?: string;
}

// ========== CLIENTS ==========
export interface Customer {
  id: string;
  name: string;
  phone: string;
  city?: string;
  district?: string;
  address?: string;
  whatsappConversationId?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

// ========== LIVREURS ==========
export interface Delivery {
  id: string;
  orderId: string;
  deliveryPersonId?: string;
  deliveryPerson?: DeliveryPerson;
  status: DeliveryStatus;
  pickupAddress?: string;
  deliveryAddress: string;
  gpsCoordinates?: string;
  estimatedDeliveryDate?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  trackingUrl?: string;
  notes?: string;
}

export interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  email?: string;
  zones: string[];
  isAvailable: boolean;
  currentLoad: number;
  maxLoad: number;
  successRate: number;
  averageDeliveryTime: number;
  performanceScore: number;
  createdAt: string;
}

// ========== NÉGOCIATION ==========
export interface NegotiationTier {
  id: string;
  name: string;
  type: 'discount' | 'upsell' | 'free_shipping';
  value: number;
  description: string;
}

export interface NegotiationState {
  conversationId: string;
  productId: string;
  customerId: string;
  currentStep: NegotiationStep;
  appliedTiers: NegotiationTier[];
  originalPrice: number;
  currentPrice: number;
  floorPrice: number;
  messages: ChatMessage[];
  startedAt: string;
  lastActivity: string;
}

// ========== CHAT ==========
export interface ChatMessage {
  id: string;
  role: 'customer' | 'bot' | 'vendor';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ========== NOTIFICATIONS ==========
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

// ========== STATISTIQUES ==========
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  conversionRate: number;
  averageOrderValue: number;
  topProducts: Product[];
  ordersByStatus: Record<OrderStatus, number>;
  revenueByDay: { date: string; amount: number }[];
  recentOrders: Order[];
}

// ========== API ==========
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface WebSocketEvent {
  type: string;
  payload: unknown;
  timestamp: string;
}