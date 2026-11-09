import { PrismaClient, UserRole, ProductCondition, OrderStatus, TradeInStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing tables in reverse dependency order
  await prisma.tradeInInspection.deleteMany();
  await prisma.tradeInRequest.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const customerPassword = await bcrypt.hash('customer123', salt);
  const inspectorPassword = await bcrypt.hash('inspector123', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@nexusgadgets.com',
      firstName: 'Alex',
      lastName: 'Vance',
      role: UserRole.ADMIN,
      passwordHash: adminPassword,
      phone: '+91 9876543210',
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CUSTOMER,
      passwordHash: customerPassword,
      phone: '+91 9812345678',
      addresses: {
        create: {
          fullName: 'John Doe',
          phone: '+91 9812345678',
          streetLine1: '42 Cyber City, Tech Park Phase 2',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560100',
          country: 'India',
          isDefault: true,
        },
      },
    },
    include: { addresses: true },
  });

  const inspector = await prisma.user.create({
    data: {
      email: 'inspector@nexusgadgets.com',
      firstName: 'Marcus',
      lastName: 'Wright',
      role: UserRole.INSPECTION_AGENT,
      passwordHash: inspectorPassword,
      phone: '+91 9900112233',
    },
  });

  console.log('✅ Users seeded');

  // 2. Create Brands
  const apple = await prisma.brand.create({ data: { name: 'Apple', slug: 'apple' } });
  const samsung = await prisma.brand.create({ data: { name: 'Samsung', slug: 'samsung' } });
  const google = await prisma.brand.create({ data: { name: 'Google', slug: 'google' } });
  const anker = await prisma.brand.create({ data: { name: 'Anker', slug: 'anker' } });
  const satechi = await prisma.brand.create({ data: { name: 'Satechi', slug: 'satechi' } });
  const keychron = await prisma.brand.create({ data: { name: 'Keychron', slug: 'keychron' } });
  const tomtoc = await prisma.brand.create({ data: { name: 'Tomtoc', slug: 'tomtoc' } });
  const belkin = await prisma.brand.create({ data: { name: 'Belkin', slug: 'belkin' } });

  // 3. Create Categories
  const catPhones = await prisma.category.create({
    data: { name: 'Smartphones', slug: 'smartphones', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80' },
  });
  const catChargers = await prisma.category.create({
    data: { name: 'GaN Chargers & Power Banks', slug: 'chargers-power', imageUrl: 'https://images.unsplash.com/photo-1622445268462-348574043161?w=600&q=80' },
  });
  const catDocks = await prisma.category.create({
    data: { name: 'Docks & USB-C Hubs', slug: 'docks-hubs', imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80' },
  });
  const catKeyboards = await prisma.category.create({
    data: { name: 'Keyboards & Peripherals', slug: 'keyboards-mice', imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80' },
  });
  const catSleeves = await prisma.category.create({
    data: { name: 'Laptop Sleeves & Protection', slug: 'sleeves-protection', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80' },
  });

  console.log('✅ Brands & Categories seeded');

  // 4. Create Products & Variants
  // Product 1: iPhone 15 Pro
  const p1 = await prisma.product.create({
    data: {
      name: 'iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max',
      description: 'Forged in titanium with the groundbreaking A17 Pro chip, customizable Action button, and 5x optical zoom camera system.',
      categoryId: catPhones.id,
      brandId: apple.id,
      isFeatured: true,
      compatibility: ['MagSafe Ecosystem', 'USB-C DisplayPort 4K', 'Qi2 Wireless Charging'],
      baseSpecs: {
        chip: 'Apple A17 Pro',
        display: '6.7-inch Super Retina XDR OLED 120Hz',
        port: 'USB-C 3.2 Gen 2 (up to 10Gbps)',
        battery: '4422 mAh',
      },
      variants: {
        create: [
          {
            sku: 'IPH-15PM-256-NEW-NAT',
            title: '256GB - Natural Titanium (Brand New)',
            condition: ProductCondition.BRAND_NEW,
            price: 134900,
            compareAtPrice: 159900,
            stock: 8,
            isSerialized: true,
            attributes: { color: 'Natural Titanium', storage: '256GB' },
            images: [
              'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
              'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80',
            ],
          },
          {
            sku: 'IPH-15PM-256-REF-EXC',
            title: '256GB - Blue Titanium (Refurbished Excellent - Grade A)',
            condition: ProductCondition.REFURBISHED_EXCELLENT,
            price: 109900,
            compareAtPrice: 159900,
            stock: 5,
            isSerialized: true,
            attributes: { color: 'Blue Titanium', storage: '256GB', batteryHealth: '96%' },
            images: [
              'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
            ],
          },
        ],
      },
    },
    include: { variants: true },
  });

  // Product 2: Samsung S24 Ultra
  const p2 = await prisma.product.create({
    data: {
      name: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-galaxy-s24-ultra',
      description: 'Titanium frame, flat 6.8-inch Dynamic AMOLED 2X display, embedded S Pen, Snapdragon 8 Gen 3 for Galaxy, and Galaxy AI capabilities.',
      categoryId: catPhones.id,
      brandId: samsung.id,
      isFeatured: true,
      compatibility: ['Samsung DeX', 'Fast Wireless Charging 2.0', 'S-Pen Integrated'],
      baseSpecs: {
        chip: 'Snapdragon 8 Gen 3',
        display: '6.8-inch QHD+ 120Hz',
        port: 'USB-C 3.2',
        battery: '5000 mAh',
      },
      variants: {
        create: [
          {
            sku: 'SAM-S24U-512-NEW-BLK',
            title: '512GB - Titanium Black (Brand New)',
            condition: ProductCondition.BRAND_NEW,
            price: 129999,
            compareAtPrice: 144999,
            stock: 6,
            isSerialized: true,
            attributes: { color: 'Titanium Black', storage: '512GB' },
            images: [
              'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
            ],
          },
          {
            sku: 'SAM-S24U-256-OPN-GRY',
            title: '256GB - Titanium Gray (Open Box - Like New)',
            condition: ProductCondition.OPEN_BOX,
            price: 104999,
            compareAtPrice: 129999,
            stock: 3,
            isSerialized: true,
            attributes: { color: 'Titanium Gray', storage: '256GB' },
            images: [
              'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
            ],
          },
        ],
      },
    },
    include: { variants: true },
  });

  // Product 3: Anker 737 GaN 140W Power Bank
  const p3 = await prisma.product.create({
    data: {
      name: 'Anker 737 140W Power Bank (PowerCore 24K)',
      slug: 'anker-737-power-bank-140w',
      description: 'Equipped with Power Delivery 3.1 and bi-directional technology to fast-charge portable laptops like MacBook Pro 16", Dell XPS, and flagship phones at 140W.',
      categoryId: catChargers.id,
      brandId: anker.id,
      isFeatured: true,
      compatibility: ['MacBook Pro M1/M2/M3 (up to 140W)', 'Dell XPS 13/15', 'Lenovo ThinkPad', 'iPhone 15/16', 'Samsung Galaxy S24/S23'],
      baseSpecs: {
        capacity: '24,000 mAh',
        maxOutput: '140W Single Port / 140W Total',
        ports: '2x USB-C, 1x USB-A',
        screen: 'Smart Digital Display with real-time wattage',
      },
      variants: {
        create: [
          {
            sku: 'ANK-737-140W-NEW',
            title: '24,000mAh 140W - Brand New',
            condition: ProductCondition.BRAND_NEW,
            price: 9999,
            compareAtPrice: 13999,
            stock: 25,
            isSerialized: false,
            attributes: { color: 'Charcoal Black', wattage: '140W' },
            images: [
              'https://images.unsplash.com/photo-1622445268462-348574043161?w=800&q=80',
            ],
          },
        ],
      },
    },
    include: { variants: true },
  });

  // Product 4: Satechi Triple 4K Display Docking Station
  const p4 = await prisma.product.create({
    data: {
      name: 'Satechi Triple 4K Display Universal Docking Station',
      slug: 'satechi-triple-4k-display-docking-station',
      description: 'Connect up to three 4K 60Hz displays via DisplayLink technology. Delivers 100W Power Delivery pass-through charging, Gigabit Ethernet, audio jack, and multiple high-speed USB ports.',
      categoryId: catDocks.id,
      brandId: satechi.id,
      isFeatured: true,
      compatibility: ['MacBook Pro / Air (M1, M2, M3 Base & Pro/Max)', 'Dell XPS & Latitude', 'HP Spectre & Envy', 'Windows 11 Thunderbolt 4'],
      baseSpecs: {
        powerDelivery: '100W PD to host laptop',
        displayOutputs: '3x DisplayPort, 3x HDMI (up to 4K @ 60Hz)',
        ethernet: '10/100/1000 Mbps RJ45',
        usbPorts: '3x USB 3.0, 2x USB-C 10Gbps',
      },
      variants: {
        create: [
          {
            sku: 'SAT-TRIPLE-4K-DOCK-NEW',
            title: 'Space Gray - Brand New',
            condition: ProductCondition.BRAND_NEW,
            price: 18999,
            compareAtPrice: 24999,
            stock: 12,
            isSerialized: true,
            attributes: { color: 'Space Gray', displayCount: 'Triple 4K' },
            images: [
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
            ],
          },
          {
            sku: 'SAT-TRIPLE-4K-DOCK-REF',
            title: 'Space Gray - Refurbished Grade A (Tested & Certified)',
            condition: ProductCondition.REFURBISHED_EXCELLENT,
            price: 13999,
            compareAtPrice: 24999,
            stock: 4,
            isSerialized: true,
            attributes: { color: 'Space Gray', condition: 'Tested & Verified' },
            images: [
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
            ],
          },
        ],
      },
    },
    include: { variants: true },
  });

  // Product 5: Keychron K2 Pro Mechanical Keyboard
  const p5 = await prisma.product.create({
    data: {
      name: 'Keychron K2 Pro QMK/VIA Wireless Mechanical Keyboard',
      slug: 'keychron-k2-pro-wireless-mechanical-keyboard',
      description: '75% compact layout wireless mechanical keyboard with hot-swappable switches, south-facing RGB, PBT keycaps, and full macOS / Windows layout support.',
      categoryId: catKeyboards.id,
      brandId: keychron.id,
      isFeatured: false,
      compatibility: ['macOS Native Layout (Command & Option keys)', 'Windows 11 / 10', 'iOS & Android via Bluetooth 5.1'],
      baseSpecs: {
        connectivity: 'Bluetooth 5.1 & Type-C Wired',
        switches: 'Keychron K Pro Red (Linear) / Brown (Tactile)',
        battery: '4000 mAh (up to 300 hours)',
      },
      variants: {
        create: [
          {
            sku: 'KEY-K2PRO-RED-NEW',
            title: 'RGB Backlit / K Pro Red Linear Switches (Brand New)',
            condition: ProductCondition.BRAND_NEW,
            price: 8499,
            compareAtPrice: 10499,
            stock: 15,
            isSerialized: false,
            attributes: { switches: 'Red Linear', layout: '75%' },
            images: [
              'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
            ],
          },
        ],
      },
    },
    include: { variants: true },
  });

  // Product 6: Tomtoc 360 ArmorDefender Laptop Sleeve
  const p6 = await prisma.product.create({
    data: {
      name: 'Tomtoc 360 Protective Laptop Sleeve (14-16 inch)',
      slug: 'tomtoc-360-protective-laptop-sleeve',
      description: 'Military-grade CornerArmor technology, thick protective padding, water-resistant recycled fabric, and front accessories pocket for chargers & adapters.',
      categoryId: catSleeves.id,
      brandId: tomtoc.id,
      isFeatured: false,
      compatibility: ['MacBook Pro 14" & 16" (M1/M2/M3)', 'Dell XPS 15', 'Lenovo ThinkPad X1 Carbon 14"', 'ASUS Zenbook 14'],
      baseSpecs: {
        protection: 'CornerArmor patent drop-protection',
        material: 'Cordura ballistic water-resistant nylon',
        zippers: 'YKK waterproof zippers',
      },
      variants: {
        create: [
          {
            sku: 'TOM-SLEEVE-14-BLK',
            title: '14-inch - Tactical Black (Brand New)',
            condition: ProductCondition.BRAND_NEW,
            price: 2899,
            compareAtPrice: 3999,
            stock: 30,
            isSerialized: false,
            attributes: { size: '14-inch', color: 'Tactical Black' },
            images: [
              'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
            ],
          },
        ],
      },
    },
    include: { variants: true },
  });

  console.log('✅ Products & Variants seeded');

  // 5. Create Sample Orders for John Doe
  const sampleOrder1 = await prisma.order.create({
    data: {
      orderNumber: 'NX-89421',
      userId: customer.id,
      status: OrderStatus.SHIPPED,
      subtotal: 109900,
      shippingFee: 0,
      totalAmount: 109900,
      trackingNumber: 'BLUEDART-847291034',
      courierPartner: 'BlueDart Express',
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      shippingAddress: {
        fullName: 'John Doe',
        phone: '+91 9812345678',
        streetLine1: '42 Cyber City, Tech Park Phase 2',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560100',
      },
      timeline: [
        { status: 'CONFIRMED', title: 'Order Placed & Payment Verified', timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString() },
        { status: 'PROCESSING', title: 'Quality Checked & Serial Number Allocated at Bengaluru Hub', timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString() },
        { status: 'SHIPPED', title: 'Dispatched via BlueDart Express (Air Cargo)', timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString() },
        { status: 'OUT_FOR_DELIVERY', title: 'Out for delivery with courier agent Rajesh (Expected by 5:00 PM)', timestamp: new Date().toISOString() },
      ],
      items: {
        create: [
          {
            variantId: p1.variants[1].id, // Refurbished iPhone 15 Pro
            quantity: 1,
            unitPrice: 109900,
            totalPrice: 109900,
            variantSnapshot: {
              name: 'iPhone 15 Pro Max',
              variantTitle: '256GB - Blue Titanium (Refurbished Excellent - Grade A)',
              condition: 'REFURBISHED_EXCELLENT',
              sku: 'IPH-15PM-256-REF-EXC',
              image: p1.variants[1].images[0],
            },
          },
        ],
      },
    },
  });

  const sampleOrder2 = await prisma.order.create({
    data: {
      orderNumber: 'NX-90112',
      userId: customer.id,
      status: OrderStatus.DELIVERED,
      subtotal: 12898,
      shippingFee: 0,
      totalAmount: 12898,
      trackingNumber: 'DELHIVERY-9921448',
      courierPartner: 'Delhivery Surface',
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      shippingAddress: {
        fullName: 'John Doe',
        phone: '+91 9812345678',
        streetLine1: '42 Cyber City, Tech Park Phase 2',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560100',
      },
      timeline: [
        { status: 'CONFIRMED', title: 'Order Verified', timestamp: new Date(Date.now() - 96 * 3600 * 1000).toISOString() },
        { status: 'SHIPPED', title: 'Dispatched via Delhivery', timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString() },
        { status: 'DELIVERED', title: 'Delivered and Signed by Customer', timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
      ],
      items: {
        create: [
          {
            variantId: p3.variants[0].id, // Anker Power Bank
            quantity: 1,
            unitPrice: 9999,
            totalPrice: 9999,
            variantSnapshot: {
              name: 'Anker 737 140W Power Bank',
              variantTitle: '24,000mAh 140W - Brand New',
              condition: 'BRAND_NEW',
              sku: 'ANK-737-140W-NEW',
              image: p3.variants[0].images[0],
            },
          },
          {
            variantId: p6.variants[0].id, // Tomtoc Sleeve
            quantity: 1,
            unitPrice: 2899,
            totalPrice: 2899,
            variantSnapshot: {
              name: 'Tomtoc 360 Protective Laptop Sleeve',
              variantTitle: '14-inch - Tactical Black',
              condition: 'BRAND_NEW',
              sku: 'TOM-SLEEVE-14-BLK',
              image: p6.variants[0].images[0],
            },
          },
        ],
      },
    },
  });

  // 6. Create Sample Trade-In Request (Selling used phone)
  const tradeIn1 = await prisma.tradeInRequest.create({
    data: {
      requestNumber: 'TI-88310',
      userId: customer.id,
      deviceType: 'SMARTPHONE',
      brand: 'Apple',
      modelName: 'iPhone 13 (128GB)',
      declaredSpecs: {
        storage: '128GB',
        color: 'Midnight',
        batteryHealth: '87%',
      },
      conditionAnswers: {
        screenCondition: 'FLAWLESS',
        bodyCondition: 'MINOR_SCUFFS',
        camerasFunctional: true,
        faceIdFunctional: true,
        hasOriginalBox: true,
      },
      initialQuotedPrice: 34500,
      status: TradeInStatus.RECEIVED_AT_FACILITY,
      pickupAddress: {
        fullName: 'John Doe',
        phone: '+91 9812345678',
        streetLine1: '42 Cyber City, Tech Park Phase 2',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560100',
      },
      payoutMethod: 'UPI',
      payoutDetails: {
        upiId: 'john.doe@okhdfcbank',
      },
      inspection: {
        create: {
          inspectorId: inspector.id,
          serialOrImei: '354892019842103',
          screenPassed: true,
          bodyPassed: true,
          batteryHealth: 88,
          functionalTests: {
            touch: true,
            cameras: true,
            speakers: true,
            wirelessCharging: true,
          },
          assignedGrade: ProductCondition.REFURBISHED_EXCELLENT,
          notes: 'Device is in pristine cosmetic state. Battery health verified at 88%. Approved for instant payout.',
        },
      },
    },
  });

  console.log('✅ Orders and Trade-In requests seeded');
  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

