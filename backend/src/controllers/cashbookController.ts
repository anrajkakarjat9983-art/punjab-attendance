import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { CashBookType, PaymentMode } from '@prisma/client';

export const listCashBookEntries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { type, category } = req.query;

    const whereClause: any = { businessId };
    if (type && type !== 'ALL') whereClause.type = type as CashBookType;
    if (category && category !== 'ALL') whereClause.category = String(category);

    const entries = await prisma.cashBook.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    const totalIn = entries
      .filter((e) => e.type === CashBookType.CASH_IN)
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalOut = entries
      .filter((e) => e.type === CashBookType.CASH_OUT)
      .reduce((acc, curr) => acc + curr.amount, 0);

    const balance = totalIn - totalOut;

    res.json({
      success: true,
      entries,
      summary: {
        totalIn: Math.round(totalIn * 100) / 100,
        totalOut: Math.round(totalOut * 100) / 100,
        netBalance: Math.round(balance * 100) / 100,
      },
    });
  } catch (error: any) {
    console.error('listCashBookEntries error:', error);
    res.status(500).json({ success: false, message: 'Failed to list cashbook entries' });
  }
};

export const addCashBookEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { type, amount, category, description, paymentMode, date } = req.body;

    if (!type || !amount || !category) {
      res.status(400).json({ success: false, message: 'type, amount and category are required' });
      return;
    }

    const entry = await prisma.cashBook.create({
      data: {
        businessId: businessId!,
        type: type as CashBookType,
        amount: parseFloat(amount),
        category,
        description: description || null,
        paymentMode: (paymentMode as PaymentMode) || PaymentMode.CASH,
        date: date ? new Date(date) : new Date(),
      },
    });

    res.status(201).json({ success: true, entry });
  } catch (error: any) {
    console.error('addCashBookEntry error:', error);
    res.status(500).json({ success: false, message: 'Failed to add cashbook entry' });
  }
};
