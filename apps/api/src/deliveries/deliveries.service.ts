import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DeliveryStatus, NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  EN_ATTENTE: 'en attente',
  EN_COURS: 'en cours',
  LIVRE: 'livrée',
  ECHEC: 'échec de livraison',
};

@Injectable()
export class DeliveriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  findAllForVendor(vendorId: string) {
    return this.prisma.delivery.findMany({
      where: { order: { vendorId } },
      include: { order: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async update(vendorId: string, id: string, dto: UpdateDeliveryDto) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id }, include: { order: true } });
    if (!delivery) throw new NotFoundException('Livraison introuvable.');
    if (delivery.order.vendorId !== vendorId) throw new ForbiddenException();

    const updated = await this.prisma.delivery.update({
      where: { id },
      data: dto,
      include: { order: true },
    });

    if (dto.status) {
      await this.notifications.create(
        vendorId,
        NotificationType.LIVRAISON_MISE_A_JOUR,
        `Livraison de la commande ${delivery.order.customerName} : ${STATUS_LABELS[dto.status]}`,
      );
    }

    return updated;
  }
}
