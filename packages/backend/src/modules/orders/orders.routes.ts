import { FastifyInstance } from 'fastify';
import { prisma } from '../../utils/prisma.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { NotFoundError, handleError } from '../../utils/errors.js';
import { nanoid } from 'nanoid';

export async function orderRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  // ==========================================
  // GET /orders - Liste des commandes
  // ==========================================
  app.get('/orders', {
    schema: {
      tags: ['Commandes'],
      description: 'Liste paginée des commandes',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id: vendorId } = (request as AuthenticatedRequest).user;
      const query = request.query as Record<string, string>;
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '20');
      const status = query.status;

      const where: Record<string, unknown> = { vendorId };
      if (status) where.status = status;

      const total = await prisma.order.count({ where: where as any });
      const orders = await prisma.order.findMany({
        where: where as any,
        include: {
          customer: true,
          items: true,
          delivery: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      reply.send({
        success: true,
        data: orders,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // ==========================================
  // GET /orders/:id - Détail commande
  // ==========================================
  app.get('/orders/:id', {
    schema: {
      tags: ['Commandes'],
      description: 'Récupérer une commande par son ID',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id: vendorId } = (request as AuthenticatedRequest).user;
      const { id } = request.params as { id: string };

      const order = await prisma.order.findFirst({
        where: { id, vendorId },
        include: {
          customer: true,
          items: { include: { product: true } },
          delivery: { include: { deliveryPerson: true } },
          payments: true,
        },
      });

      if (!order) throw new NotFoundError('Commande');

      reply.send({ success: true, data: order });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // ==========================================
  // PATCH /orders/:id/status - Mettre à jour le statut
  // ==========================================
  app.patch('/orders/:id/status', {
    schema: {
      tags: ['Commandes'],
      description: 'Mettre à jour le statut d\'une commande',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id: vendorId } = (request as AuthenticatedRequest).user;
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: string };

      const existing = await prisma.order.findFirst({
        where: { id, vendorId },
      });
      if (!existing) throw new NotFoundError('Commande');

      const order = await prisma.order.update({
        where: { id },
        data: { status },
        include: { customer: true, items: true },
      });

      // Créer une notification pour le changement de statut
      await prisma.notification.create({
        data: {
          vendorId,
          type: 'ORDER_STATUS',
          title: `Commande #${order.orderNumber}`,
          message: `Le statut de la commande #${order.orderNumber} est passé à "${status}"`,
          data: { orderId: id, status },
        },
      });

      reply.send({ success: true, data: order });
    } catch (error) {
      handleError(reply, error);
    }
  });
}