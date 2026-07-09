import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { NotificationDto } from '@vente/shared';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
  ) {}

  async listForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async create(userId: string, type: NotificationType, message: string) {
    const notification = await this.prisma.notification.create({
      data: { userId, type, message },
    });
    const dto: NotificationDto = {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt.toISOString(),
    };
    this.gateway.emitToUser(userId, dto);
    return notification;
  }
}
