import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const listBroadcasts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const broadcasts = await prisma.broadcastMessage.findMany({
      where: { businessId },
      orderBy: { sentAt: 'desc' },
    });
    res.json({ success: true, broadcasts });
  } catch (error: any) {
    console.error('listBroadcasts error:', error);
    res.status(500).json({ success: false, message: 'Failed to list broadcasts' });
  }
};

export const createBroadcast = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { title, message, targetRole } = req.body;

    if (!title || !message) {
      res.status(400).json({ success: false, message: 'title and message are required' });
      return;
    }

    const broadcast = await prisma.broadcastMessage.create({
      data: {
        businessId: businessId!,
        title,
        message,
        targetRole: targetRole || 'ALL',
      },
    });

    // Also dispatch notification
    await prisma.notification.create({
      data: {
        businessId: businessId!,
        title: `Broadcast: ${title}`,
        content: message.substring(0, 150),
        type: 'SYSTEM',
      },
    });

    res.status(201).json({ success: true, broadcast });
  } catch (error: any) {
    console.error('createBroadcast error:', error);
    res.status(500).json({ success: false, message: 'Failed to send broadcast' });
  }
};
