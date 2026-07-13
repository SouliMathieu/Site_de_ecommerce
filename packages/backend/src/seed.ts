import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  // Créer un vendeur de test
  const hashedPassword = await bcrypt.hash('Test1234!', 12);

  const vendor = await prisma.vendor.upsert({
    where: { email: 'vendeur@test.com' },
    update: {},
    create: {
      email: 'vendeur@test.com',
      password: hashedPassword,
      name: 'Vendeur Test',
      phone: '+221770000001',
      storeName: 'Ma Boutique Test',
    },
  });

  console.log(`✓ Vendeur créé: ${vendor.email}`);

  // Créer des produits de test
  const products = await Promise.all([
    prisma.product.create({
      data: {
        vendorId: vendor.id,
        name: 'Smartphone Pro Max',
        slug: 'smartphone-pro-max-' + Date.now(),
        description: 'Un smartphone haut de gamme avec appareil photo professionnel et batterie longue durée.',
        shortDescription: 'Smartphone 256Go, appareil 108MP',
        price: 450000,
        comparePrice: 550000,
        costPrice: 300000,
        minPrice: 380000,
        stock: 15,
        status: 'ACTIVE',
        category: 'ELECTRONICS',
        tags: ['smartphone', 'android', 'photo'],
        features: ['Écran 6.7" AMOLED', '256Go stockage', 'Appareil 108MP', 'Batterie 5000mAh'],
        benefits: ['Photos professionnelles', 'Utilisation toute la journée sans recharge', 'Stockez tous vos fichiers'],
      },
    }),
    prisma.product.create({
      data: {
        vendorId: vendor.id,
        name: 'Tissu Bazin Riche',
        slug: 'tissu-bazin-riche-' + Date.now(),
        description: 'Magnifique tissu bazin riche de qualité supérieure, parfait pour vos cérémonies.',
        shortDescription: 'Bazin riche fait main',
        price: 25000,
        comparePrice: 35000,
        costPrice: 15000,
        minPrice: 20000,
        stock: 50,
        status: 'ACTIVE',
        category: 'FASHION',
        tags: ['bazin', 'tissu', 'mode', 'cérémonie'],
        features: ['Tissu 100% coton', 'Largeur 120cm', 'Motifs brodés main'],
        benefits: ['Look élégant garanti', 'Confortable à porter', 'Idéal pour les mariages'],
      },
    }),
    prisma.product.create({
      data: {
        vendorId: vendor.id,
        name: 'Huile de Cuisine Bio 5L',
        slug: 'huile-cuisine-bio-5l-' + Date.now(),
        description: 'Huile de cuisine biologique pressée à froid, riche en oméga-3.',
        shortDescription: 'Huile bio 100% naturelle',
        price: 8500,
        comparePrice: 10000,
        costPrice: 5000,
        minPrice: 7000,
        stock: 100,
        status: 'ACTIVE',
        category: 'FOOD',
        tags: ['huile', 'bio', 'cuisine'],
        features: ['100% biologique', 'Pressée à froid', 'Riche en oméga-3'],
        benefits: ['Cuisine plus saine', 'Meilleur pour votre santé', 'Goût naturel préservé'],
      },
    }),
  ]);

  console.log(`✓ ${products.length} produits créés`);

  // Créer un client de test
  const customer = await prisma.customer.upsert({
    where: { vendorId_phone: { vendorId: vendor.id, phone: '+221770000002' } },
    update: {},
    create: {
      vendorId: vendor.id,
      name: 'Client Test',
      phone: '+221770000002',
      city: 'Dakar',
      district: 'Mermoz',
      address: 'Rue 12, Villa 45',
    },
  });

  console.log(`✓ Client créé: ${customer.name}`);

  // Créer des livreurs de test
  const deliveryPerson = await prisma.deliveryPerson.create({
    data: {
      vendorId: vendor.id,
      name: 'Livreur Test',
      phone: '+221770000003',
      zones: ['Dakar-Plateau', 'Mermoz', 'Fann'],
      maxLoad: 20,
      successRate: 95,
      averageDeliveryTime: 45,
      performanceScore: 4.5,
    },
  });

  console.log(`✓ Livreur créé: ${deliveryPerson.name}`);

  console.log('\n✅ Seed terminé avec succès !');
  console.log('\n📧 Identifiants de test:');
  console.log('   Email: vendeur@test.com');
  console.log('   Mot de passe: Test1234!');
}

main()
  .catch((error) => {
    console.error('❌ Erreur seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });