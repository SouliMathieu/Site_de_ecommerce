import { FastifyInstance } from 'fastify';
import { prisma } from '../../utils/prisma.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { handleError } from '../../utils/errors.js';

export async function notificationRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  // ==========================================
  // GET /notifications - Liste des notifications
  // ==========================================
  app.get('/notifications', {
    schema: {
      tags: ['Notifications'],
      description: 'Liste des notifications du vendeur',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id: vendorId } = (request as AuthenticatedRequest).user;
      const query = request.query as Record<string, string>;
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '50');
      const unreadOnly = query.unreadOnly === 'true';

      const where: Record<string, unknown> = { vendorId };
      if (unreadOnly) where.read = false;

      const total = await prisma.notification.count({ where: where as any });
      const notifications = await prisma.notification.findMany({
        where: where as any,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const unreadCount = await prisma.notification.count({
        where: { vendorId, read: false },
      });

      reply.send({
        success: true,
        data: notifications,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          unreadCount,
        },
      });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // ==========================================
  // PATCH /notifications/:id/read - Marquer comme lu
  // ==========================================
  app.patch('/notifications/:id/read', {
    schema: {
      tags: ['Notifications'],
      description: 'Marquer une notification comme lue',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id: vendorId } = (request as AuthenticatedRequest).user;
      const { id } = request.params as { id: string };

      await prisma.notification.updateMany({
        where: { id, vendorId },
        data: { read: true },
      });

      reply.send({ success: true, data: { message: 'Notification marquée comme lue' } });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // ==========================================
  // POST /notifications/read-all - Tout marquer comme lu
  // ==========================================
  app.post('/notifications/read-all', {
    schema: {
      tags: ['Notifications'],
      description: 'Marquer toutes les notifications comme lues',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id: vendorId } = (request as AuthenticatedRequest).user;

      await prisma.notification.updateMany({
        where: { vendorId, read: false },
        data: { read: true },
      });

      reply.send({ success: true, data: { message: 'Toutes les notifications marquées comme lues' } });
    } catch (error) {
      handleError(reply, error);
    }
  });
}