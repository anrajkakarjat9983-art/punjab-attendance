import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { parseDateOnly } from '../utils/dateUtils.js';

export const getCurrentBusiness = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'No active business selected' });
      return;
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        departments: true,
        branches: true,
        shifts: true,
      },
    });

    if (!business) {
      res.status(404).json({ success: false, message: 'Business not found' });
      return;
    }

    res.json({ success: true, business });
  } catch (error: any) {
    console.error('getCurrentBusiness error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateBusiness = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'No active business selected' });
      return;
    }

    const {
      name,
      category,
      address,
      city,
      state,
      pincode,
      phone,
      email,
      logo,
      bankName,
      accountNumber,
      ifscCode,
      statementName,
    } = req.body;

    const updated = await prisma.business.update({
      where: { id: businessId },
      data: {
        name: name !== undefined ? name : undefined,
        category: category !== undefined ? category : undefined,
        address: address !== undefined ? address : undefined,
        city: city !== undefined ? city : undefined,
        state: state !== undefined ? state : undefined,
        pincode: pincode !== undefined ? pincode : undefined,
        phone: phone !== undefined ? phone : undefined,
        email: email !== undefined ? email : undefined,
        logo: logo !== undefined ? logo : undefined,
        bankName: bankName !== undefined ? bankName : undefined,
        accountNumber: accountNumber !== undefined ? accountNumber : undefined,
        ifscCode: ifscCode !== undefined ? ifscCode : undefined,
        statementName: statementName !== undefined ? statementName : undefined,
      },
    });

    res.json({ success: true, business: updated });
  } catch (error: any) {
    console.error('updateBusiness error:', error);
    res.status(500).json({ success: false, message: 'Failed to update business' });
  }
};

export const listBusinesses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const memberships = await prisma.businessMember.findMany({
      where: { userId: req.user.id },
      include: { business: true },
    });

    res.json({
      success: true,
      businesses: memberships.map((m) => ({
        ...m.business,
        role: m.role,
      })),
    });
  } catch (error: any) {
    console.error('listBusinesses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createBusiness = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, category, city, state, phone, address } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: 'Business name is required' });
      return;
    }

    const newBusiness = await prisma.business.create({
      data: {
        name,
        category: category || 'General Business',
        city: city || 'Ludhiana',
        state: state || 'Punjab',
        phone: phone || '',
        address: address || '',
        kybStatus: 'VERIFIED',
      },
    });

    await prisma.businessMember.create({
      data: {
        businessId: newBusiness.id,
        userId: req.user.id,
        role: 'OWNER',
      },
    });

    await prisma.shift.create({
      data: {
        businessId: newBusiness.id,
        name: 'General Shift (9 AM - 6 PM)',
        startTime: '09:00',
        endTime: '18:00',
      },
    });

    res.status(201).json({ success: true, business: newBusiness });
  } catch (error: any) {
    console.error('createBusiness error:', error);
    res.status(500).json({ success: false, message: 'Failed to create business' });
  }
};

export const getBusinessStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'No active business selected' });
      return;
    }

    const totalStaff = await prisma.employee.count({
      where: { businessId, status: 'ACTIVE' },
    });

    const todayDate = parseDateOnly();

    const todayAttendance = await prisma.attendance.findMany({
      where: {
        businessId,
        date: todayDate,
      },
    });

    const presentCount = todayAttendance.filter((a) => a.status === 'PRESENT').length;
    const halfDayCount = todayAttendance.filter((a) => a.status === 'HALF_DAY').length;
    const leaveCount = todayAttendance.filter((a) => a.status === 'PAID_LEAVE' || a.status === 'UNPAID_LEAVE').length;
    const absentCount = todayAttendance.filter((a) => a.status === 'ABSENT').length;
    const weeklyOffCount = todayAttendance.filter((a) => a.status === 'WEEKLY_OFF').length;
    const holidayCount = todayAttendance.filter((a) => a.status === 'HOLIDAY').length;
    const unmarkedCount = Math.max(
      0,
      totalStaff - (presentCount + halfDayCount + leaveCount + absentCount + weeklyOffCount + holidayCount)
    );

    const pendingApprovalsCount = await prisma.approval.count({
      where: { businessId, status: 'PENDING' },
    });

    const pendingLeavesCount = await prisma.leaveRequest.count({
      where: { businessId, status: 'PENDING' },
    });

    const unreadNotificationsCount = await prisma.notification.count({
      where: { businessId, isRead: false },
    });

    res.json({
      success: true,
      stats: {
        totalStaff,
        presentToday: presentCount,
        halfDayToday: halfDayCount,
        leaveToday: leaveCount,
        absentToday: absentCount,
        weeklyOffToday: weeklyOffCount,
        holidayToday: holidayCount,
        unmarkedToday: unmarkedCount,
        pendingApprovalsCount,
        pendingLeavesCount,
        unreadNotificationsCount,
      },
    });
  } catch (error: any) {
    console.error('getBusinessStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get stats' });
  }
};
