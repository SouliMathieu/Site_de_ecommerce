import { FastifyInstance } from 'fastify';
import { prisma } from '../../utils/prisma.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { NotFoundError, handleError } from '../../utils/errors.js';
import { createProductSchema, updateProductSchema, productFiltersSchema } from './products.schema.js';
import slugify from '../../utils/slugify.js';

export async function productRoutes(app: FastifyInstance): Promise<void> {
  // Toutes les routes produits nécessitent une authentification
  app.addHook('preHandler', authenticate);

  // ==========================================
  // GET /products - Liste des produits
  // ==========================================
  app.get('/products', {
    schema: {
      tags: ['Produits'],
      description: 'Liste paginée des produits du vendeur',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20 },
          category: { type: 'string' },
          status: { type: 'string' },
          search: { type: 'string' },
          sortBy: { type: 'string', enum: ['price', 'createdAt', 'name', 'sales'] },
          sortOrder: { type: 'string', enum: ['asc', 'desc'] },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { id: vendorId } = (request as AuthenticatedRequest).user;
      const filters = productFiltersSchema.parse(request.query);

      const where: Record<string, unknown> = { vendorId };

      if (filters.category) where.category = filters.category;
      if (filters.status) where.status = filters.status;
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }
      if (filters.minPrice || filters.maxPrice) {
        where.price = {};
        if (filters.minPrice) (where.price as Record<string, number>).gte = filters.minPrice;
        if (filters.maxPrice) (where.price as Record<string, number>).lte = filters.maxPrice;
      }

      const total = await prisma.product.count({ where: where as any });
      const products = await prisma.product.findMany({
        where: where as any,
        include: {
          images: { take: 1, orderBy: { createdAt: 'desc' } },
        },
        orderBy: { [filters.sortBy]: filters.sortOrder },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      });

      reply.send({
        success: true,
        data: products,
        meta: {
          total,
          page: filters.page,
          limit: filters.limit,
          totalPages: Math.ceil(total / filters.limit),
        },
      });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // ==========================================
  // GET /products/:id - Détail d'un produit
  // ==========================================
  app.get('/products/:id', {
    schema: {
      tags: ['Produits'],
      description: 'Récupérer un produit par son ID',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    try {
      const { id: vendorId } = (request as AuthenticatedRequest).user;
      const { id } = request.params as { id: string };

      const product = await prisma.product.findFirst({
        where: { id, vendorId },
        include: {
          images: { orderBy: { createdAt: 'desc' } },
        },
      });

      if (!product) {
        throw new NotFoundError('Produit');
      }

      reply.send({ success: true, data: product });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // ==========================================
  // POST /products - Créer un produit
  // ==========================================
  app.post('/products', {
    schema: {
      tags: ['Produits'],
      description: 'Créer un nouveau produit',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id: vendorId } = (request as AuthenticatedRequest).user;
      const input = createProductSchema.parse(request.body);

      const slug = slugify(input.name);

      const product = await prisma.product.create({
        data: {
          ...input,
          slug,
          vendorId,
          benefits: [],
        },
        include: {
          images: true,
        },
      });

      reply.status(201).send({ success: true, data: product });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // ==========================================
  // PATCH /products/:id - Mettre à jour un produit
  // ==========================================
  app.patch('/products/:id', {
    schema: {
      tags: ['Produits'],
      description: 'Mettre à jour un produit',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id: vendorId } = (request as AuthenticatedRequest).user;
      const { id } = request.params as { id: string };
      const input = updateProductSchema.parse({ ...(request.body as object), id });

      const existing = await prisma.product.findFirst({
        where: { id, vendorId },
      });

      if (!existing) {
        throw new NotFoundError('Produit');
      }

      const updateData: Record<string, unknown> = { ...(input as Record<string, unknown>) };
      delete updateData.id;

      if (input.name && input.name !== existing.name) {
        updateData.slug = slugify(input.name);
      }

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
        include: { images: true },
      });

      reply.send({ success: true, data: product });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // ==========================================
  // DELETE /products/:id - Supprimer un produit
  // ==========================================
  app.delete('/products/:id', {
    schema: {
      tags: ['Produits'],
      description: 'Supprimer un produit',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id: vendorId } = (request as AuthenticatedRequest).user;
      const { id } = request.params as { id: string };

      const existing = await prisma.product.findFirst({
        where: { id, vendorId },
      });

      if (!existing) {
        throw new NotFoundError('Produit');
      }

      await prisma.product.delete({ where: { id } });

      reply.send({ success: true, data: { message: 'Produit supprimé avec succès' } });
    } catch (error) {
      handleError(reply, error);
    }
  });
}