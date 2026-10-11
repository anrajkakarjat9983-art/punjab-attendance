import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { LeaveStatus, AttendanceStatus } from '@prisma/client';

export const listLeaves = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { status, employeeId } = req.query;

    const whereClause: any = { businessId };
    if (status && status !== 'ALL') {
      whereClause.status = status as LeaveStatus;
    }
    if (employeeId) {
      whereClause.employeeId = String(employeeId);
    }

    const leaves = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        employee: {
          include: { department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, leaves });
  } catch (error: any) {
    console.error('listLeaves error:', error);
    res.status(500).json({ success: false, message: 'Failed to list leaves' });
  }
};

export const createLeaveRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

    if (!employeeId || !startDate || !endDate) {
      res.status(400).json({ success: false, message: 'employeeId, startDate and endDate are required' });
      return;
    }

    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffDays = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const leave = await prisma.leaveRequest.create({
      data: {
        businessId: businessId!,
        employeeId,
        leaveType: leaveType || 'CASUAL',
        startDate: s,
        endDate: e,
        daysCount: diffDays,
        reason: reason || null,
        status: LeaveStatus.PENDING,
      },
      include: { employee: true },
    });

    // Also register an approval item
    await prisma.approval.create({
      data: {
        businessId: businessId!,
        requestType: 'LEAVE',
        referenceId: leave.id,
        title: `${leaveType || 'Casual'} Leave - ${leave.employee.name} (${diffDays} Days)`,
        details: reason || 'Leave requested',
      },
    });

    res.status(201).json({ success: true, leave });
  } catch (error: any) {
    console.error('createLeaveRequest error:', error);
    res.status(500).json({ success: false, message: 'Failed to request leave' });
  }
};

export const updateLeaveStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, actionNotes } = req.body; // APPROVED or REJECTED

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!leave) {
      res.status(404).json({ success: false, message: 'Leave request not found' });
      return;
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: status as LeaveStatus,
        actionNotes: actionNotes || null,
      },
    });

    // If approved, reflect in attendance records
    if (status === 'APPROVED') {
      const cur = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      while (cur <= end) {
        const dateOnly = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate());
        await prisma.attendance.upsert({
          where: {
            businessId_employeeId_date: {
              businessId: leave.businessId,
              employeeId: leave.employeeId,
              date: dateOnly,
            },
          },
          create: {
            businessId: leave.businessId,
            employeeId: leave.employeeId,
            date: dateOnly,
            status: AttendanceStatus.PAID_LEAVE,
            notes: `Approved leave: ${leave.leaveType}`,
            isVerified: true,
          },
          update: {
            status: AttendanceStatus.PAID_LEAVE,
            notes: `Approved leave: ${leave.leaveType}`,
          },
        });
        cur.setDate(cur.getDate() + 1);
      }
    }

    res.json({ success: true, leave: updated });
  } catch (error: any) {
    console.error('updateLeaveStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update leave status' });
  }
};
