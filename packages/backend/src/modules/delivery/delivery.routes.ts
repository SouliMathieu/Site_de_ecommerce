import { FastifyInstance } from 'fastify';
import { prisma } from '../../utils/prisma.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { NotFoundError, handleError } from '../../utils/errors.js';

export async function deliveryRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  // ==========================================
  // GET /delivery/persons - Liste des livreurs
  // ==========================================
  app.get('/delivery/persons', {
    schema: {
      tags: ['Livraisons'],
      description: 'Liste des livreurs partenaires',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id: vendorId } = (request as AuthenticatedRequest).user;
      const query = request.query as Record<string, string>;

      const where: Record<string, unknown> = { vendorId };
      if (query.available === 'true') where.isAvailable = true;

      const persons = await prisma.deliveryPerson.findMany({
        where: where as any,
        orderBy: { createdAt: 'desc' },
      });

      reply.send({ success: true, data: persons });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // ==========================================
  // POST /delivery/persons - Ajouter un livreur
  // ==========================================
  app.post('/delivery/persons', {
    schema: {
      tags: ['Livraisons'],
      description: 'Ajouter un livreur partenaire',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id: vendorId } = (request as AuthenticatedRequest).user;
      const body = request.body as {
        name: string;
        phone: string;
        email?: string;
        zones: string[];
        maxLoad?: number;
      };

      const person = await prisma.deliveryPerson.create({
        data: {
          vendorId,
          name: body.name,
          phone: body.phone,
          email: body.email,
          zones: body.zones,
          maxLoad: body.maxLoad || 20,
        },
      });

      reply.status(201).send({ success: true, data: person });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // ==========================================
  // DELETE /delivery/persons/:id - Supprimer livreur
  // ==========================================
  app.delete('/delivery/persons/:id', {
    schema: {
      tags: ['Livraisons'],
      description: 'Supprimer un livreur',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id: vendorId } = (request as AuthenticatedRequest).user;
      const { id } = request.params as { id: string };

      const existing = await prisma.deliveryPerson.findFirst({
        where: { id, vendorId },
      });
      if (!existing) throw new NotFoundError('Livreur');

      await prisma.deliveryPerson.delete({ where: { id } });
      reply.send({ success: true, data: { message: 'Livreur supprimé' } });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // ==========================================
  // GET /delivery - Liste des livraisons
  // ==========================================
  app.get('/delivery', {
    schema: {
      tags: ['Livraisons'],
      description: 'Liste des livraisons',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id: vendorId } = (request as AuthenticatedRequest).user;
      const query = request.query as Record<string, string>;
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '20');
      const status = query.status;

      const where: Record<string, unknown> = {
        order: { vendorId },
      };
      if (status) where.status = status;

      const total = await prisma.delivery.count({ where: where as any });
      const deliveries = await prisma.delivery.findMany({
        where: where as any,
        include: {
          order: { include: { customer: true } },
          deliveryPerson: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      reply.send({
        success: true,
        data: deliveries,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // ==========================================
  // PATCH /delivery/:id/status - Statut livraison
  // ==========================================
  app.patch('/delivery/:id/status', {
    schema: {
      tags: ['Livraisons'],
      description: 'Mettre à jour le statut d\'une livraison',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: string };

      const updateData: Record<string, unknown> = { status };
      if (status === 'PICKED_UP') updateData.pickedUpAt = new Date();
      if (status === 'DELIVERED') updateData.deliveredAt = new Date();

      const delivery = await prisma.delivery.update({
        where: { id },
        data: updateData,
      });

      reply.send({ success: true, data: delivery });
    } catch (error) {
      handleError(reply, error);
    }
  });
}