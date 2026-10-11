import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const listPerformanceReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { employeeId } = req.query;

    const whereClause: any = { businessId };
    if (employeeId) whereClause.employeeId = String(employeeId);

    const reviews = await prisma.performanceReview.findMany({
      where: whereClause,
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, reviews });
  } catch (error: any) {
    console.error('listPerformanceReviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to list reviews' });
  }
};

export const createPerformanceReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { employeeId, reviewPeriod, rating, feedback, reviewerName } = req.body;

    if (!employeeId || !reviewPeriod || rating === undefined) {
      res.status(400).json({ success: false, message: 'employeeId, reviewPeriod and rating are required' });
      return;
    }

    const review = await prisma.performanceReview.create({
      data: {
        businessId: businessId!,
        employeeId,
        reviewPeriod,
        rating: parseFloat(rating),
        feedback: feedback || null,
        reviewerName: reviewerName || req.user?.name || 'Manager',
      },
      include: { employee: true },
    });

    res.status(201).json({ success: true, review });
  } catch (error: any) {
    console.error('createPerformanceReview error:', error);
    res.status(500).json({ success: false, message: 'Failed to create review' });
  }
};

export const listPerformanceGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { employeeId } = req.query;

    const whereClause: any = { businessId };
    if (employeeId) whereClause.employeeId = String(employeeId);

    const goals = await prisma.performanceGoal.findMany({
      where: whereClause,
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, goals });
  } catch (error: any) {
    console.error('listPerformanceGoals error:', error);
    res.status(500).json({ success: false, message: 'Failed to list goals' });
  }
};

export const createPerformanceGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { employeeId, title, targetDate, progressPct, status } = req.body;

    if (!employeeId || !title) {
      res.status(400).json({ success: false, message: 'employeeId and title are required' });
      return;
    }

    const goal = await prisma.performanceGoal.create({
      data: {
        businessId: businessId!,
        employeeId,
        title,
        targetDate: targetDate ? new Date(targetDate) : null,
        progressPct: progressPct !== undefined ? parseFloat(progressPct) : 0,
        status: status || 'IN_PROGRESS',
      },
      include: { employee: true },
    });

    res.status(201).json({ success: true, goal });
  } catch (error: any) {
    console.error('createPerformanceGoal error:', error);
    res.status(500).json({ success: false, message: 'Failed to create goal' });
  }
};

export const updatePerformanceGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { progressPct, status, title } = req.body;

    const updated = await prisma.performanceGoal.update({
      where: { id },
      data: {
        progressPct: progressPct !== undefined ? parseFloat(progressPct) : undefined,
        status: status !== undefined ? status : undefined,
        title: title !== undefined ? title : undefined,
      },
      include: { employee: true },
    });

    res.json({ success: true, goal: updated });
  } catch (error: any) {
    console.error('updatePerformanceGoal error:', error);
    res.status(500).json({ success: false, message: 'Failed to update goal' });
  }
};
