import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  price: z.number().positive('Le prix doit être positif'),
  comparePrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  minPrice: z.number().positive().optional(),
  stock: z.number().int().min(0, 'Le stock ne peut pas être négatif').default(0),
  category: z.string().default('OTHER'),
  tags: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string(),
  status: z.string().optional(),
});

export const productFiltersSchema = z.object({
  category: z.string().optional(),
  status: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['price', 'createdAt', 'name', 'sales']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;