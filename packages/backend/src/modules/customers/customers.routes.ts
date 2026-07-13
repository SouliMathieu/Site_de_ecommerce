import { FastifyInstance } from 'fastify';
import { prisma } from '../../utils/prisma.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { NotFoundError, handleError } from '../../utils/errors.js';

export async function customerRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  // ==========================================
  // GET /customers - Liste des clients
  // ==========================================
  app.get('/customers', {
    schema: {
      tags: ['Clients'],
      description: 'Liste paginée des clients',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id: vendorId } = (request as AuthenticatedRequest).user;
      const query = request.query as Record<string, string>;
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '20');
      const search = query.search;

      const where: Record<string, unknown> = { vendorId };
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { city: { contains: search, mode: 'insensitive' } },
        ];
      }

      const total = await prisma.customer.count({ where: where as any });
      const customers = await prisma.customer.findMany({
        where: where as any,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      reply.send({
        success: true,
        data: customers,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // ==========================================
  // GET /customers/:id - Détail client
  // ==========================================
  app.get('/customers/:id', {
    schema: {
      tags: ['Clients'],
      description: 'Récupérer un client par son ID',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id: vendorId } = (request as AuthenticatedRequest).user;
      const { id } = request.params as { id: string };

      const customer = await prisma.customer.findFirst({
        where: { id, vendorId },
        include: {
          orders: {
            include: { items: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!customer) throw new NotFoundError('Client');

      reply.send({ success: true, data: customer });
    } catch (error) {
      handleError(reply, error);
    }
  });
}