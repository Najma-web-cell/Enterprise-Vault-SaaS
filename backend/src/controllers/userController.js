const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { logActivity } = require('../utils/auditLogger');

// 1. Get all users of current tenant
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { companyId: req.user.companyId, isDeleted: false },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Create User inside tenant (Admin / Manager only)
const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'EMPLOYEE',
        companyId: req.user.companyId
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true }
    });

    // 🛡️ Audit Log Trigger: Member Create Hone Par
    await logActivity({
      tenantId: req.user.companyId,
      userId: req.user.id,
      userName: req.user.email,
      userEmail: req.user.email,
      action: 'MEMBER_CREATED',
      details: `Added new member ${user.email} with role ${user.role}`,
      req
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Update User
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role } = req.body;

    const user = await prisma.user.findFirst({
      where: { id, companyId: req.user.companyId, isDeleted: false }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { firstName, lastName, role },
      select: { id: true, email: true, firstName: true, lastName: true, role: true }
    });

    // 🛡️ Audit Log Trigger: Member Update Hone Par
    await logActivity({
      tenantId: req.user.companyId,
      userId: req.user.id,
      userName: req.user.email,
      userEmail: req.user.email,
      action: 'MEMBER_UPDATED',
      details: `Updated details for ${updatedUser.email}`,
      req
    });

    res.json({ success: true, message: 'User updated successfully.', data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. Delete User
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findFirst({
      where: { id, companyId: req.user.companyId, isDeleted: false }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await prisma.user.update({
      where: { id },
      data: { isDeleted: true }
    });

    // 🛡️ Audit Log Trigger: Member Delete Hone Par
    await logActivity({
      tenantId: req.user.companyId,
      userId: req.user.id,
      userName: req.user.email,
      userEmail: req.user.email,
      action: 'MEMBER_DELETED',
      details: `Soft deleted member ${user.email}`,
      req
    });

    res.json({ success: true, message: 'User deleted (Delete) successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };