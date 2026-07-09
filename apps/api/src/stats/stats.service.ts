import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(vendorId: string) {
    const [orders, productsCount, deliveries] = await Promise.all([
      this.prisma.order.findMany({
        where: { vendorId },
        include: { items: { include: { product: true } } },
      }),
      this.prisma.product.count({ where: { vendorId } }),
      this.prisma.delivery.count({ where: { order: { vendorId }, status: 'LIVRE' } }),
    ]);

    const confirmedOrders = orders.filter((o) => o.status === OrderStatus.CONFIRMEE);
    const revenue = confirmedOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const conversionRate = orders.length > 0 ? confirmedOrders.length / orders.length : 0;

    const salesByProduct = new Map<string, { name: string; sales: number }>();
    for (const order of confirmedOrders) {
      for (const item of order.items) {
        const key = item.productId;
        const current = salesByProduct.get(key) ?? { name: item.product.name, sales: 0 };
        current.sales += item.quantity;
        salesByProduct.set(key, current);
      }
    }

    const topProducts = Array.from(salesByProduct.entries())
      .map(([productId, v]) => ({ productId, name: v.name, sales: v.sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    return {
      revenue,
      ordersCount: orders.length,
      conversionRate,
      productsCount,
      deliveredCount: deliveries,
      topProducts,
    };
  }
}
