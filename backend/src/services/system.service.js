const prisma = require('../config/db');
const { exec } = require('child_process');
const path = require('path');

class SystemService {
  async getSystemStatus() {
    let dbConnected = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
    } catch (e) {
      dbConnected = false;
    }

    return {
      status: 'ONLINE',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        type: 'PostgreSQL',
      },
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    };
  }

  async getLogs(limit = 50) {
    const logs = await prisma.auditLog.findMany({
      take: parseInt(limit, 10) || 50,
      orderBy: { createdAt: 'desc' },
    });
    return logs;
  }

  async getSettings() {
    const settings = await prisma.systemSetting.findMany();
    return settings.reduce((acc, curr) => {
      acc[curr.settingKey] = curr.settingValue;
      return acc;
    }, {});
  }

  async resetDemoData(confirm = false, userId = null) {
    if (!confirm) {
      throw { statusCode: 400, message: 'Reset request requires explicit confirmation payload.' };
    }

    // Execute database re-seeding safely
    const seedPath = path.join(__dirname, '../../prisma/seed.js');

    // Clear dynamic demo records in order
    await prisma.payment.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.syncLog.deleteMany({});

    // Record audit log of demo reset action
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DEMO_DATA_RESET',
        description: 'Local demo order & payment data was reset and re-seeded',
      },
    });

    // Run seed file logic internally
    const seedModule = require('../../prisma/seed.js');

    return {
      success: true,
      message: 'Local demo data reset successfully.',
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new SystemService();
