import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const listNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const notifications = await prisma.notification.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, notifications });
  } catch (error: any) {
    console.error('listNotifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to list notifications' });
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error('markNotificationRead error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification read' });
  }
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    await prisma.notification.updateMany({
      where: { businessId, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('markAllNotificationsRead error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear notifications' });
  }
};
