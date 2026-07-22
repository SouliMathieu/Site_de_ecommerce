-- ÉTAPE 1 — à exécuter en premier, avant toute autre policy.
--
-- Deux choses sont nécessaires pour que le schéma "mathieu" soit utilisable
-- depuis supabase-js, et elles sont indépendantes l'une de l'autre :
--
-- 1) Exposer le schéma à l'API (Project Settings → Data API → Exposed schemas
--    → cocher "mathieu" en plus de "public"). Ne peut PAS se faire en SQL,
--    c'est un réglage du dashboard Supabase.
--
-- 2) Accorder les droits SQL sur les objets du schéma (ci-dessous). RLS filtre
--    les LIGNES ; ces GRANT autorisent l'accès à la TABLE en premier lieu.
--    Sans ça, chaque requête échoue avec "permission denied" même si les
--    policies RLS sont correctes.

grant usage on schema mathieu to anon, authenticated, service_role;

grant all on all tables in schema mathieu to anon, authenticated, service_role;
grant all on all sequences in schema mathieu to anon, authenticated, service_role;
grant all on all routines in schema mathieu to anon, authenticated, service_role;

-- Pour que les tables créées plus tard dans ce schéma héritent aussi de ces
-- droits automatiquement (utile pour les futures phases).
alter default privileges in schema mathieu grant all on tables to anon, authenticated, service_role;
alter default privileges in schema mathieu grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema mathieu grant all on routines to anon, authenticated, service_role;