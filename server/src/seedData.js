const bcrypt = require('bcryptjs');

async function getSeedData() {
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const cashierPassword = await bcrypt.hash('cashier123', salt);
  const kitchenPassword = await bcrypt.hash('kitchen123', salt);

  const users = [
    {
      id: 'usr-admin-1',
      name: 'Kasun Bandara (Admin)',
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr-cashier-1',
      name: 'Nuwan Perera',
      username: 'cashier',
      password: cashierPassword,
      role: 'CASHIER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr-kitchen-1',
      name: 'Chef Kamal',
      username: 'kitchen',
      password: kitchenPassword,
      role: 'KITCHEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const categories = [
    {
      id: 'cat-rice',
      name: 'Rice & Curry',
      description: 'Authentic Sri Lankan rice plates with curries & papadam',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat-kottu',
      name: 'Kottu & Roti',
      description: 'Fresh street food kottu, cheese kottu and griddled roti',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat-fried-rice',
      name: 'Fried Rice & Noodles',
      description: 'Wok-tossed Sri Lankan style basmati fried rice & noodles',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat-short-eats',
      name: 'Short Eats & Snacks',
      description: 'Hot bakery short eats, cutlets, patties, roast paan',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat-beverages',
      name: 'Beverages & Tea',
      description: 'Faluda, Ceylon milk tea, fresh juices, and soft drinks',
      createdAt: new Date().toISOString(),
    },
  ];

  const products = [
    // Rice & Curry
    {
      id: 'prod-rc-chk',
      name: 'Chicken Rice & Curry',
      categoryId: 'cat-rice',
      basePrice: 850,
      isAvailable: true,
      variants: [
        { id: 'var-rc-chk-reg', name: 'Regular', price: 750 },
        { id: 'var-rc-chk-full', name: 'Full', price: 850 },
        { id: 'var-rc-chk-half', name: 'Half', price: 650 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-rc-fish',
      name: 'Fish Rice & Curry (Ambul Thiyal)',
      categoryId: 'cat-rice',
      basePrice: 800,
      isAvailable: true,
      variants: [
        { id: 'var-rc-fish-reg', name: 'Regular', price: 700 },
        { id: 'var-rc-fish-full', name: 'Full', price: 800 },
        { id: 'var-rc-fish-half', name: 'Half', price: 600 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-rc-veg',
      name: 'Vegetable Rice & Curry (4 Curries)',
      categoryId: 'cat-rice',
      basePrice: 550,
      isAvailable: true,
      variants: [
        { id: 'var-rc-veg-reg', name: 'Regular', price: 500 },
        { id: 'var-rc-veg-full', name: 'Full', price: 550 },
        { id: 'var-rc-veg-half', name: 'Half', price: 450 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-rc-egg',
      name: 'Egg Rice & Curry',
      categoryId: 'cat-rice',
      basePrice: 600,
      isAvailable: true,
      variants: [
        { id: 'var-rc-egg-full', name: 'Full', price: 600 },
        { id: 'var-rc-egg-half', name: 'Half', price: 480 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // Kottu
    {
      id: 'prod-kt-chk',
      name: 'Chicken Kottu',
      categoryId: 'cat-kottu',
      basePrice: 1200,
      isAvailable: true,
      variants: [
        { id: 'var-kt-chk-full', name: 'Full', price: 1200 },
        { id: 'var-kt-chk-half', name: 'Half', price: 800 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-kt-cheese',
      name: 'Cheese Chicken Kottu',
      categoryId: 'cat-kottu',
      basePrice: 1650,
      isAvailable: true,
      variants: [
        { id: 'var-kt-cheese-full', name: 'Full', price: 1650 },
        { id: 'var-kt-cheese-half', name: 'Half', price: 1150 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-kt-egg',
      name: 'Egg Kottu',
      categoryId: 'cat-kottu',
      basePrice: 850,
      isAvailable: true,
      variants: [
        { id: 'var-kt-egg-full', name: 'Full', price: 850 },
        { id: 'var-kt-egg-half', name: 'Half', price: 600 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-kt-dolphin',
      name: 'Dolphin Kottu (Kochchi Chicken)',
      categoryId: 'cat-kottu',
      basePrice: 1450,
      isAvailable: true,
      variants: [
        { id: 'var-kt-dolphin-full', name: 'Full', price: 1450 },
        { id: 'var-kt-dolphin-half', name: 'Half', price: 950 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // Fried Rice
    {
      id: 'prod-fr-chk',
      name: 'Chicken Fried Rice',
      categoryId: 'cat-fried-rice',
      basePrice: 1100,
      isAvailable: true,
      variants: [
        { id: 'var-fr-chk-full', name: 'Full', price: 1100 },
        { id: 'var-fr-chk-half', name: 'Half', price: 750 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-fr-mix',
      name: 'Mixed Fried Rice (Chicken + Seafood)',
      categoryId: 'cat-fried-rice',
      basePrice: 1400,
      isAvailable: true,
      variants: [
        { id: 'var-fr-mix-full', name: 'Full', price: 1400 },
        { id: 'var-fr-mix-half', name: 'Half', price: 950 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-fr-egg',
      name: 'Egg Fried Rice',
      categoryId: 'cat-fried-rice',
      basePrice: 800,
      isAvailable: true,
      variants: [
        { id: 'var-fr-egg-full', name: 'Full', price: 800 },
        { id: 'var-fr-egg-half', name: 'Half', price: 550 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // Short Eats
    {
      id: 'prod-se-roti',
      name: 'Pol Roti with Lunu Miris & Dhal',
      categoryId: 'cat-short-eats',
      basePrice: 280,
      isAvailable: true,
      variants: [
        { id: 'var-se-roti-reg', name: '2 Pieces Set', price: 280 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-se-roast-paan',
      name: 'Roast Paan with Pol Sambol & Curry',
      categoryId: 'cat-short-eats',
      basePrice: 350,
      isAvailable: true,
      variants: [
        { id: 'var-se-rp-reg', name: 'Regular Set', price: 350 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-se-cutlet',
      name: 'Sri Lankan Fish Cutlets (2 pcs)',
      categoryId: 'cat-short-eats',
      basePrice: 220,
      isAvailable: true,
      variants: [
        { id: 'var-se-cut-reg', name: '2 Pieces', price: 220 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-se-patty',
      name: 'Chicken Patty (2 pcs)',
      categoryId: 'cat-short-eats',
      basePrice: 240,
      isAvailable: true,
      variants: [
        { id: 'var-se-pat-reg', name: '2 Pieces', price: 240 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // Beverages
    {
      id: 'prod-bev-faluda',
      name: 'Special Faluda with Ice Cream',
      categoryId: 'cat-beverages',
      basePrice: 450,
      isAvailable: true,
      variants: [
        { id: 'var-bev-fal-reg', name: 'Large Glass', price: 450 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-bev-lime',
      name: 'Fresh Lime Juice',
      categoryId: 'cat-beverages',
      basePrice: 320,
      isAvailable: true,
      variants: [
        { id: 'var-bev-lime-reg', name: 'Regular', price: 320 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-bev-tea',
      name: 'Ceylon Spiced Milk Tea',
      categoryId: 'cat-beverages',
      basePrice: 180,
      isAvailable: true,
      variants: [
        { id: 'var-bev-tea-reg', name: 'Hot Cup', price: 180 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-bev-coke',
      name: 'Coca-Cola 400ml Glass Bottle',
      categoryId: 'cat-beverages',
      basePrice: 180,
      isAvailable: true,
      variants: [
        { id: 'var-bev-coke-reg', name: '400ml Bottle', price: 180 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const diningTables = [
    { id: 'tbl-01', number: 'T-01', capacity: 4, isOccupied: false },
    { id: 'tbl-02', number: 'T-02', capacity: 4, isOccupied: false },
    { id: 'tbl-03', number: 'T-03', capacity: 2, isOccupied: false },
    { id: 'tbl-04', number: 'T-04', capacity: 6, isOccupied: false },
    { id: 'tbl-05', number: 'T-05', capacity: 4, isOccupied: false },
    { id: 'tbl-06', number: 'T-06', capacity: 8, isOccupied: false },
    { id: 'tbl-07', number: 'T-07', capacity: 2, isOccupied: false },
    { id: 'tbl-08', number: 'T-08', capacity: 4, isOccupied: false },
  ];

  return { users, categories, products, diningTables };
}

module.exports = { getSeedData };
