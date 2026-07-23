# Plateforme de Vente Intelligente

Plateforme e-commerce collaborative : Social Commerce · WhatsApp Bot · Logistique Automatisée.

## Stack technique
- Next.js 16 (App Router, TypeScript, Tailwind CSS)
- Supabase (PostgreSQL, Auth, Storage, Realtime)
- pnpm

## Démarrage rapide

\`\`\`bash
pnpm install
cp .env.example .env.local   # puis renseigner tes clés Supabase
pnpm dev
\`\`\`

Ouvre [http://localhost:3000](http://localhost:3000).

## Documentation
Voir [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) pour l'organisation du code, le schéma de base de données et les conventions de branches Git.

## Workflow d'équipe
Chaque développeur implémente chaque phase indépendamment sur sa branche \`phaseX/prenom\`. À la fin de chaque phase, l'équipe compare les 3 implémentations et fusionne le meilleur dans \`main\` avant de passer à la phase suivante.