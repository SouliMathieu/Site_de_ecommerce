import { PrismaClient, DeliveryStatus, OrderStatus, ProductStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('Demo1234!');

  const vendor = await prisma.user.upsert({
    where: { email: 'demo@vente-intelligente.com' },
    update: {},
    create: {
      email: 'demo@vente-intelligente.com',
      passwordHash,
      name: 'Vendeur Démo',
    },
  });

  const existingProducts = await prisma.product.count({ where: { vendorId: vendor.id } });
  if (existingProducts > 0) {
    console.log('Données de démo déjà présentes, seed ignoré.');
    return;
  }

  const products = await Promise.all(
    [
      { name: 'Sac à main artisanal', price: 15000, stock: 12, description: 'Cuir véritable, fait main.' },
      { name: 'Basket urbaine', price: 22000, stock: 8, description: 'Édition limitée, tailles 39-45.' },
      { name: 'Montre connectée', price: 35000, stock: 5, description: 'Autonomie 7 jours, étanche.' },
      { name: 'Robe wax', price: 18000, stock: 15, description: 'Tissu wax premium, coupe moderne.' },
    ].map((p) =>
      prisma.product.create({
        data: { ...p, vendorId: vendor.id, status: ProductStatus.ACTIF },
      }),
    ),
  );

  const demoOrders = [
    { customerName: 'Fatou Zongo', customerPhone: '+22670000001', address: 'Ouagadougou, Secteur 15', status: OrderStatus.CONFIRMEE, deliveryStatus: DeliveryStatus.LIVRE, productIdx: 0 },
    { customerName: 'Issa Compaoré', customerPhone: '+22670000002', address: 'Bobo-Dioulasso, Sarfalao', status: OrderStatus.CONFIRMEE, deliveryStatus: DeliveryStatus.EN_COURS, productIdx: 1 },
    { customerName: 'Aminata Sawadogo', customerPhone: '+22670000003', address: 'Ouagadougou, Ouaga 2000', status: OrderStatus.EN_ATTENTE, deliveryStatus: DeliveryStatus.EN_ATTENTE, productIdx: 2 },
  ];

  for (const o of demoOrders) {
    const product = products[o.productIdx];
    await prisma.order.create({
      data: {
        vendorId: vendor.id,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        address: o.address,
        status: o.status,
        total: product.price,
        items: {
          create: [{ productId: product.id, quantity: 1, unitPrice: product.price }],
        },
        delivery: { create: { status: o.deliveryStatus, zone: 'Zone centrale' } },
      },
    });
  }

  console.log('Seed terminé : vendeur demo@vente-intelligente.com / Demo1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
