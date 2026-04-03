# Plateforme de Vente Intelligente (Social Commerce)

Application web automatisée de e-commerce permettant aux vendeurs de gérer leur activité de A à Z : création de visuels par IA, vente via chatbot WhatsApp, et coordination automatisée des livraisons.

## Table des matières

- [Architecture globale](#architecture-globale)
- [Technologies utilisées](#technologies-utilisées)
- [Structure du projet (Monorepo)](#structure-du-projet-monorepo)
- [Configuration requise](#configuration-requise)
- [Variables d’environnement](#variables-denvironnement)
- [Installation et démarrage](#installation-et-démarrage)
  - [Avec Docker Compose (recommandé)](#avec-docker-compose-recommandé)
  - [Sans Docker (développement local)](#sans-docker-développement-local)
- [Tests](#tests)
- [CI / CD](#ci--cd)
- [Déploiement](#déploiement)
- [Contribution](#contribution)
- [Licence](#licence)

---

## Architecture globale

L’application suit une architecture **microservices** avec une **API Gateway** centralisée. Chaque service est indépendant, scalable et possède sa propre base de données logique (PostgreSQL partagée en développement, mais séparée en production).

┌─────────────────────────────────────────────────────────────┐\
│ Client (PWA) │\
│ (Next.js 14 / React) │\
└─────────────────────────────┬───────────────────────────────┘\
│ HTTPS\
┌─────────────────────────────▼───────────────────────────────┐\
│ API Gateway (Spring Cloud) │\
│ (Routage, Rate Limiting, Auth passthrough) │\
└─────────────┬─────────────────────┬─────────────────────────┘\
│ │\
┌─────────────▼──────────┐ ┌───────▼──────────┐ ┌─────────────┐\
│ Service Utilisateur │ │ Service Produit │ │ Service │\
│ (Auth, Clients, │ │ (Catalogue, │ │ Commande │\
│ Vendeurs, Livreurs) │ │ Stock, Médias) │ │ & Paiement │\
└─────────────┬──────────┘ └───────┬──────────┘ └───────┬─────┘\
│ │ │\
┌─────────────▼─────────────────────▼─────────────────────▼─────┐\
│ PostgreSQL + Redis │\
│ (données métier + cache / sessions) │\
└───────────────────────────────────────────────────────────────┘

**Services annexes (non représentés) :**
- Service IA (Python/FastAPI) – génération d’images et de textes
- Service Communication (WebSocket + WhatsApp)
- Service Logistique (dispatch livreurs, suivi)

---

## Technologies utilisées

| Couche               | Technologie(s)                                                                 |
|----------------------|--------------------------------------------------------------------------------|
| **Backend (API)**    | Java 21, Spring Boot 3, Spring Cloud Gateway, Spring Security, JWT, JPA/Hibernate |
| **Frontend (PWA)**   | Next.js 14 (React), Tailwind CSS, Redux Toolkit, PWA (Service Workers)         |
| **Base de données**  | PostgreSQL 16, Redis 7 (cache/sessions), Flyway (migrations)                  |
| **Stockage fichiers**| AWS S3 / Cloudflare R2 (compatible S3)                                         |
| **IA**               | Python 3.11, FastAPI, intégration OpenAI / Replicate / Stability AI           |
| **Communication**    | WebSocket (STOMP), API WhatsApp Business (Meta), RabbitMQ (async tasks)       |
| **DevOps**           | Docker, Docker Compose, GitHub Actions (CI/CD), Kubernetes (optionnel)        |
| **Monitoring**       | Prometheus, Grafana, ELK (logs)                                                |

---

## Structure du projet (Monorepo)

Le projet est organisé en un **monorepo** pour faciliter la gestion des versions et des dépendances.

social-commerce/\
├── .github/\
│   └── workflows/\
│       ├── ci.yml # Intégration continue (tests)\
│       └── cd.yml # Déploiement staging/prod\
├── backend/\
│   ├── api-gateway/ # Spring Cloud Gateway\
│   │   ├── src/\
│   │   ├── Dockerfile\
│   │   └── pom.xml\
│   ├── auth-service/ # Authentification, utilisateurs, rôles\
│   │   ├── src/\
│   │   ├── Dockerfile\
│   │   └── pom.xml\
│   ├── product-service/ # Gestion des produits, catalogue, médias\
│   │   ├── src/\
│   │   ├── Dockerfile\
│   │   └── pom.xml\
│   ├── order-service/ # Commandes, panier, transaction\
│   │   ├── src/\
│   │   ├── Dockerfile\
│   │   └── pom.xml\
│   ├── logistics-service/ # Livreurs, dispatching, suivi\
│   │   ├── src/\
│   │   ├── Dockerfile\
│   │   └── pom.xml\
│   ├── communication-service/ # WebSocket, WhatsApp, notifications\
│   │   ├── src/\
│   │   ├── Dockerfile\
│   │   └── pom.xml\
│   └── ai-service/ # Microservice Python (FastAPI)\
│       ├── app/\
│       ├── Dockerfile\
│       └── requirements.txt\
├── frontend/\
│   ├── dashboard-vendeur/ # Next.js (dashboard du vendeur)\
│   │   ├── public/\
│   │   ├── src/\
│   │   ├── Dockerfile\
│   │   ├── next.config.js\
│   │   └── package.json\
│   └── vitrine-client/ # Next.js (vitrine publique "one-click")\
│       ├── public/\
│       ├── src/\
│       ├── Dockerfile\
│       ├── next.config.js\
│       └── package.json\
├── scripts/\
│   ├── init-db.sql # Script d’initialisation PostgreSQL\
│   ├── seed-data.sql # Données de test (produits, vendeurs...)\
│   └── deploy.sh # Script de déploiement (optionnel)\
├── docker-compose.yml # Orchestration complète (tous services)\
├── docker-compose.dev.yml # Environnement de développement avec hot-reload\
├── .env.example # Exemple de variables d’environnement\
├── .gitignore # Fichiers ignorés par Git\
├── README.md # Ce fichier\
└── LICENSE\


### Détails des services backend

- **api-gateway** : point d’entrée unique (port 8080). Gère la sécurité (validation JWT), le rate limiting et la redirection vers les microservices.
- **auth-service** : port 8081. Gère l’inscription, connexion, rafraîchissement JWT, OAuth2 (Google/Facebook). Stocke les entités `User`, `Vendeur`, `Client`, `Livreur`.
- **product-service** : port 8082. CRUD produits, gestion des médias (upload vers S3), stock, catégories, recherche.
- **order-service** : port 8083. Panier, commandes, historique, gestion des statuts. Valide les stocks et les prix.
- **logistics-service** : port 8084. Livreurs, zones, affectation automatique, suivi des livraisons.
- **communication-service** : port 8085. WebSocket pour notifications en temps réel (dashboard vendeur). Également responsable de l’intégration WhatsApp (webhook, envoi de messages).
- **ai-service** : port 5000 (Python/FastAPI). Endpoints pour détourage d’image, génération de fonds, copywriting IA (OpenAI).

### Frontend

- **dashboard-vendeur** : Interface pour les vendeurs (gestion des produits, commandes, statistiques). Next.js avec `next-pwa` pour fonctionner comme PWA.
- **vitrine-client** : Boutique publique visible par les acheteurs (grille produits, fiche produit, bouton WhatsApp flottant). Également PWA.

---

## Configuration requise

- **Docker** 20.10+ et **Docker Compose** 2.0+ (recommandé)
- **Java** 21 (pour développement local sans Docker)
- **Node.js** 18+ et **npm** / **yarn**
- **Python** 3.11 (pour le service IA)
- **PostgreSQL** 16 (si exécution locale sans Docker)
- **Redis** 7 (idem)

---

## Variables d’environnement

Copiez le fichier `.env.example` à la racine et renommez-le en `.env`. Renseignez les valeurs sensibles.

```bash
# Exemple .env (à ne jamais committer)
# Base de données
DB_HOST=postgres
DB_PORT=5432
DB_NAME=socialcommerce
DB_USER=admin
DB_PASSWORD=supersecret

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=votre_cle_secrete_tres_longue
JWT_EXPIRATION=86400000   # 24h en ms

# OAuth2 (Google)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Stockage S3 (Cloudflare R2 ou AWS)
S3_ENDPOINT=https://xxx.r2.cloudflarestorage.com
S3_ACCESS_KEY=xxx
S3_SECRET_KEY=xxx
S3_BUCKET_NAME=socialcommerce-media

# API WhatsApp
WHATSAPP_ACCESS_TOKEN=EA...
WHATSAPP_PHONE_NUMBER_ID=123...
WHATSAPP_WEBHOOK_VERIFY_TOKEN=mon_token

# IA (OpenAI, Replicate)
OPENAI_API_KEY=sk-...
REPLICATE_API_TOKEN=r8_...
