require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { getSeedData } = require('./seedData');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with Sri Lankan Restaurant data...');

  const seed = await getSeedData();

  // Clear existing data (in reverse order of foreign keys)
  try {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.variant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.diningTable.deleteMany();
    await prisma.user.deleteMany();
  } catch (e) {
    console.log('Note: Clean table warning (safe to ignore if first run):', e.message);
  }

  // Seed Users
  for (const u of seed.users) {
    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        username: u.username,
        password: u.password,
        role: u.role,
      },
    });
  }
  console.log(`✅ Seeded ${seed.users.length} users`);

  // Seed Categories
  for (const cat of seed.categories) {
    await prisma.category.create({
      data: {
        id: cat.id,
        name: cat.name,
        description: cat.description,
      },
    });
  }
  console.log(`✅ Seeded ${seed.categories.length} categories`);

  // Seed Products with Variants
  for (const p of seed.products) {
    await prisma.product.create({
      data: {
        id: p.id,
        name: p.name,
        categoryId: p.categoryId,
        basePrice: p.basePrice,
        isAvailable: p.isAvailable,
        variants: {
          create: p.variants.map(v => ({
            name: v.name,
            price: v.price,
          })),
        },
      },
    });
  }
  console.log(`✅ Seeded ${seed.products.length} products`);

  // Seed Dining Tables
  for (const t of seed.diningTables) {
    await prisma.diningTable.create({
      data: {
        id: t.id,
        number: t.number,
        capacity: t.capacity,
        isOccupied: t.isOccupied,
      },
    });
  }
  console.log(`✅ Seeded ${seed.diningTables.length} dining tables`);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
