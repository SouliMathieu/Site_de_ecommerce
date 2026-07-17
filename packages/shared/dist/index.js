"use strict";
// Unions de littéraux (et non des `enum` TS) pour rester structurellement compatibles
// avec les types d'énumération générés par Prisma côté API, sans conversion nécessaire.
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.DeliveryStatus = exports.OrderStatus = exports.ProductStatus = exports.UserRole = void 0;
exports.UserRole = { ADMIN: 'ADMIN', VENDEUR: 'VENDEUR' };
exports.ProductStatus = { ACTIF: 'ACTIF', BROUILLON: 'BROUILLON', ARCHIVE: 'ARCHIVE' };
exports.OrderStatus = { EN_ATTENTE: 'EN_ATTENTE', CONFIRMEE: 'CONFIRMEE', ANNULEE: 'ANNULEE' };
exports.DeliveryStatus = {
    EN_ATTENTE: 'EN_ATTENTE',
    EN_COURS: 'EN_COURS',
    LIVRE: 'LIVRE',
    ECHEC: 'ECHEC',
};
exports.NotificationType = {
    NOUVELLE_COMMANDE: 'NOUVELLE_COMMANDE',
    LIVRAISON_MISE_A_JOUR: 'LIVRAISON_MISE_A_JOUR',
    SYSTEME: 'SYSTEME',
};
