-- ÉTAPE 4 — policies d'écriture manquantes sur les répertoires partagés.
--
-- clients et livreurs n'ont pas de colonne vendeur_id (ce sont des répertoires
-- partagés entre tous les vendeurs de la plateforme, cf. 03-rls-policies...).
-- Le fichier 03 ne couvrait que la lecture ; ces policies ajoutent la
-- création et la modification, nécessaires aux modules Clients et Livraisons.
--
-- Choix volontairement permissif (`true`) pour la Phase 1 : n'importe quel
-- vendeur authentifié peut ajouter un client/livreur ou modifier sa fiche.
-- À restreindre plus tard si le produit a besoin d'un rattachement par vendeur.

create policy "clients: insert vendeurs authentifies"
on mathieu.clients for insert
to authenticated
with check ( true );

create policy "clients: update vendeurs authentifies"
on mathieu.clients for update
to authenticated
using ( true )
with check ( true );

create policy "livreurs: insert vendeurs authentifies"
on mathieu.livreurs for insert
to authenticated
with check ( true );

create policy "livreurs: update vendeurs authentifies"
on mathieu.livreurs for update
to authenticated
using ( true )
with check ( true );