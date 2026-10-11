import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'punjab-attendance-secure-jwt-secret-key-2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
  businessId?: string;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;

    // Check business context header with strict tenant authorization verification
    const requestedBusinessId = req.headers['x-business-id'] as string;
    if (requestedBusinessId) {
      const membership = await prisma.businessMember.findFirst({
        where: {
          userId: decoded.id,
          businessId: requestedBusinessId,
        },
      });

      if (!membership) {
        res.status(403).json({ success: false, message: 'Unauthorized: You are not a member of this business' });
        return;
      }

      req.businessId = membership.businessId;
      req.user.role = membership.role;
    } else {
      // Find user's primary/first business
      const membership = await prisma.businessMember.findFirst({
        where: { userId: decoded.id },
      });
      if (membership) {
        req.businessId = membership.businessId;
        req.user.role = membership.role;
      }
    }

    next();
  } catch (err) {
    res.status(403).json({ success: false, message: 'Invalid or expired token' });
    return;
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(403).json({ success: false, message: 'Role authorization required' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient role permissions for this operation' });
      return;
    }
    next();
  };
};
