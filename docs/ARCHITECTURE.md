# Architecture du projet — Plateforme de Vente Intelligente

Ce document explique l'organisation du code source. Il doit être lu par toute personne rejoignant le projet.

## Stack technique (Phase 1)

- **Framework** : Next.js 16 (App Router, TypeScript)
- **Styling** : Tailwind CSS
- **Backend** : API Routes Next.js (src/app/api/)
- **Base de données / Auth / Storage** : Supabase (à configurer en étape 2)
- **Gestionnaire de paquets** : pnpm

## Structure des dossiers

\\\
src/
├── app/                    # Routes Next.js (App Router)
│   ├── (dashboard)/        # Pages du dashboard vendeur (route group, pas de préfixe d'URL)
│   └── api/                # Routes API backend
├── modules/                # Logique métier par module du cahier des charges
│   ├── catalogue/          # Module B — gestion produits, vitrine
│   ├── commandes/          # Module B/C — commandes clients
│   ├── ia-studio/          # Module A — génération visuels + copywriting IA
│   ├── whatsapp-bot/       # Module C — chatbot WhatsApp + négociation
│   └── logistique/         # Module D — dispatch livreurs, tracking
├── components/
│   ├── ui/                 # Composants réutilisables (boutons, inputs, cards...)
│   ├── layout/              # Sidebar, header, navigation du dashboard
│   └── dashboard/           # Composants spécifiques aux pages dashboard
├── lib/                     # Utilitaires partagés (client Supabase, helpers...)
└── types/                   # Types TypeScript partagés
\\\

## Convention de branches Git

- \main\ : code stable, validé collectivement à la fin de chaque phase
- \phaseX/prenom\ : travail individuel pendant une phase (X = numéro de phase)
- À la fin de chaque phase : comparaison des 3 implémentations, fusion du meilleur dans \main\ via Pull Request

## Historique des décisions

| Date | Décision | Raison |
|------|----------|--------|
| 2026-07-03 | Next.js full-stack + Supabase (plutôt qu'API séparée Node/Python) | Minimise l'infrastructure à gérer par 3 devs en 16 semaines ; Supabase fournit BDD/Auth/Storage/Realtime prêts à l'emploi |

## État d'avancement — Phase 1 (terminée)

### Fonctionnalités livrées
- Authentification vendeur complète (inscription, connexion, déconnexion) via Supabase Auth
- Trigger BDD créant automatiquement un profil vendeur à l'inscription
- Row Level Security (RLS) sur `produits` et `profils_vendeurs`
- Dashboard vendeur avec 5 pages : Vue d'ensemble, Catalogue, Commandes, Analytics, Paramètres
- Module Statistiques connecté aux vraies données (chiffre d'affaires, nombre de commandes, top produits)
- Notifications temps réel (Supabase Realtime) sur les nouvelles commandes

### Schéma de base de données (schema `mathieu`)
- `produits` : catalogue vendeur (avec `prix_plancher` anticipant la négociation Phase 4)
- `medias` : photos/vidéos liées aux produits
- `clients` : acheteurs finaux
- `livreurs` : répertoire livreurs (zones GeoJSON anticipant la Phase 5)
- `commandes` : commandes avec statuts (nouvelle → confirmee → dispatchee → recuperee → livree/echouee/annulee)
- `stats_evenements` : événements bruts pour analytics futures
- `profils_vendeurs` : extension de `auth.users` avec infos métier

### Comment lancer le projet en local
1. `pnpm install`
2. Copier `.env.example` vers `.env.local` et renseigner tes propres clés Supabase + ton schema personnel
3. `pnpm dev`
4. Aller sur `http://localhost:3000/register` pour créer un compte de test

### Points en attente pour la comparaison d'équipe
- Design/UI encore basique (Tailwind par défaut) — une passe de design est prévue après comparaison des 3 implémentations
- RLS pas encore posée sur `commandes`, `clients`, `livreurs`, `medias`, `stats_evenements` (à affiner selon la logique métier des phases suivantes)
