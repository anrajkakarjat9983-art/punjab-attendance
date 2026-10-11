import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { ApprovalStatus } from '@prisma/client';

export const listApprovals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId;
    const { status } = req.query;

    const whereClause: any = { businessId };
    if (status && status !== 'ALL') {
      whereClause.status = status as ApprovalStatus;
    }

    const approvals = await prisma.approval.findMany({
      where: whereClause,
      include: { actionBy: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, approvals });
  } catch (error: any) {
    console.error('listApprovals error:', error);
    res.status(500).json({ success: false, message: 'Failed to list approvals' });
  }
};

export const actionApproval = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, actionNotes } = req.body; // APPROVED or REJECTED

    const approval = await prisma.approval.findUnique({
      where: { id },
    });

    if (!approval) {
      res.status(404).json({ success: false, message: 'Approval request not found' });
      return;
    }

    const updated = await prisma.approval.update({
      where: { id },
      data: {
        status: status as ApprovalStatus,
        actionById: req.user?.id || null,
        actionNotes: actionNotes || null,
      },
    });

    // If it's a leave approval, also update the LeaveRequest table
    if (approval.requestType === 'LEAVE' && approval.referenceId) {
      await prisma.leaveRequest.update({
        where: { id: approval.referenceId },
        data: {
          status: status === 'APPROVED' ? 'APPROVED' : 'REJECTED',
          actionNotes: actionNotes || null,
        },
      }).catch(() => {});
    }

    res.json({ success: true, approval: updated });
  } catch (error: any) {
    console.error('actionApproval error:', error);
    res.status(500).json({ success: false, message: 'Failed to update approval' });
  }
};
