import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const listShifts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const shifts = await prisma.shift.findMany({
      where: { businessId },
      include: { _count: { select: { employees: true } } },
    });
    res.json({ success: true, shifts });
  } catch (error: any) {
    console.error('listShifts error:', error);
    res.status(500).json({ success: false, message: 'Failed to list shifts' });
  }
};

export const createShift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { name, startTime, endTime, graceMinutes, halfDayHours, fullDayHours, isOvernight } = req.body;

    if (!name || !startTime || !endTime) {
      res.status(400).json({ success: false, message: 'name, startTime and endTime are required' });
      return;
    }

    const shift = await prisma.shift.create({
      data: {
        businessId: businessId!,
        name,
        startTime,
        endTime,
        graceMinutes: graceMinutes ? parseInt(graceMinutes) : 15,
        halfDayHours: halfDayHours ? parseFloat(halfDayHours) : 4.5,
        fullDayHours: fullDayHours ? parseFloat(fullDayHours) : 8.5,
        isOvernight: !!isOvernight,
      },
    });

    res.status(201).json({ success: true, shift });
  } catch (error: any) {
    console.error('createShift error:', error);
    res.status(500).json({ success: false, message: 'Failed to create shift' });
  }
};

export const listDepartments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const departments = await prisma.department.findMany({
      where: { businessId },
      include: { _count: { select: { employees: true } } },
    });
    res.json({ success: true, departments });
  } catch (error: any) {
    console.error('listDepartments error:', error);
    res.status(500).json({ success: false, message: 'Failed to list departments' });
  }
};

export const createDepartment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Department name is required' });
      return;
    }

    const department = await prisma.department.create({
      data: {
        businessId: businessId!,
        name,
        description: description || null,
      },
    });

    res.status(201).json({ success: true, department });
  } catch (error: any) {
    console.error('createDepartment error:', error);
    res.status(500).json({ success: false, message: 'Failed to create department' });
  }
};

export const listBranches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const branches = await prisma.branch.findMany({
      where: { businessId },
      include: { _count: { select: { employees: true } } },
    });
    res.json({ success: true, branches });
  } catch (error: any) {
    console.error('listBranches error:', error);
    res.status(500).json({ success: false, message: 'Failed to list branches' });
  }
};

export const createBranch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { name, address, latitude, longitude, radiusMeters } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Branch name is required' });
      return;
    }

    const branch = await prisma.branch.create({
      data: {
        businessId: businessId!,
        name,
        address: address || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        radiusMeters: radiusMeters ? parseFloat(radiusMeters) : 200,
      },
    });

    res.status(201).json({ success: true, branch });
  } catch (error: any) {
    console.error('createBranch error:', error);
    res.status(500).json({ success: false, message: 'Failed to create branch' });
  }
};

export const listHolidays = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const holidays = await prisma.holiday.findMany({
      where: { businessId },
      orderBy: { date: 'asc' },
    });
    res.json({ success: true, holidays });
  } catch (error: any) {
    console.error('listHolidays error:', error);
    res.status(500).json({ success: false, message: 'Failed to list holidays' });
  }
};

export const createHoliday = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { name, date, description, isRecurring } = req.body;

    if (!name || !date) {
      res.status(400).json({ success: false, message: 'Holiday name and date are required' });
      return;
    }

    const d = new Date(date);
    const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const holiday = await prisma.holiday.create({
      data: {
        businessId: businessId!,
        name,
        date: dateOnly,
        description: description || null,
        isRecurring: !!isRecurring,
      },
    });

    res.status(201).json({ success: true, holiday });
  } catch (error: any) {
    console.error('createHoliday error:', error);
    res.status(500).json({ success: false, message: 'Failed to create holiday' });
  }
};

export const listAutomationRules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const rules = await prisma.automationRule.findMany({
      where: { businessId },
    });
    res.json({ success: true, rules });
  } catch (error: any) {
    console.error('listAutomationRules error:', error);
    res.status(500).json({ success: false, message: 'Failed to list automation rules' });
  }
};

export const toggleAutomationRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isEnabled } = req.body;

    const updated = await prisma.automationRule.update({
      where: { id },
      data: { isEnabled: !!isEnabled },
    });

    res.json({ success: true, rule: updated });
  } catch (error: any) {
    console.error('toggleAutomationRule error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle rule' });
  }
};

export const listOrganisationMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const members = await prisma.businessMember.findMany({
      where: { businessId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    res.json({ success: true, members });
  } catch (error: any) {
    console.error('listOrganisationMembers error:', error);
    res.status(500).json({ success: false, message: 'Failed to list organization members' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, phone, email, password } = req.body;

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (phone) dataToUpdate.phone = phone;
    if (email) dataToUpdate.email = email;
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
      },
    });

    res.json({ success: true, user: updated });
  } catch (error: any) {
    console.error('updateProfile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};
