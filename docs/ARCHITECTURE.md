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
