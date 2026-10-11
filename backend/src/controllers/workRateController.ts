import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const listWorkRateCards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const cards = await prisma.workRateCard.findMany({
      where: { businessId },
      orderBy: { itemName: 'asc' },
    });
    res.json({ success: true, cards });
  } catch (error: any) {
    console.error('listWorkRateCards error:', error);
    res.status(500).json({ success: false, message: 'Failed to list rate cards' });
  }
};

export const createWorkRateCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { itemName, unit, ratePerUnit, description } = req.body;

    if (!itemName || !unit || ratePerUnit === undefined) {
      res.status(400).json({ success: false, message: 'itemName, unit and ratePerUnit are required' });
      return;
    }

    const card = await prisma.workRateCard.create({
      data: {
        businessId: businessId!,
        itemName,
        unit,
        ratePerUnit: parseFloat(ratePerUnit),
        description: description || null,
      },
    });

    res.status(201).json({ success: true, card });
  } catch (error: any) {
    console.error('createWorkRateCard error:', error);
    res.status(500).json({ success: false, message: 'Failed to create rate card' });
  }
};

export const listDailyWorkEntries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { employeeId, date } = req.query;

    const whereClause: any = { businessId };
    if (employeeId) whereClause.employeeId = String(employeeId);
    if (date) {
      const d = new Date(String(date));
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      whereClause.date = { gte: start, lte: end };
    }

    const entries = await prisma.dailyWorkEntry.findMany({
      where: whereClause,
      include: {
        employee: true,
        workRateCard: true,
      },
      orderBy: { date: 'desc' },
    });

    res.json({ success: true, entries });
  } catch (error: any) {
    console.error('listDailyWorkEntries error:', error);
    res.status(500).json({ success: false, message: 'Failed to list work entries' });
  }
};

export const addDailyWorkEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { employeeId, workRateCardId, unitsCompleted, remarks, date } = req.body;

    if (!employeeId || !workRateCardId || !unitsCompleted) {
      res.status(400).json({ success: false, message: 'employeeId, workRateCardId and unitsCompleted are required' });
      return;
    }

    const card = await prisma.workRateCard.findUnique({
      where: { id: workRateCardId },
    });

    if (!card) {
      res.status(404).json({ success: false, message: 'Work rate card not found' });
      return;
    }

    const units = parseFloat(unitsCompleted);
    const totalAmount = Math.round(units * card.ratePerUnit * 100) / 100;

    const entry = await prisma.dailyWorkEntry.create({
      data: {
        businessId: businessId!,
        employeeId,
        workRateCardId,
        unitsCompleted: units,
        totalAmount,
        remarks: remarks || null,
        date: date ? new Date(date) : new Date(),
      },
      include: {
        employee: true,
        workRateCard: true,
      },
    });

    res.status(201).json({ success: true, entry });
  } catch (error: any) {
    console.error('addDailyWorkEntry error:', error);
    res.status(500).json({ success: false, message: 'Failed to add work entry' });
  }
};
