-- À exécuter dans Supabase SQL Editor, après avoir créé le bucket "produits"
-- (public, 5MB, image/jpeg|png|webp).
--
-- Convention de chemin des fichiers : {vendeur_id}/{produit_id}/{filename}
-- Cela permet de restreindre l'écriture au propriétaire via le 1er segment du chemin.

-- Lecture : déjà publique de fait (bucket public), mais on l'explicite pour Storage API.
create policy "produits: lecture publique"
on storage.objects for select
using ( bucket_id = 'produits' );

-- Écriture : seul le vendeur propriétaire du dossier peut uploader.
create policy "produits: upload par le proprietaire"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'produits'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Suppression : idem, seul le propriétaire.
create policy "produits: suppression par le proprietaire"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'produits'
  and (storage.foldername(name))[1] = auth.uid()::text
);