export declare const UserRole: {
    readonly ADMIN: "ADMIN";
    readonly VENDEUR: "VENDEUR";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export declare const ProductStatus: {
    readonly ACTIF: "ACTIF";
    readonly BROUILLON: "BROUILLON";
    readonly ARCHIVE: "ARCHIVE";
};
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];
export declare const OrderStatus: {
    readonly EN_ATTENTE: "EN_ATTENTE";
    readonly CONFIRMEE: "CONFIRMEE";
    readonly ANNULEE: "ANNULEE";
};
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
export declare const DeliveryStatus: {
    readonly EN_ATTENTE: "EN_ATTENTE";
    readonly EN_COURS: "EN_COURS";
    readonly LIVRE: "LIVRE";
    readonly ECHEC: "ECHEC";
};
export type DeliveryStatus = (typeof DeliveryStatus)[keyof typeof DeliveryStatus];
export declare const NotificationType: {
    readonly NOUVELLE_COMMANDE: "NOUVELLE_COMMANDE";
    readonly LIVRAISON_MISE_A_JOUR: "LIVRAISON_MISE_A_JOUR";
    readonly SYSTEME: "SYSTEME";
};
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
export interface UserDto {
    id: string;
    email: string;
    name: string;
    role: UserRole;
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
    product?: {
        id: string;
        name: string;
    };
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
    order?: {
        customerName: string;
        customerPhone: string;
        address: string;
        total: number;
    };
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
    topProducts: {
        productId: string;
        name: string;
        sales: number;
    }[];
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
