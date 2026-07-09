#!/usr/bin/env bash
# Initialise un dépôt Git PROPRE AU PROJET (isolé du reste de ta machine)
# et le pousse vers un dépôt GitHub vide que tu as créé au préalable.
#
# Utilisation :
#   1. Crée un dépôt VIDE sur https://github.com/new
#      (ne coche NI "Add README" NI "Add .gitignore" NI "Add license")
#   2. Édite la variable REPO_URL ci-dessous avec l'URL de ce dépôt
#   3. Depuis ce dossier : bash push-to-github.sh
set -euo pipefail

REPO_URL="https://github.com/TON-COMPTE/NOM-DU-REPO.git"
BRANCH="mohamedkafando185-blip-patch-1"

if [[ "$REPO_URL" == *"TON-COMPTE"* ]]; then
  echo "Édite REPO_URL dans ce script avec l'URL de ton dépôt GitHub avant de le lancer." >&2
  exit 1
fi

# Sécurité : s'assurer qu'on est bien dans le dossier du projet (pas dans un
# dossier parent qui aurait son propre .git, ex: le dossier utilisateur).
if [[ ! -f "docker-compose.yml" || ! -f "README.md" ]]; then
  echo "Lance ce script depuis la racine du projet vente-intelligente." >&2
  exit 1
fi

# Initialise un dépôt Git local à CE dossier uniquement.
if [[ ! -d ".git" ]]; then
  git init
  git branch -m "$BRANCH"
fi

# Garde-fou : ne jamais committer le .env réel (contient des secrets).
if git check-ignore -q .env; then
  echo ".env correctement ignoré."
else
  echo "ATTENTION : .env n'est pas ignoré par .gitignore — abandon par sécurité." >&2
  exit 1
fi

git add .

# N'affiche que ce qui sera committé, pour vérification rapide avant le commit.
echo "--- Fichiers qui seront committés ---"
git status --short
echo "--------------------------------------"

git commit -m "Phase 1 : fondations (auth, dashboard, Docker) + photos produits et multi-devises"

git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"
git push -u origin "$BRANCH"

echo "Poussé avec succès vers $REPO_URL"
