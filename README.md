# 🚀 Plateforme de Vente Intelligente

Plateforme e-commerce collaborative pour vendeurs africains et internationaux : Social Commerce · WhatsApp Bot · Logistique Automatisée. Chaque phase du projet est développée en parallèle par 3 développeurs sur leurs propres branches, puis comparée avant fusion dans `main` (détails dans "Workflow d'équipe" plus bas).

Cette branche contient l'implémentation Next.js + Supabase.

## Structure du repo

```
Site_de_ecommerce/
├── docs/
│   └── ARCHITECTURE.md      # Organisation détaillée du code, schéma BDD, historique des décisions
├── supabase/
│   ├── README.md            # Ordre d'exécution des scripts SQL ci-dessous
│   └── *.sql                # Scripts de setup (grants, RLS, Storage)
├── src/
│   ├── app/                 # Routes Next.js (App Router)
│   ├── components/          # ui/ (kit réutilisable), layout/ (sidebar, header), dashboard/ (composants métier)
│   ├── lib/                 # Client Supabase, helpers (format monétaire, stats...)
│   ├── types/                # Types TypeScript partagés
│   └── modules/              # Dossiers réservés aux futures phases (IA, WhatsApp bot, logistique)
├── .env.example              # Variables d'environnement à copier
└── README.md
```

## Installer le projet depuis le début

### Étape 1 : cloner le projet

Ouvre un terminal, place-toi dans le dossier de ton choix et tape :

```powershell
git clone https://github.com/SouliMathieu/Site_de_ecommerce.git
cd Site_de_ecommerce
git checkout phase1/mathieu
```

Un dossier `Site_de_ecommerce` apparaît, c'est ta copie locale du projet.

### Étape 2 : installer les dépendances

Le projet utilise `pnpm` comme gestionnaire de paquets (plus rapide et plus économe en espace disque que `npm`) :

```powershell
pnpm install
```

Ça télécharge toutes les dépendances listées dans `package.json` et crée un dossier `node_modules` (jamais commité, régénéré à chaque installation).

### Étape 3 : configurer Supabase

Le projet ne fonctionne pas "out of the box" — il a besoin d'un projet Supabase configuré avec les bonnes tables, le bon accès API et les bonnes règles de sécurité. Sans cette étape, l'app démarre mais aucune requête ne fonctionne.

1. **Récupère tes clés** dans Supabase → Project Settings → API, puis copie le fichier d'exemple :
   ```powershell
   cp .env.example .env.local
   ```
   Renseigne `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans `.env.local`.

2. **Expose le schéma `mathieu` à l'API** — Project Settings → Data API → Exposed schemas → coche `mathieu` en plus de `public`. C'est un piège classique : sans ça, chaque requête échoue avec *"table cannot be accessed via the Data API"*, même si tout le reste est correct.

3. **Lance les scripts SQL** du dossier `supabase/`, dans l'ordre numéroté (voir `supabase/README.md` pour le détail de chacun) : ouvre Supabase → SQL Editor et colle-copie chaque fichier, du `01-` au `04-`.

4. **Crée le bucket Storage** `produits` (Storage → New bucket) : public, 5 Mo max, types autorisés `image/jpeg,image/png,image/webp`. C'est là que sont stockées les photos produits.

### Étape 4 : lancer le projet

```powershell
pnpm dev
```

Ouvre [http://localhost:3000](http://localhost:3000). Crée un compte vendeur via la page d'inscription, tu arrives sur le dashboard.

## Fonctionnalités — Phase 1 (Fondations)

- [x] Authentification vendeur (inscription, connexion, déconnexion) via Supabase Auth, avec création automatique du profil vendeur (trigger BDD)
- [x] Dashboard responsive : sidebar desktop + tiroir mobile, menu utilisateur, notifications temps réel scopées par vendeur (Supabase Realtime)
- [x] Kit UI réutilisable : boutons, champs de formulaire, dialogues, tableaux, badges de statut, toasts, états vides
- [x] **Catalogue** : CRUD produits complet, upload de photos vers Supabase Storage
- [x] **Commandes** : liste avec recherche/filtres, changement de statut, assignation de livreur
- [x] **Clients** : répertoire avec historique de commandes et statistiques agrégées par client
- [x] **Livraisons** : répertoire des livreurs, suivi visuel (timeline) des livraisons en cours
- [x] **Vue d'ensemble** : chiffre d'affaires, nombre de commandes, top produits
- [x] Row Level Security (RLS) sur toutes les tables du schéma `mathieu`

## Schéma de base de données (schéma `mathieu`)

| Table | Rôle |
|-------|------|
| `profils_vendeurs` | Étend `auth.users` — nom de boutique, devise, rôle |
| `produits` | Catalogue vendeur (`prix_plancher` anticipe la négociation Phase 4) |
| `medias` | Photos liées aux produits, avec format d'export (`original`, `carre_1_1`, `story_9_16` — anticipe le Studio IA Phase 2) |
| `commandes` | Commandes clients, liées à un produit, un client et éventuellement un livreur |
| `clients` | Répertoire partagé entre vendeurs (un client peut acheter chez plusieurs boutiques) |
| `livreurs` | Répertoire partagé, zones de couverture, score de performance (anticipe le dispatch Phase 5) |
| `stats_evenements` | Réservée aux futures phases (tracking analytics) |

Détails complets des colonnes et des choix d'architecture : [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Prochaines phases

- **Phase 2** : Studio Graphique IA (détourage, in-painting) + Générateur Copywriting IA
- **Phase 3** : Mini-Store PWA + tunnel de conversion WhatsApp one-click
- **Phase 4** : Chatbot WhatsApp + moteur de négociation automatisée
- **Phase 5** : Dispatch logistique automatique + tracking temps réel + déploiement

## Workflow d'équipe

Chaque développeur implémente chaque phase indépendamment sur sa branche `phaseX/prenom`. À la fin de chaque phase, l'équipe compare les 3 implémentations et fusionne le meilleur (ou une combinaison) dans `main` avant de passer à la phase suivante.

*Bon développement !*