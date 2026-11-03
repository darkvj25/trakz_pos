const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const { generateToken } = require('../config/jwt');

class AuthService {
  async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { merchant: true },
    });

    if (!user) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    if (!user.isActive) {
      throw { statusCode: 403, message: 'Account is deactivated' };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      merchantId: user.merchantId,
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        description: `Merchant User ${user.email} logged in successfully`,
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        merchantId: user.merchantId,
        merchantName: user.merchant ? user.merchant.merchantName : 'Merchant POS Store',
        externalMerchantId: user.merchant ? user.merchant.externalMerchantId : null,
      },
      token,
    };
  }

  async getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        merchantId: true,
        merchant: { select: { id: true, merchantName: true, externalMerchantId: true } },
        createdAt: true,
      },
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return {
      ...user,
      merchantName: user.merchant ? user.merchant.merchantName : 'Merchant POS Store',
      externalMerchantId: user.merchant ? user.merchant.externalMerchantId : null,
    };
  }

  async logout(userId) {
    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'USER_LOGOUT',
          description: `User logged out`,
        },
      });
    }
    return true;
  }
}

module.exports = new AuthService();
