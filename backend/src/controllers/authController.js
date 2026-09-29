const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { logActivity } = require('../utils/auditLogger');

// Register Tenant Company + Admin
const registerTenant = async (req, res) => {
  try {
    const { companyName, domain, email, password, firstName, lastName } = req.body;

    const existingCompany = await prisma.company.findFirst({
      where: { OR: [{ name: companyName }, { domain }] }
    });

    if (existingCompany) {
      return res.status(400).json({ success: false, message: 'Company or domain already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: { name: companyName, domain }
      });

      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'ADMIN',
          companyId: company.id
        }
      });

      return { company, user };
    });

    // Audit Log Entry
    await logActivity({
      tenantId: result.company.id,
      userId: result.user.id,
      userName: `${firstName} ${lastName}`,
      userEmail: result.user.email,
      action: 'TENANT_REGISTERED',
      details: `Registered company ${companyName} with domain ${domain}`,
      req
    });

    res.status(201).json({
      success: true,
      message: 'Tenant registered successfully.',
      data: {
        company: result.company,
        user: { id: result.user.id, email: result.user.email, role: result.user.role }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { email, isDeleted: false },
      include: { company: true }
    });

    if (!user || user.company.isDeleted) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or tenant inactive.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, companyId: user.companyId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    // Audit Log Entry
    await logActivity({
      tenantId: user.companyId,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      action: 'TENANT_LOGIN',
      details: 'User logged into workspace successfully',
      req
    });

    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, role: user.role, companyId: user.companyId }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { registerTenant, login };