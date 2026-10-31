const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { getSeedData } = require('./seedData');

const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'pos_store.json');

let prisma = null;
let usePrisma = false;

// In-memory or file-backed fallback storage
let localStore = {
  users: [],
  categories: [],
  products: [],
  diningTables: [],
  orders: [],
  nextOrderNumber: 1001,
};

function saveLocalStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(localStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local store:', err.message);
  }
}

async function initLocalStore() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      localStore = JSON.parse(data);
      console.log('📦 Loaded existing local store data.');
      return;
    } catch (err) {
      console.warn('⚠️ Could not parse existing store, re-seeding...');
    }
  }

  // Seed default Sri Lankan restaurant data
  const seed = await getSeedData();
  localStore = {
    users: seed.users,
    categories: seed.categories,
    products: seed.products,
    diningTables: seed.diningTables,
    orders: [
      {
        id: 'ord-demo-1',
        orderNumber: 1001,
        orderType: 'DINE_IN',
        status: 'READY',
        tableId: 'tbl-02',
        userId: 'usr-cashier-1',
        subTotal: 2500,
        discount: 0,
        tax: 0,
        grandTotal: 2500,
        paymentMethod: 'CASH',
        isPaid: false,
        notes: 'Table 2 - 2 packs extra chili paste',
        items: [
          {
            id: 'item-1',
            orderId: 'ord-demo-1',
            productId: 'prod-rc-chk',
            variantName: 'Full',
            quantity: 2,
            unitPrice: 850,
            totalPrice: 1700,
            notes: 'Extra gravy on side',
          },
          {
            id: 'item-2',
            orderId: 'ord-demo-1',
            productId: 'prod-kt-egg',
            variantName: 'Full',
            quantity: 1,
            unitPrice: 800,
            totalPrice: 800,
            notes: 'Medium spicy',
          },
        ],
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ord-demo-2',
        orderNumber: 1002,
        orderType: 'TAKEAWAY',
        status: 'PREPARING',
        tableId: null,
        userId: 'usr-cashier-1',
        subTotal: 1650,
        discount: 100,
        tax: 0,
        grandTotal: 1550,
        paymentMethod: 'QR',
        isPaid: true,
        notes: 'Parcel Kottu',
        items: [
          {
            id: 'item-3',
            orderId: 'ord-demo-2',
            productId: 'prod-kt-cheese',
            variantName: 'Full',
            quantity: 1,
            unitPrice: 1650,
            totalPrice: 1650,
            notes: 'Extra cheese please',
          },
        ],
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    nextOrderNumber: 1003,
  };
  saveLocalStore();
  console.log('✅ Local store initialized with Sri Lankan Restaurant seed data.');
}

async function initDB() {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.includes('placeholder')) {
    try {
      console.log('🔌 Connecting to Neon PostgreSQL...');
      prisma = new PrismaClient();
      await prisma.$connect();
      usePrisma = true;
      console.log('⚡ Successfully connected to Neon PostgreSQL via Prisma!');
      return;
    } catch (err) {
      console.warn('⚠️ Could not connect to Neon PostgreSQL:', err.message);
      console.log('🔄 Switching seamlessly to built-in high-performance local store...');
    }
  } else {
    console.log('💡 DATABASE_URL is in dev/placeholder mode. Using built-in local store.');
  }

  await initLocalStore();
}

const db = {
  // USERS
  users: {
    findUnique: async ({ where }) => {
      if (usePrisma) return await prisma.user.findUnique({ where });
      if (where.username) return localStore.users.find(u => u.username === where.username);
      if (where.id) return localStore.users.find(u => u.id === where.id);
      return null;
    },
    create: async ({ data }) => {
      if (usePrisma) return await prisma.user.create({ data });
      const newUser = { id: `usr-${Date.now()}`, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      localStore.users.push(newUser);
      saveLocalStore();
      return newUser;
    },
    findMany: async () => {
      if (usePrisma) return await prisma.user.findMany({ select: { id: true, name: true, username: true, role: true } });
      return localStore.users.map(({ password, ...u }) => u);
    },
  },

  // CATEGORIES
  categories: {
    findMany: async (options = {}) => {
      if (usePrisma) {
        return await prisma.category.findMany({
          ...options,
          include: { products: { include: { variants: true } } },
          orderBy: { createdAt: 'asc' },
        });
      }
      return localStore.categories.map(cat => ({
        ...cat,
        products: localStore.products.filter(p => p.categoryId === cat.id),
      }));
    },
    create: async ({ data }) => {
      if (usePrisma) return await prisma.category.create({ data });
      const newCat = { id: `cat-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
      localStore.categories.push(newCat);
      saveLocalStore();
      return newCat;
    },
  },

  // PRODUCTS
  products: {
    findMany: async (options = {}) => {
      if (usePrisma) return await prisma.product.findMany(options);
      return localStore.products.map(prod => ({
        ...prod,
        category: localStore.categories.find(c => c.id === prod.categoryId),
      }));
    },
    findUnique: async ({ where, include }) => {
      if (usePrisma) return await prisma.product.findUnique({ where, include });
      const prod = localStore.products.find(p => p.id === where.id);
      if (!prod) return null;
      return {
        ...prod,
        category: localStore.categories.find(c => c.id === prod.categoryId),
      };
    },
    create: async ({ data }) => {
      if (usePrisma) return await prisma.product.create({ data });
      const newProd = {
        id: `prod-${Date.now()}`,
        name: data.name,
        categoryId: data.categoryId,
        basePrice: Number(data.basePrice),
        isAvailable: data.isAvailable !== false,
        variants: (data.variants && data.variants.create) ? data.variants.create.map((v, i) => ({
          id: `var-${Date.now()}-${i}`,
          name: v.name,
          price: Number(v.price),
        })) : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStore.products.push(newProd);
      saveLocalStore();
      return newProd;
    },
    update: async ({ where, data }) => {
      if (usePrisma) return await prisma.product.update({ where, data });
      const idx = localStore.products.findIndex(p => p.id === where.id);
      if (idx === -1) throw new Error('Product not found');
      localStore.products[idx] = {
        ...localStore.products[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      saveLocalStore();
      return localStore.products[idx];
    },
    delete: async ({ where }) => {
      if (usePrisma) return await prisma.product.delete({ where });
      localStore.products = localStore.products.filter(p => p.id !== where.id);
      saveLocalStore();
      return { id: where.id };
    },
  },

  // DINING TABLES
  tables: {
    findMany: async () => {
      if (usePrisma) return await prisma.diningTable.findMany({ orderBy: { number: 'asc' } });
      return localStore.diningTables.sort((a, b) => a.number.localeCompare(b.number));
    },
    findUnique: async ({ where }) => {
      if (usePrisma) return await prisma.diningTable.findUnique({ where });
      return localStore.diningTables.find(t => t.id === where.id || t.number === where.number);
    },
    update: async ({ where, data }) => {
      if (usePrisma) return await prisma.diningTable.update({ where, data });
      const idx = localStore.diningTables.findIndex(t => t.id === where.id);
      if (idx !== -1) {
        localStore.diningTables[idx] = { ...localStore.diningTables[idx], ...data };
        saveLocalStore();
        return localStore.diningTables[idx];
      }
      return null;
    },
  },

  // ORDERS
  orders: {
    findMany: async (filter = {}) => {
      if (usePrisma) {
        return await prisma.order.findMany({
          ...filter,
          include: {
            items: { include: { product: true } },
            table: true,
            user: { select: { id: true, name: true, username: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
      }
      let orders = [...localStore.orders];
      if (filter.where) {
        if (filter.where.status && Array.isArray(filter.where.status.in)) {
          orders = orders.filter(o => filter.where.status.in.includes(o.status));
        } else if (filter.where.status) {
          orders = orders.filter(o => o.status === filter.where.status);
        }
        if (filter.where.isPaid !== undefined) {
          orders = orders.filter(o => o.isPaid === filter.where.isPaid);
        }
        if (filter.where.tableId) {
          orders = orders.filter(o => o.tableId === filter.where.tableId);
        }
      }
      return orders
        .map(o => ({
          ...o,
          table: o.tableId ? localStore.diningTables.find(t => t.id === o.tableId) : null,
          user: localStore.users.find(u => u.id === o.userId) ? {
            id: o.userId,
            name: localStore.users.find(u => u.id === o.userId).name,
            username: localStore.users.find(u => u.id === o.userId).username,
          } : { id: o.userId, name: 'Cashier', username: 'cashier' },
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    findUnique: async ({ where }) => {
      if (usePrisma) {
        return await prisma.order.findUnique({
          where,
          include: {
            items: { include: { product: true } },
            table: true,
            user: { select: { id: true, name: true, username: true } },
          },
        });
      }
      const order = localStore.orders.find(o => o.id === where.id || o.orderNumber === where.orderNumber);
      if (!order) return null;
      return {
        ...order,
        table: order.tableId ? localStore.diningTables.find(t => t.id === order.tableId) : null,
        user: localStore.users.find(u => u.id === order.userId) ? {
          id: order.userId,
          name: localStore.users.find(u => u.id === order.userId).name,
          username: localStore.users.find(u => u.id === order.userId).username,
        } : { id: order.userId, name: 'Cashier', username: 'cashier' },
      };
    },
    create: async ({ data }) => {
      if (usePrisma) {
        const newOrder = await prisma.order.create({
          data,
          include: {
            items: { include: { product: true } },
            table: true,
            user: { select: { id: true, name: true, username: true } },
          },
        });
        if (newOrder.tableId && newOrder.orderType === 'DINE_IN') {
          try {
            await prisma.diningTable.update({
              where: { id: newOrder.tableId },
              data: { isOccupied: true },
            });
          } catch (e) {
            console.error('Error updating table occupancy:', e);
          }
        }
        return newOrder;
      }
      const orderId = `ord-${Date.now()}`;
      const orderNumber = localStore.nextOrderNumber++;
      const items = (data.items && data.items.create) ? data.items.create.map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        orderId,
        productId: item.productId,
        variantName: item.variantName || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        notes: item.notes || null,
        product: localStore.products.find(p => p.id === item.productId),
      })) : [];

      const newOrder = {
        id: orderId,
        orderNumber,
        orderType: data.orderType || 'TAKEAWAY',
        status: data.status || 'PENDING',
        tableId: data.tableId || null,
        userId: data.userId,
        subTotal: data.subTotal,
        discount: data.discount || 0,
        tax: data.tax || 0,
        grandTotal: data.grandTotal,
        paymentMethod: data.paymentMethod || 'CASH',
        isPaid: data.isPaid || false,
        notes: data.notes || '',
        items,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localStore.orders.push(newOrder);

      // If Dine-In and assigned to table, mark table occupied
      if (newOrder.tableId && newOrder.orderType === 'DINE_IN') {
        const tbl = localStore.diningTables.find(t => t.id === newOrder.tableId);
        if (tbl) tbl.isOccupied = true;
      }

      saveLocalStore();
      return {
        ...newOrder,
        table: newOrder.tableId ? localStore.diningTables.find(t => t.id === newOrder.tableId) : null,
      };
    },
    update: async ({ where, data }) => {
      if (usePrisma) {
        const updatedOrder = await prisma.order.update({
          where,
          data,
          include: {
            items: { include: { product: true } },
            table: true,
            user: { select: { id: true, name: true, username: true } },
          },
        });
        if ((data.status === 'COMPLETED' || data.status === 'CANCELLED' || data.isPaid === true) && updatedOrder.tableId) {
          try {
            const otherActive = await prisma.order.count({
              where: {
                id: { not: updatedOrder.id },
                tableId: updatedOrder.tableId,
                isPaid: false,
                status: { notIn: ['COMPLETED', 'CANCELLED'] },
              },
            });
            if (otherActive === 0) {
              await prisma.diningTable.update({
                where: { id: updatedOrder.tableId },
                data: { isOccupied: false },
              });
            }
          } catch (e) {
            console.error('Error freeing table occupancy:', e);
          }
        }
        return updatedOrder;
      }
      const idx = localStore.orders.findIndex(o => o.id === where.id);
      if (idx === -1) throw new Error('Order not found');
      localStore.orders[idx] = {
        ...localStore.orders[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      // If order is completed or cancelled, free table if dine in
      if ((data.status === 'COMPLETED' || data.status === 'CANCELLED' || data.isPaid === true) && localStore.orders[idx].tableId) {
        // Check if there are other active orders on this table
        const otherActive = localStore.orders.some(o => o.id !== where.id && o.tableId === localStore.orders[idx].tableId && !o.isPaid && o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
        if (!otherActive) {
          const tbl = localStore.diningTables.find(t => t.id === localStore.orders[idx].tableId);
          if (tbl) tbl.isOccupied = false;
        }
      }

      saveLocalStore();
      return localStore.orders[idx];
    },
    addItems: async ({ orderId, items, notes }) => {
      let addedSubtotal = 0;
      const itemsData = items.map(item => {
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const quantity = parseInt(item.quantity) || 1;
        const totalPrice = unitPrice * quantity;
        addedSubtotal += totalPrice;
        return {
          productId: item.productId,
          variantName: item.variantName || null,
          quantity,
          unitPrice,
          totalPrice,
          notes: item.notes || null,
        };
      });

      if (usePrisma) {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) throw new Error('Order not found');

        for (const item of itemsData) {
          await prisma.orderItem.create({
            data: {
              ...item,
              orderId,
            },
          });
        }

        const newSubTotal = order.subTotal + addedSubtotal;
        const newGrandTotal = Math.max(0, newSubTotal - order.discount + order.tax);

        return await prisma.order.update({
          where: { id: orderId },
          data: {
            subTotal: newSubTotal,
            grandTotal: newGrandTotal,
            status: 'PENDING',
            notes: notes ? `${order.notes || ''} | ${notes}` : order.notes,
          },
          include: {
            items: { include: { product: true } },
            table: true,
            user: { select: { id: true, name: true, username: true } },
          },
        });
      }

      const order = localStore.orders.find(o => o.id === orderId);
      if (!order) throw new Error('Order not found');

      const createdItems = itemsData.map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        orderId,
        ...item,
        product: localStore.products.find(p => p.id === item.productId),
      }));

      order.items.push(...createdItems);
      order.subTotal += addedSubtotal;
      order.grandTotal = Math.max(0, order.subTotal - order.discount + order.tax);
      order.status = 'PENDING';
      if (notes) {
        order.notes = order.notes ? `${order.notes} | ${notes}` : notes;
      }
      order.updatedAt = new Date().toISOString();
      saveLocalStore();

      return {
        ...order,
        table: order.tableId ? localStore.diningTables.find(t => t.id === order.tableId) : null,
        user: localStore.users.find(u => u.id === order.userId) ? {
          id: order.userId,
          name: localStore.users.find(u => u.id === order.userId).name,
          username: localStore.users.find(u => u.id === order.userId).username,
        } : { id: order.userId, name: 'Cashier', username: 'cashier' },
      };
    },
  },

  isPrismaReady: () => usePrisma,
};

module.exports = { initDB, db };
