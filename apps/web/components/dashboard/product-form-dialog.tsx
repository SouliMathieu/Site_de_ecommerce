'use client';

import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import type { ProductDto } from '@vente/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ImageUploader } from './image-uploader';
import { useAuth } from '@/lib/auth-context';

const schema = z.object({
  name: z.string().min(2, 'Le nom est trop court.'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Le prix doit être positif.'),
  stock: z.coerce.number().int().min(0, 'Le stock doit être positif.'),
  status: z.enum(['ACTIF', 'BROUILLON', 'ARCHIVE']),
  images: z.array(z.string()).max(6).default([]),
});

export type ProductFormValues = z.infer<typeof schema>;

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductDto | null;
  isSubmitting?: boolean;
  onSubmit: (values: ProductFormValues) => void;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  isSubmitting,
  onSubmit,
}: ProductFormDialogProps) {
  const { user } = useAuth();
  const currency = user?.currency ?? 'XOF';

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    values: product
      ? {
          name: product.name,
          description: product.description ?? '',
          price: product.price,
          stock: product.stock,
          status: product.status,
          images: product.images ?? [],
        }
      : { name: '', description: '', price: 0, stock: 0, status: 'BROUILLON', images: [] },
  });

  React.useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? 'Modifier le produit' : 'Nouveau produit'}</DialogTitle>
          <DialogDescription>
            {product ? 'Mettez à jour les informations du produit.' : 'Ajoutez un produit à votre catalogue.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du produit</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} />
          </div>
          <div className="space-y-2">
            <Label>Photos</Label>
            <Controller
              control={control}
              name="images"
              render={({ field }) => (
                <ImageUploader value={field.value} onChange={field.onChange} />
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix ({currency})</Label>
              <Input id="price" type="number" step="1" {...register('price')} />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" type="number" step="1" {...register('stock')} />
              {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select id="status" {...register('status')}>
              <option value="BROUILLON">Brouillon</option>
              <option value="ACTIF">Actif</option>
              <option value="ARCHIVE">Archivé</option>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {product ? 'Enregistrer' : 'Créer le produit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
