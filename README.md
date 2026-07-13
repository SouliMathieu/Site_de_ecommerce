# 🚀 Plateforme de Vente Intelligente

**Social Commerce · WhatsApp Bot · Logistique Automatisée**

## 📋 Architecture

```
plateforme-vente/
├── packages/
│   ├── shared/          # Types, énumérations et constantes partagés
│   ├── backend/         # API REST (Fastify + Prisma + PostgreSQL)
│   └── frontend/        # Dashboard Vendeur (Next.js 14 + Tailwind CSS)
├── docker/              # Configuration Docker Compose
│   └── docker-compose.yml
└── docs/                # Documentation
```

## ✅ Phase 1 - Implémentée

- [x] **Base de données** : Schéma Prisma complet (Vendors, Produits, Commandes, Clients, Livreurs, Chat, Notifications)
- [x] **Authentification** : JWT + Refresh Tokens, inscription/connexion, gestion de profil
- [x] **API REST** : Fastify avec Swagger/OpenAPI (http://localhost:3001/docs)
- [x] **WebSocket** : Notifications en temps réel avec authentification
- [x] **Dashboard Vendeur** : Next.js 14 App Router, Tailwind CSS, layout responsive
- [x] **Statistiques** : API de tableau de bord (CA, conversion, top produits, revenus)
- [x] **Gestion Produits** : CRUD complet avec filtres, recherche, pagination
- [x] **Gestion Commandes** : Liste, détail, mise à jour de statut
- [x] **Notifications** : Système de notifications avec compteur non-lues
- [x] **Stockage** : PostgreSQL + Redis + MinIO (S3-compatible) via Docker
- [x] **Seed** : Données de test (vendeur, produits, clients, livreurs)

## 📦 Prérequis

- Node.js >= 18
- Docker Desktop (pour PostgreSQL, Redis, MinIO)
- npm >= 9

## 🚀 Installation et démarrage

```bash
# 1. Cloner le projet
cd plateforme-vente

# 2. Démarrer les services (PostgreSQL, Redis, MinIO)
docker-compose -f docker/docker-compose.yml up -d

# 3. Installer les dépendances
npm install

# 4. Générer le client Prisma
cd packages/backend
npx prisma generate
cd ../..

# 5. Exécuter les migrations
npm run db:migrate

# 6. Ajouter les données de test
npm run db:seed

# 7. Démarrer en développement
npm run dev
```

## 🔗 URLs

| Service | URL |
|---------|-----|
| Dashboard | http://localhost:3000 |
| API Documentation | http://localhost:3001/docs |
| API Health | http://localhost:3001/health |
| WebSocket | ws://localhost:3001/ws |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |
| MinIO Console | http://localhost:9001 |

## 🔑 Identifiants de test

- **Email** : vendeur@test.com
- **Mot de passe** : Test1234!

## 🛠️ Commandes utiles

```bash
# Développement
npm run dev              # Backend + Frontend simultanément
npm run dev:backend      # Backend uniquement
npm run dev:frontend     # Frontend uniquement

# Base de données
npm run db:migrate       # Exécuter les migrations
npm run db:seed          # Ajouter les données de test
npm run db:studio        # Ouvrir Prisma Studio
npm run db:push          # PUSH sans migration

# Build
npm run build            # Build complet
npm run build:shared     # Build shared uniquement
npm run build:backend    # Build backend uniquement
npm run build:frontend   # Build frontend uniquement
```

## 📁 Structure du Backend

```
packages/backend/src/
├── index.ts                # Point d'entrée du serveur
├── config/                 # Configuration (env)
├── middleware/
│   └── auth.ts             # Middleware JWT
├── modules/
│   ├── auth/               # Authentification (register, login, refresh)
│   ├── products/           # CRUD Produits
│   ├── orders/             # Gestion des commandes
│   ├── dashboard/          # Statistiques et KPIs
│   └── notifications/      # Système de notifications
├── plugins/
│   └── websocket.ts        # Plugin WebSocket temps réel
└── utils/
    ├── prisma.ts           # Client Prisma singleton
    ├── errors.ts           # Gestion des erreurs
    └── slugify.ts          # Utilitaire de slug
```

## 🔄 Prochaines Phases

- **Phase 2** : Module A - Studio Graphique IA + Générateur Copywriting
- **Phase 3** : Module B - Mini-Store PWA + Tunnel WhatsApp One-Click
- **Phase 4** : Module C - Chatbot WhatsApp + Moteur de Négociation
- **Phase 5** : Module D - Logistique + Tracking + Tests + Déploiement

## 📊 Routes API

### Auth
- `POST /api/v1/auth/register` - Inscription
- `POST /api/v1/auth/login` - Connexion
- `POST /api/v1/auth/refresh` - Rafraîchir token
- `POST /api/v1/auth/logout` - Déconnexion
- `GET /api/v1/auth/profile` - Profil
- `PATCH /api/v1/auth/profile` - Mise à jour profil

### Produits
- `GET /api/v1/products` - Liste (paginée, filtrable)
- `GET /api/v1/products/:id` - Détail
- `POST /api/v1/products` - Création
- `PATCH /api/v1/products/:id` - Mise à jour
- `DELETE /api/v1/products/:id` - Suppression

### Commandes
- `GET /api/v1/orders` - Liste
- `GET /api/v1/orders/:id` - Détail
- `PATCH /api/v1/orders/:id/status` - Statut

### Dashboard
- `GET /api/v1/dashboard/stats` - Statistiques
- `GET /api/v1/dashboard/recent-orders` - Dernières commandes
- `GET /api/v1/dashboard/top-products` - Top produits
- `GET /api/v1/dashboard/revenue` - Revenus

### Notifications
- `GET /api/v1/notifications` - Liste
- `PATCH /api/v1/notifications/:id/read` - Marquer comme lu
- `POST /api/v1/notifications/read-all` - Tout marquer comme lu

### Système
- `GET /health` - Health check
- `GET /docs` - Documentation Swagger
- `ws://host/ws` - WebSocket (authentifié)