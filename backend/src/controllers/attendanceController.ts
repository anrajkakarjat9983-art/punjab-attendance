import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { AttendanceStatus } from '@prisma/client';
import { parseDateOnly } from '../utils/dateUtils.js';

export const getAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'No active business selected' });
      return;
    }

    const { date, startDate, endDate, employeeId } = req.query;

    const targetDate = parseDateOnly(date ? String(date) : null);

    const whereClause: any = {
      businessId,
    };

    if (employeeId) {
      whereClause.employeeId = String(employeeId);
    }

    if (startDate && endDate) {
      whereClause.date = {
        gte: parseDateOnly(String(startDate)),
        lte: parseDateOnly(String(endDate)),
      };
    } else {
      whereClause.date = targetDate;
    }

    // Get attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        employee: {
          include: {
            department: true,
            shift: true,
          },
        },
        shift: true,
      },
    });

    // Also get all active staff to show unmarked status
    const allEmployees = await prisma.employee.findMany({
      where: { businessId, status: 'ACTIVE' },
      include: {
        department: true,
        shift: true,
      },
      orderBy: { name: 'asc' },
    });

    // Map each employee with their attendance record if exists
    const attendanceMap = new Map();
    attendanceRecords.forEach((rec) => {
      attendanceMap.set(rec.employeeId, rec);
    });

    const staffWithAttendance = allEmployees.map((emp) => {
      const record = attendanceMap.get(emp.id);
      return {
        employee: emp,
        attendance: record || null,
        status: record ? record.status : 'UNMARKED',
      };
    });

    res.json({
      success: true,
      date: targetDate.toISOString().split('T')[0],
      records: attendanceRecords,
      staffAttendance: staffWithAttendance,
    });
  } catch (error: any) {
    console.error('getAttendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
};

export const markAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'No active business selected' });
      return;
    }

    const {
      employeeId,
      date,
      status,
      checkInTime,
      checkOutTime,
      lateMinutes,
      earlyMinutes,
      overtimeHours,
      workHours,
      punchMethod,
      notes,
    } = req.body;

    if (!employeeId || !date || !status) {
      res.status(400).json({ success: false, message: 'employeeId, date and status are required' });
      return;
    }

    const dateOnly = parseDateOnly(date);

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { shift: true },
    });

    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found' });
      return;
    }

    // Overnight shift duration calculation helper
    let calculatedWorkHours = workHours !== undefined ? parseFloat(workHours) : 0;
    let calculatedLate = lateMinutes !== undefined ? parseInt(lateMinutes) : 0;
    let calculatedOvertime = overtimeHours !== undefined ? parseFloat(overtimeHours) : 0;

    let parsedIn = checkInTime ? new Date(checkInTime) : null;
    let parsedOut = checkOutTime ? new Date(checkOutTime) : null;

    if (parsedIn && parsedOut) {
      const diffMs = parsedOut.getTime() - parsedIn.getTime();
      let diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours < 0 && employee.shift?.isOvernight) {
        // Overnight wrap around
        diffHours += 24;
      }
      calculatedWorkHours = parseFloat(diffHours.toFixed(2));
    }

    if (status === 'PRESENT' && calculatedWorkHours === 0) {
      calculatedWorkHours = employee.shift?.fullDayHours || 8.5;
    } else if (status === 'HALF_DAY' && calculatedWorkHours === 0) {
      calculatedWorkHours = employee.shift?.halfDayHours || 4.5;
    } else if (status === 'ABSENT' || status === 'WEEKLY_OFF' || status === 'HOLIDAY') {
      calculatedWorkHours = 0;
    }

    const record = await prisma.attendance.upsert({
      where: {
        businessId_employeeId_date: {
          businessId,
          employeeId,
          date: dateOnly,
        },
      },
      create: {
        businessId,
        employeeId,
        shiftId: employee.shiftId,
        date: dateOnly,
        status: status as AttendanceStatus,
        checkInTime: parsedIn,
        checkOutTime: parsedOut,
        lateMinutes: calculatedLate,
        earlyMinutes: earlyMinutes ? parseInt(earlyMinutes) : 0,
        overtimeHours: calculatedOvertime,
        workHours: calculatedWorkHours,
        punchMethod: punchMethod || 'MANUAL',
        notes: notes || null,
        isVerified: true,
      },
      update: {
        status: status as AttendanceStatus,
        checkInTime: parsedIn,
        checkOutTime: parsedOut,
        lateMinutes: calculatedLate,
        earlyMinutes: earlyMinutes ? parseInt(earlyMinutes) : 0,
        overtimeHours: calculatedOvertime,
        workHours: calculatedWorkHours,
        punchMethod: punchMethod || 'MANUAL',
        notes: notes || null,
        isVerified: true,
      },
    });

    res.json({ success: true, record });
  } catch (error: any) {
    console.error('markAttendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to record attendance' });
  }
};

export const bulkMarkAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'No active business selected' });
      return;
    }

    const { date, status, employeeIds } = req.body;
    if (!date || !status) {
      res.status(400).json({ success: false, message: 'date and status are required' });
      return;
    }

    const dateOnly = parseDateOnly(date);

    let targetEmployees = [];
    if (Array.isArray(employeeIds) && employeeIds.length > 0) {
      targetEmployees = await prisma.employee.findMany({
        where: { id: { in: employeeIds }, businessId, status: 'ACTIVE' },
      });
    } else {
      targetEmployees = await prisma.employee.findMany({
        where: { businessId, status: 'ACTIVE' },
      });
    }

    const records = [];
    for (const emp of targetEmployees) {
      const rec = await prisma.attendance.upsert({
        where: {
          businessId_employeeId_date: {
            businessId,
            employeeId: emp.id,
            date: dateOnly,
          },
        },
        create: {
          businessId,
          employeeId: emp.id,
          shiftId: emp.shiftId,
          date: dateOnly,
          status: status as AttendanceStatus,
          workHours: status === 'PRESENT' ? 8.5 : status === 'HALF_DAY' ? 4.5 : 0,
          punchMethod: 'MANUAL',
          isVerified: true,
        },
        update: {
          status: status as AttendanceStatus,
          workHours: status === 'PRESENT' ? 8.5 : status === 'HALF_DAY' ? 4.5 : 0,
          punchMethod: 'MANUAL',
          isVerified: true,
        },
      });
      records.push(rec);
    }

    res.json({ success: true, count: records.length, records });
  } catch (error: any) {
    console.error('bulkMarkAttendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to bulk mark attendance' });
  }
};

export const geoPunch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { employeeId, latitude, longitude, punchType } = req.body; // punchType: 'IN' or 'OUT'

    if (!employeeId || latitude === undefined || longitude === undefined) {
      res.status(400).json({ success: false, message: 'employeeId, latitude and longitude are required' });
      return;
    }

    // Distance calculation helper (Haversine formula in meters)
    const branches = await prisma.branch.findMany({
      where: { businessId },
    });

    let isWithinGeofence = false;
    let closestBranch = null;
    let minDistance = Infinity;

    for (const b of branches) {
      if (b.latitude && b.longitude) {
        const radlat1 = (Math.PI * latitude) / 180;
        const radlat2 = (Math.PI * b.latitude) / 180;
        const theta = longitude - b.longitude;
        const radtheta = (Math.PI * theta) / 180;
        let dist =
          Math.sin(radlat1) * Math.sin(radlat2) +
          Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(Math.min(1, Math.max(-1, dist)));
        dist = (dist * 180) / Math.PI;
        dist = dist * 60 * 1.1515 * 1609.344; // in meters

        if (dist < minDistance) {
          minDistance = dist;
          closestBranch = b;
        }

        const allowedRadius = b.radiusMeters || 250;
        if (dist <= allowedRadius) {
          isWithinGeofence = true;
        }
      }
    }

    // If no branches configured or branches don't have coords, allow punch
    if (branches.length === 0 || minDistance === Infinity) {
      isWithinGeofence = true;
    }

    const now = new Date();
    const dateOnly = parseDateOnly();

    const existingRecord = await prisma.attendance.findUnique({
      where: {
        businessId_employeeId_date: {
          businessId: businessId!,
          employeeId,
          date: dateOnly,
        },
      },
    });

    let updatedRecord;
    if (punchType === 'OUT' && existingRecord) {
      updatedRecord = await prisma.attendance.update({
        where: { id: existingRecord.id },
        data: {
          checkOutTime: now,
          latitudeOut: latitude,
          longitudeOut: longitude,
          workHours: existingRecord.checkInTime
            ? parseFloat(((now.getTime() - existingRecord.checkInTime.getTime()) / 3600000).toFixed(2))
            : 8.0,
        },
      });
    } else {
      updatedRecord = await prisma.attendance.upsert({
        where: {
          businessId_employeeId_date: {
            businessId: businessId!,
            employeeId,
            date: dateOnly,
          },
        },
        create: {
          businessId: businessId!,
          employeeId,
          date: dateOnly,
          status: AttendanceStatus.PRESENT,
          checkInTime: now,
          punchMethod: 'GEO',
          latitudeIn: latitude,
          longitudeIn: longitude,
          isVerified: isWithinGeofence,
        },
        update: {
          checkInTime: now,
          punchMethod: 'GEO',
          latitudeIn: latitude,
          longitudeIn: longitude,
          isVerified: isWithinGeofence,
        },
      });
    }

    res.json({
      success: true,
      record: updatedRecord,
      geofenceVerified: isWithinGeofence,
      distanceMeters: Math.round(minDistance === Infinity ? 0 : minDistance),
      branch: closestBranch?.name || 'Head Office',
    });
  } catch (error: any) {
    console.error('geoPunch error:', error);
    res.status(500).json({ success: false, message: 'Failed to record geo punch' });
  }
};

export const getMusterRollSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { month, year } = req.query;

    const now = new Date();
    const targetYear = year ? parseInt(String(year)) : now.getFullYear();
    const targetMonth = month ? parseInt(String(month)) - 1 : now.getMonth();

    const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
    const start = parseDateOnly(`${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-01`);
    const end = parseDateOnly(`${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`);

    const employees = await prisma.employee.findMany({
      where: { businessId, status: 'ACTIVE' },
      include: { department: true, shift: true },
      orderBy: { name: 'asc' },
    });

    const attendances = await prisma.attendance.findMany({
      where: {
        businessId,
        date: { gte: start, lte: end },
      },
    });

    const summary = employees.map((emp) => {
      const empRecs = attendances.filter((a) => a.employeeId === emp.id);
      const present = empRecs.filter((a) => a.status === 'PRESENT').length;
      const halfDay = empRecs.filter((a) => a.status === 'HALF_DAY').length;
      const paidLeave = empRecs.filter((a) => a.status === 'PAID_LEAVE').length;
      const weeklyOff = empRecs.filter((a) => a.status === 'WEEKLY_OFF').length;
      const holiday = empRecs.filter((a) => a.status === 'HOLIDAY').length;
      const absent = empRecs.filter((a) => a.status === 'ABSENT').length;
      const totalOvertime = empRecs.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0);
      const totalLate = empRecs.reduce((acc, curr) => acc + (curr.lateMinutes || 0), 0);

      const payableDays = present + halfDay * 0.5 + paidLeave + weeklyOff + holiday;

      return {
        employee: emp,
        present,
        halfDay,
        paidLeave,
        weeklyOff,
        holiday,
        absent,
        payableDays,
        totalOvertime,
        totalLate,
        totalCalendarDays: end.getDate(),
      };
    });

    res.json({
      success: true,
      period: {
        year: targetYear,
        month: targetMonth + 1,
        totalDays: end.getDate(),
      },
      summary,
    });
  } catch (error: any) {
    console.error('getMusterRollSummary error:', error);
    res.status(500).json({ success: false, message: 'Failed to get muster roll' });
  }
};
