const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const logActivity = async ({ tenantId, userId, userName, userEmail, action, details, req }) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : null;
    
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        userName,
        userEmail,
        action,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        ipAddress,
      },
    });
  } catch (error) {
    console.error('Failed to log audit activity:', error);
  }
};

module.exports = { logActivity };