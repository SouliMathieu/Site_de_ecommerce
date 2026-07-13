import { FastifyInstance } from 'fastify';
import { prisma } from '../../utils/prisma.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { handleError } from '../../utils/errors.js';

export async function dashboardRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  // ==========================================
  // GET /dashboard/stats - Statistiques générales
  // ==========================================
  app.get('/dashboard/stats', {
    schema: {
      tags: ['Dashboard'],
      description: 'Statistiques générales du tableau de bord',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id: vendorId } = (request as AuthenticatedRequest).user;

      const [
        totalProducts,
        totalOrders,
        totalCustomers,
        revenueResult,
        ordersByStatus,
        recentOrders,
        topProducts,
      ] = await Promise.all([
        prisma.product.count({ where: { vendorId } }),
        prisma.order.count({ where: { vendorId } }),
        prisma.customer.count({ where: { vendorId } }),
        prisma.order.aggregate({
          where: { vendorId, status: 'DELIVERED' },
          _sum: { finalAmount: true },
        }),
        prisma.order.groupBy({
          by: ['status'],
          where: { vendorId },
          _count: { id: true },
        }),
        prisma.order.findMany({
          where: { vendorId },
          include: { customer: true, items: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        prisma.product.findMany({
          where: { vendorId },
          orderBy: { salesCount: 'desc' },
          take: 5,
        }),
      ]);

      const totalRevenue = revenueResult._sum.finalAmount || 0;
      const ordersStatusMap: Record<string, number> = {};
      ordersByStatus.forEach((item) => {
        ordersStatusMap[item.status] = item._count.id;
      });

      // Revenus par jour (30 derniers jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentRevenue = await prisma.order.findMany({
        where: {
          vendorId,
          status: 'DELIVERED',
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { finalAmount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      const revenueByDay: Record<string, number> = {};
      recentRevenue.forEach((item) => {
        const date = item.createdAt.toISOString().split('T')[0];
        revenueByDay[date] = (revenueByDay[date] || 0) + item.finalAmount;
      });
      const revenueByDayArray = Object.entries(revenueByDay).map(([date, amount]) => ({
        date,
        amount,
      }));

      const conversionRate = totalOrders > 0 && totalCustomers > 0
        ? Math.round((totalOrders / totalCustomers) * 100)
        : 0;

      const averageOrderValue = totalOrders > 0
        ? Math.round(totalRevenue / totalOrders)
        : 0;

      reply.send({
        success: true,
        data: {
          totalProducts,
          totalOrders,
          totalRevenue,
          totalCustomers,
          conversionRate,
          averageOrderValue,
          topProducts,
          ordersByStatus: ordersStatusMap,
          revenueByDay: revenueByDayArray,
          recentOrders,
        },
      });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // ==========================================
  // GET /dashboard/recent-orders
  // ==========================================
  app.get('/dashboard/recent-orders', {
    schema: {
      tags: ['Dashboard'],
      description: 'Dernières commandes',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id: vendorId } = (request as AuthenticatedRequest).user;

      const orders = await prisma.order.findMany({
        where: { vendorId },
        include: { customer: true, items: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      reply.send({ success: true, data: orders });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // ==========================================
  // GET /dashboard/top-products
  // ==========================================
  app.get('/dashboard/top-products', {
    schema: {
      tags: ['Dashboard'],
      description: 'Produits les plus vendus',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id: vendorId } = (request as AuthenticatedRequest).user;

      const products = await prisma.product.findMany({
        where: { vendorId },
        include: { images: { take: 1 } },
        orderBy: { salesCount: 'desc' },
        take: 10,
      });

      reply.send({ success: true, data: products });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // ==========================================
  // GET /dashboard/revenue
  // ==========================================
  app.get('/dashboard/revenue', {
    schema: {
      tags: ['Dashboard'],
      description: 'Données de revenus',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id: vendorId } = (request as AuthenticatedRequest).user;
      const query = request.query as Record<string, string>;
      const period = query.period || '30d';

      let days = 30;
      if (period === '7d') days = 7;
      else if (period === '90d') days = 90;
      else if (period === '1y') days = 365;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const orders = await prisma.order.findMany({
        where: {
          vendorId,
          status: 'DELIVERED',
          createdAt: { gte: startDate },
        },
        select: { finalAmount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      const revenueByDay: Record<string, number> = {};
      orders.forEach((item) => {
        const date = item.createdAt.toISOString().split('T')[0];
        revenueByDay[date] = (revenueByDay[date] || 0) + item.finalAmount;
      });

      const data = Object.entries(revenueByDay).map(([date, amount]) => ({
        date,
        amount,
      }));

      const total = data.reduce((sum, item) => sum + item.amount, 0);

      reply.send({
        success: true,
        data: { total, period, days, data },
      });
    } catch (error) {
      handleError(reply, error);
    }
  });
}