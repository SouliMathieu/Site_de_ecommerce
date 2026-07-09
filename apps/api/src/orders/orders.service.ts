import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

const includeRelations = {
  items: { include: { product: true } },
  delivery: true,
} as const;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  findAllForVendor(vendorId: string) {
    return this.prisma.order.findMany({
      where: { vendorId },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(vendorId: string, id: string) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: includeRelations });
    if (!order) throw new NotFoundException('Commande introuvable.');
    if (order.vendorId !== vendorId) throw new ForbiddenException();
    return order;
  }

  async create(vendorId: string, dto: CreateOrderDto) {
    const productIds = dto.items.map((item) => item.productId);
    const [products, vendor] = await Promise.all([
      this.prisma.product.findMany({ where: { id: { in: productIds }, vendorId } }),
      this.prisma.user.findUniqueOrThrow({ where: { id: vendorId }, select: { currency: true } }),
    ]);

    if (products.length !== productIds.length) {
      throw new BadRequestException('Un ou plusieurs produits sont introuvables.');
    }

    const priceByProduct = new Map(products.map((p) => [p.id, Number(p.price)]));
    const total = dto.items.reduce(
      (sum, item) => sum + (priceByProduct.get(item.productId) ?? 0) * item.quantity,
      0,
    );

    const order = await this.prisma.order.create({
      data: {
        vendorId,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        address: dto.address,
        total,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: priceByProduct.get(item.productId) ?? 0,
          })),
        },
        delivery: { create: {} },
      },
      include: includeRelations,
    });

    const formattedTotal = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: vendor.currency,
    }).format(total);
    await this.notifications.create(
      vendorId,
      NotificationType.NOUVELLE_COMMANDE,
      `Nouvelle commande de ${dto.customerName} — ${formattedTotal}`,
    );

    return order;
  }

  async updateStatus(vendorId: string, id: string, dto: UpdateOrderStatusDto) {
    await this.findOne(vendorId, id);
    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: includeRelations,
    });
  }
}
