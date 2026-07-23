# Scripts SQL de configuration Supabase

Ces scripts configurent le projet Supabase pour la Phase 1 (schéma `mathieu`).
Ils ne sont **pas** appliqués automatiquement — copie-colle chaque fichier dans
Supabase → SQL Editor, dans l'ordre numéroté ci-dessous.

| # | Fichier | Fait quoi |
|---|---------|-----------|
| 1 | `01-grants-schema-mathieu.sql` | Autorise l'API à accéder au schéma `mathieu` (indispensable, sinon "permission denied" partout). Nécessite aussi d'exposer le schéma dans Project Settings → Data API → Exposed schemas (pas du SQL). |
| 2 | `02-storage-policies-produits.sql` | Policies du bucket Storage `produits` (upload/suppression restreints au vendeur propriétaire). Suppose que le bucket `produits` a déjà été créé manuellement (public, 5 Mo max, `image/jpeg,image/png,image/webp`). |
| 3 | `03-rls-policies-produits-medias-commandes.sql` | Active RLS et crée les policies de lecture/écriture sur `produits`, `medias`, `commandes`, et les policies de lecture sur `clients`/`livreurs`. |
| 4 | `04-rls-policies-clients-livreurs-write.sql` | Ajoute les policies d'écriture (création/modification) sur `clients` et `livreurs`, nécessaires aux modules Clients et Livraisons. |

Si tu relances un script et qu'une policy du même nom existe déjà, Postgres
renverra une erreur `policy "..." already exists` — dans ce cas, ajoute un
`drop policy if exists "nom exact" on mathieu.table;` juste avant la ligne en
question plutôt que de tout relancer.