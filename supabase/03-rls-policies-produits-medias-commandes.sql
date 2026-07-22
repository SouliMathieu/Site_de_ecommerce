-- À exécuter dans Supabase SQL Editor (contexte : schéma "mathieu").
-- Idempotent-friendly : si une policy du même nom existe déjà, supprime-la d'abord
-- avec `drop policy if exists "..." on mathieu.produits;` avant de relancer.

alter table mathieu.produits enable row level security;
alter table mathieu.medias enable row level security;
alter table mathieu.commandes enable row level security;

-- PRODUITS : un vendeur gère uniquement ses propres produits.
create policy "produits: select proprietaire"
on mathieu.produits for select
to authenticated
using ( vendeur_id = auth.uid() );

create policy "produits: insert proprietaire"
on mathieu.produits for insert
to authenticated
with check ( vendeur_id = auth.uid() );

create policy "produits: update proprietaire"
on mathieu.produits for update
to authenticated
using ( vendeur_id = auth.uid() )
with check ( vendeur_id = auth.uid() );

create policy "produits: delete proprietaire"
on mathieu.produits for delete
to authenticated
using ( vendeur_id = auth.uid() );

-- MEDIAS : accès via le produit parent (medias n'a pas de vendeur_id direct).
create policy "medias: select via produit"
on mathieu.medias for select
to authenticated
using (
  exists (
    select 1 from mathieu.produits
    where produits.id = medias.produit_id
    and produits.vendeur_id = auth.uid()
  )
);

create policy "medias: insert via produit"
on mathieu.medias for insert
to authenticated
with check (
  exists (
    select 1 from mathieu.produits
    where produits.id = medias.produit_id
    and produits.vendeur_id = auth.uid()
  )
);

create policy "medias: delete via produit"
on mathieu.medias for delete
to authenticated
using (
  exists (
    select 1 from mathieu.produits
    where produits.id = medias.produit_id
    and produits.vendeur_id = auth.uid()
  )
);

-- COMMANDES : accès via le produit commandé (commandes n'a pas de vendeur_id direct).
-- C'est CETTE policy qui sécurise aussi le Realtime de la cloche de notifications.
create policy "commandes: select via produit"
on mathieu.commandes for select
to authenticated
using (
  exists (
    select 1 from mathieu.produits
    where produits.id = commandes.produit_id
    and produits.vendeur_id = auth.uid()
  )
);

create policy "commandes: update via produit"
on mathieu.commandes for update
to authenticated
using (
  exists (
    select 1 from mathieu.produits
    where produits.id = commandes.produit_id
    and produits.vendeur_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from mathieu.produits
    where produits.id = commandes.produit_id
    and produits.vendeur_id = auth.uid()
  )
);

-- CLIENTS et LIVREURS restent volontairement lisibles par tout vendeur authentifié
-- (répertoires partagés : un client/livreur peut être commun à plusieurs vendeurs).
alter table mathieu.clients enable row level security;
alter table mathieu.livreurs enable row level security;

create policy "clients: lecture vendeurs authentifies"
on mathieu.clients for select
to authenticated
using ( true );

create policy "livreurs: lecture vendeurs authentifies"
on mathieu.livreurs for select
to authenticated
using ( true );