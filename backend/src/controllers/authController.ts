import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'punjab-attendance-secure-jwt-secret-key-2026';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body; // email or phone
    if (!identifier || !password) {
      res.status(400).json({ success: false, message: 'Email/phone and password are required' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
      include: {
        businesses: {
          include: {
            business: true,
          },
        },
      },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const primaryMembership = user.businesses[0];
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
      },
      currentBusiness: primaryMembership ? primaryMembership.business : null,
      businesses: user.businesses.map((b) => ({
        ...b.business,
        role: b.role,
      })),
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, businessName } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email and password are required' });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone: phone || undefined }] },
    });

    if (existingUser) {
      res.status(400).json({ success: false, message: 'User already exists with this email or phone' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        avatar: name.slice(0, 2).toUpperCase(),
      },
    });

    // Create initial business for user
    const bName = businessName || `${name}'s Enterprise`;
    const business = await prisma.business.create({
      data: {
        name: bName,
        phone: phone || '',
        email,
        kybStatus: 'VERIFIED',
      },
    });

    await prisma.businessMember.create({
      data: {
        userId: user.id,
        businessId: business.id,
        role: 'OWNER',
      },
    });

    // Create default shift
    await prisma.shift.create({
      data: {
        businessId: business.id,
        name: 'General Shift (9 AM - 6 PM)',
        startTime: '09:00',
        endTime: '18:00',
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
      },
      currentBusiness: business,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        businesses: {
          include: {
            business: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const currentBusinessId = req.businessId || (user.businesses[0] ? user.businesses[0].businessId : null);
    let currentBusiness = null;
    if (currentBusinessId) {
      currentBusiness = await prisma.business.findUnique({
        where: { id: currentBusinessId },
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
      },
      currentBusiness,
      businesses: user.businesses.map((b) => ({
        ...b.business,
        role: b.role,
      })),
    });
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
