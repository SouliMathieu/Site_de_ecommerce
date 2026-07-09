'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, PenLine, Plus, Trash2 } from 'lucide-react';
import type { ProductDto } from '@vente/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { EmptyState } from '@/components/dashboard/empty-state';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import { ProductFormDialog, type ProductFormValues } from '@/components/dashboard/product-form-dialog';
import { apiFetch, ApiError, resolveMediaUrl } from '@/lib/api-client';
import { formatMoney } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const STATUS_VARIANT: Record<ProductDto['status'], 'success' | 'secondary' | 'outline'> = {
  ACTIF: 'success',
  BROUILLON: 'secondary',
  ARCHIVE: 'outline',
};

const STATUS_LABEL: Record<ProductDto['status'], string> = {
  ACTIF: 'Actif',
  BROUILLON: 'Brouillon',
  ARCHIVE: 'Archivé',
};

export default function CataloguePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const currency = user?.currency ?? 'XOF';

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<ProductDto | null>(null);
  const [deletingProduct, setDeletingProduct] = React.useState<ProductDto | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiFetch<ProductDto[]>('/products'),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['products'] });

  const createMutation = useMutation({
    mutationFn: (values: ProductFormValues) => apiFetch<ProductDto>('/products', { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
      toast({ title: 'Produit créé', description: 'Le produit a été ajouté au catalogue.' });
    },
    onError: (error) => toast({ variant: 'destructive', title: 'Erreur', description: error instanceof ApiError ? error.message : 'Réessayez.' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ProductFormValues }) =>
      apiFetch<ProductDto>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(values) }),
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
      setEditingProduct(null);
      toast({ title: 'Produit mis à jour' });
    },
    onError: (error) => toast({ variant: 'destructive', title: 'Erreur', description: error instanceof ApiError ? error.message : 'Réessayez.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      invalidate();
      setDeletingProduct(null);
      toast({ title: 'Produit supprimé' });
    },
    onError: (error) => toast({ variant: 'destructive', title: 'Erreur', description: error instanceof ApiError ? error.message : 'Réessayez.' }),
  });

  const openCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEdit = (product: ProductDto) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Catalogue</h1>
          <p className="text-sm text-muted-foreground">Gérez les produits de votre boutique.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nouveau produit
        </Button>
      </div>

      {isLoading && <Skeleton className="h-64 w-full" />}

      {!isLoading && products.length === 0 && (
        <EmptyState
          icon={Package}
          title="Aucun produit pour le moment"
          description="Ajoutez votre premier produit pour commencer à vendre."
          action={
            <Button onClick={openCreate} size="sm">
              <Plus className="h-4 w-4" />
              Ajouter un produit
            </Button>
          }
        />
      )}

      {!isLoading && products.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolveMediaUrl(product.images[0])}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-md border border-border object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
                        <Package className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.description && (
                        <p className="line-clamp-1 text-xs text-muted-foreground">{product.description}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{formatMoney(product.price, currency)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[product.status]}>{STATUS_LABEL[product.status]}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(product)} aria-label="Modifier">
                      <PenLine className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingProduct(product)}
                      aria-label="Supprimer"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={(values) =>
          editingProduct
            ? updateMutation.mutate({ id: editingProduct.id, values })
            : createMutation.mutate(values)
        }
      />

      <ConfirmDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        title="Supprimer ce produit ?"
        description={`"${deletingProduct?.name}" sera définitivement supprimé de votre catalogue.`}
        confirmLabel="Supprimer"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deletingProduct && deleteMutation.mutate(deletingProduct.id)}
      />
    </div>
  );
}
