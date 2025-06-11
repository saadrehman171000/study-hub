import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { config } from '../config';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        clerkId: string;
        email: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for token in headers
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authentication failed: No token provided',
      });
    }

    // Get token from header
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        message: 'Authentication failed: No token provided',
      });
    }

    try {
      // Verify token using config
      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string;
        clerkId: string;
        email: string;
      };

      // Check if user exists in database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return res.status(401).json({
          message: 'Authentication failed: User not found',
        });
      }

      // Add user to request object
      req.user = {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
      };

      next();
    } catch (error) {
      return res.status(401).json({
        message: 'Authentication failed: Invalid token',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      message: 'Server error during authentication',
    });
  }
}; 