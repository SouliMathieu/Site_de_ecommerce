import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForVendor(vendorId: string) {
    return this.prisma.product.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(vendorId: string, id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Produit introuvable.');
    if (product.vendorId !== vendorId) throw new ForbiddenException();
    return product;
  }

  create(vendorId: string, dto: CreateProductDto) {
    return this.prisma.product.create({
      data: { ...dto, vendorId },
    });
  }

  async update(vendorId: string, id: string, dto: UpdateProductDto) {
    await this.findOne(vendorId, id);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(vendorId: string, id: string) {
    await this.findOne(vendorId, id);
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }
}
