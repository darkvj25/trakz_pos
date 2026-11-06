const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { RIDER_FEE_MATRIX, CONVENIENCE_FEE_MATRIX, getRiderFeeDetails, getConvenienceFeeDetails } = require('../src/utils/riderFeeMatrix');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding TRAKZ On-Premise POS database (Merchant Store POS)...');

  // 1. Seed Rider Fee Matrix Table in Database
  await prisma.riderFeeMatrix.deleteMany({});
  for (const matrixRow of RIDER_FEE_MATRIX) {
    await prisma.riderFeeMatrix.create({
      data: {
        minKm: matrixRow.minKm,
        maxKm: matrixRow.maxKm,
        label: matrixRow.label,
        customerFee: matrixRow.customerFee,
        riderPayout: matrixRow.riderPayout,
        trakzMargin: matrixRow.margin,
        inclusiveMax: matrixRow.inclusiveMax,
      },
    });
  }
  console.log(`Seeded ${RIDER_FEE_MATRIX.length} Rider Fee Matrix Tiers in Database.`);

  // 1b. Seed Customer Convenience Fee Matrix Table in Database
  await prisma.convenienceFeeMatrix.deleteMany({});
  for (const row of CONVENIENCE_FEE_MATRIX) {
    await prisma.convenienceFeeMatrix.create({
      data: {
        minSubtotal: row.minSubtotal,
        maxSubtotal: isFinite(row.maxSubtotal) ? row.maxSubtotal : null,
        label: row.label,
        fee: row.fee,
        inclusiveMax: row.inclusiveMax,
      },
    });
  }
  console.log(`Seeded ${CONVENIENCE_FEE_MATRIX.length} Convenience Fee Matrix Tiers in Database.`);

  // 2. Seed Merchants
  const merchantsData = [
    { externalMerchantId: 'MERCH-001', merchantName: 'TRAKZ Central Hardware & Supply' },
    { externalMerchantId: 'MERCH-002', merchantName: 'Metro Gourmet & Retail Mart' },
    { externalMerchantId: 'MERCH-003', merchantName: 'Manila Express Electronics' },
    { externalMerchantId: 'MERCH-004', merchantName: 'Bistro De Filipinas & Merchandise' },
  ];

  const merchants = [];
  for (const m of merchantsData) {
    const merchant = await prisma.merchant.upsert({
      where: { externalMerchantId: m.externalMerchantId },
      update: {},
      create: {
        externalMerchantId: m.externalMerchantId,
        merchantName: m.merchantName,
        status: 'ACTIVE',
      },
    });
    merchants.push(merchant);
  }
  console.log(`Seeded ${merchants.length} Merchants`);

  // 3. Seed Merchant Store Admin & Cashier Users
  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@trakz.com' },
    update: {
      merchantId: merchants[0].id,
      role: 'MERCHANT_ADMIN',
    },
    create: {
      merchantId: merchants[0].id,
      name: 'Central Store Manager',
      email: 'admin@trakz.com',
      passwordHash,
      role: 'MERCHANT_ADMIN',
      isActive: true,
    },
  });

  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@trakz.com' },
    update: {
      merchantId: merchants[0].id,
      role: 'CASHIER',
    },
    create: {
      merchantId: merchants[0].id,
      name: 'Terminal 1 Cashier',
      email: 'cashier@trakz.com',
      passwordHash,
      role: 'CASHIER',
      isActive: true,
    },
  });

  console.log(`Created Merchant Users: ${admin.email} (MERCHANT_ADMIN), ${cashier.email} (CASHIER)`);

  // 4. Clear existing orders and payments for seed reset
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});

  // 5. Seed Food & Non-Food Orders
  const mockOrders = [
    {
      externalOrderId: 'POS-2026-9081',
      merchantIndex: 0,
      customerName: 'Juan Dela Cruz',
      daysAgo: 0,
      subtotal: 3450.00,
      deliveryDistance: 12.0, // >11-15 km -> customer 95, rider 80, margin 15
      deliveryFee: 95.00,
      discount: 150.00,
      paymentMethod: 'GCASH',
      paymentStatus: 'PAID',
      paymentTxStatus: 'SUCCESSFUL',
      orderStatus: 'DELIVERED',
      refNo: 'GCASH-REF-992144',
      items: [
        { sku: 'RET-SCN-01', barcode: '4806512349012', productName: 'Wireless Bluetooth 2D Barcode Scanner', category: 'NON_FOOD_RETAIL', categoryName: 'Retail Electronics', quantity: 1, unitPrice: 2250.00, unit: 'unit' },
        { sku: 'RET-PPR-80', barcode: '4806512349029', productName: '80mm Thermal Receipt Paper Roll (Box of 50)', category: 'NON_FOOD_RETAIL', categoryName: 'POS Consumables', quantity: 1, unitPrice: 1200.00, unit: 'box' },
      ]
    },
    {
      externalOrderId: 'POS-2026-9082',
      merchantIndex: 1,
      customerName: 'Maria Clara Santos',
      daysAgo: 0,
      subtotal: 1880.00,
      deliveryDistance: 2.5, // >2-3 km -> customer 50, rider 43, margin 7
      deliveryFee: 50.00,
      discount: 0.00,
      paymentMethod: 'CREDIT_CARD',
      paymentStatus: 'PAID',
      paymentTxStatus: 'SUCCESSFUL',
      orderStatus: 'IN_TRANSIT',
      refNo: 'CC-AUTH-884120',
      items: [
        { sku: 'FOD-CM-02', barcode: '4806512349036', productName: 'Premium Arabica Coffee Beans 1kg', category: 'FOOD', categoryName: 'Food & Beverage', quantity: 2, unitPrice: 650.00, unit: 'pack' },
        { sku: 'RET-CUP-01', barcode: '4806512349043', productName: 'Stainless Steel Insulated Tumbler 500ml', category: 'NON_FOOD_RETAIL', categoryName: 'General Merchandise', quantity: 1, unitPrice: 580.00, unit: 'pcs' },
      ]
    },
    {
      externalOrderId: 'POS-2026-9083',
      merchantIndex: 2,
      customerName: 'Antonio Luna',
      daysAgo: 1,
      subtotal: 5400.00,
      deliveryDistance: 15.0, // >11-15 km -> customer 95, rider 80, margin 15
      deliveryFee: 95.00,
      discount: 300.00,
      paymentMethod: 'CASH',
      paymentStatus: 'PAID',
      paymentTxStatus: 'SUCCESSFUL',
      orderStatus: 'DELIVERED',
      refNo: 'CASH-REC-10023',
      items: [
        { sku: 'HDW-DRW-04', barcode: '4806512349050', productName: 'Heavy-Duty 5-Bill Cash Drawer RJ11', category: 'HARDWARE_GROCERY', categoryName: 'POS Hardware', quantity: 1, unitPrice: 3800.00, unit: 'pcs' },
        { sku: 'RET-LBL-02', barcode: '4806512349067', productName: 'Barcode Thermal Sticker Labels 50x30mm', category: 'NON_FOOD_RETAIL', categoryName: 'POS Consumables', quantity: 4, unitPrice: 400.00, unit: 'roll' },
      ]
    },
    {
      externalOrderId: 'POS-2026-9084',
      merchantIndex: 3,
      customerName: 'Gabriela Silang',
      daysAgo: 1,
      subtotal: 1250.00,
      deliveryDistance: 5.5, // >5-6 km -> customer 65, rider 55, margin 10
      deliveryFee: 65.00,
      discount: 0.00,
      paymentMethod: 'ONLINE_PAYMENT',
      paymentStatus: 'PENDING',
      paymentTxStatus: 'PENDING',
      orderStatus: 'PENDING',
      refNo: 'PAY-PEND-331299',
      items: [
        { sku: 'FOD-BEEF-01', barcode: '4806512349074', productName: 'Beef Sinigang Meal Box', category: 'FOOD', categoryName: 'Food & Beverage', quantity: 1, unitPrice: 650.00, unit: 'box' },
        { sku: 'RET-APRN-01', barcode: '4806512349081', productName: 'Commercial Heavy Canvas Apron', category: 'NON_FOOD_RETAIL', categoryName: 'Apparel & Uniforms', quantity: 1, unitPrice: 600.00, unit: 'pcs' },
      ]
    },
    {
      externalOrderId: 'POS-2026-9085',
      merchantIndex: 0,
      customerName: 'Jose Rizal',
      daysAgo: 2,
      subtotal: 2850.00,
      deliveryDistance: 7.5, // >7-8 km -> customer 75, rider 65, margin 10
      deliveryFee: 75.00,
      discount: 100.00,
      paymentMethod: 'DEBIT_CARD',
      paymentStatus: 'PAID',
      paymentTxStatus: 'SUCCESSFUL',
      orderStatus: 'DELIVERED',
      refNo: 'DEBIT-REF-771190',
      items: [
        { sku: 'RET-UPS-01', barcode: '4806512349098', productName: 'Uninterruptible Power Supply (UPS 650VA)', category: 'NON_FOOD_RETAIL', categoryName: 'Electronics', quantity: 1, unitPrice: 2850.00, unit: 'unit' },
      ]
    },
    {
      externalOrderId: 'POS-2026-9086',
      merchantIndex: 1,
      customerName: 'Andres Bonifacio',
      daysAgo: 2,
      subtotal: 950.00,
      deliveryDistance: 2.8, // >2-3 km -> customer 50, rider 43, margin 7
      deliveryFee: 50.00,
      discount: 0.00,
      paymentMethod: 'GCASH',
      paymentStatus: 'FAILED',
      paymentTxStatus: 'FAILED',
      orderStatus: 'CANCELLED',
      refNo: 'GCASH-ERR-00129',
      items: [
        { sku: 'FOD-SIS-02', barcode: '4806512349104', productName: 'Pork Sisig Rice Combo Pack', category: 'FOOD', categoryName: 'Food & Beverage', quantity: 2, unitPrice: 225.00, unit: 'pack' },
        { sku: 'RET-CLOTH-01', barcode: '4806512349111', productName: 'Microfiber Cleaning Cloths 10s', category: 'NON_FOOD_RETAIL', categoryName: 'General Merchandise', quantity: 2, unitPrice: 250.00, unit: 'pack' },
      ]
    }
  ];

  for (let i = 0; i < mockOrders.length; i++) {
    const itemData = mockOrders[i];
    const merchant = merchants[itemData.merchantIndex];
    const date = new Date();
    date.setDate(date.getDate() - itemData.daysAgo);

    const feeBreakdown = getRiderFeeDetails(itemData.deliveryDistance) || {
      customerFee: itemData.deliveryFee,
      riderPayout: itemData.deliveryFee * 0.8,
      trakzMargin: itemData.deliveryFee * 0.2,
    };
    const convenienceDetails = getConvenienceFeeDetails(itemData.subtotal);
    const convenienceFee = convenienceDetails ? convenienceDetails.convenienceFee : 0;
    const riderTip = itemData.riderTip || (i === 0 ? 50.00 : i === 1 ? 20.00 : 0.00);

    const customerFee = feeBreakdown.customerFee;
    const totalAmount = itemData.subtotal + customerFee + convenienceFee + riderTip - itemData.discount;

    const createdOrder = await prisma.order.create({
      data: {
        externalOrderId: itemData.externalOrderId,
        merchantId: merchant.id,
        customerName: itemData.customerName,
        orderDate: date,
        subtotal: itemData.subtotal,
        deliveryDistance: itemData.deliveryDistance,
        deliveryFee: customerFee,
        convenienceFee: convenienceFee,
        riderTip: riderTip,
        riderPayout: feeBreakdown.riderPayout,
        trakzMargin: feeBreakdown.trakzMargin,
        discount: itemData.discount,
        totalAmount: totalAmount,
        paymentStatus: itemData.paymentStatus,
        orderStatus: itemData.orderStatus,
        source: 'TRAKZ_ONPREM_POS',
        firestoreSynced: true,
        firestoreDocId: `firestore_doc_${itemData.externalOrderId}`,
        syncedAt: new Date(),
        orderItems: {
          create: itemData.items.map((it) => ({
            externalProductId: `PROD-${it.sku}`,
            sku: it.sku,
            barcode: it.barcode,
            productName: it.productName,
            category: it.category,
            categoryName: it.categoryName,
            unit: it.unit,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            subtotal: it.quantity * it.unitPrice,
          }))
        }
      }
    });

    // Create Payment transaction record
    await prisma.payment.create({
      data: {
        externalPaymentId: `PAY-${itemData.externalOrderId}`,
        orderId: createdOrder.id,
        merchantId: merchant.id,
        paymentMethod: itemData.paymentMethod,
        referenceNumber: itemData.refNo,
        amount: totalAmount,
        paymentStatus: itemTxStatus(itemData.paymentTxStatus),
        paymentDate: date,
        firestoreSynced: true,
        syncedAt: new Date(),
      }
    });
  }

  function itemTxStatus(st) {
    switch (st) {
      case 'SUCCESSFUL': return 'SUCCESSFUL';
      case 'PENDING': return 'PENDING';
      case 'FAILED': return 'FAILED';
      default: return 'SUCCESSFUL';
    }
  }

  // 6. Seed Initial Sync Log
  await prisma.syncLog.create({
    data: {
      syncType: 'FIRESTORE_PUSH',
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(),
      status: 'SUCCESS',
      recordsProcessed: mockOrders.length,
      recordsFailed: 0,
    }
  });

  // 7. Seed System Settings
  const settings = [
    { settingKey: 'SYNC_MODE', settingValue: 'ONLINE_FIRST_WITH_SAFETY_BACKUP' },
    { settingKey: 'TRAKZ_FIRESTORE_ENABLED', settingValue: 'true' },
    { settingKey: 'SYNC_INTERVAL_MINUTES', settingValue: '5' },
    { settingKey: 'SYSTEM_CURRENCY', settingValue: 'PHP' },
    { settingKey: 'TIMEZONE', settingValue: 'Asia/Manila' },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { settingKey: s.settingKey },
      update: { settingValue: s.settingValue },
      create: s,
    });
  }

  console.log('Database seeded successfully with Rider Fee Matrix & Orders!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
