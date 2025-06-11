import { Request, Response } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { prisma } from '../index';
import { sendSuccess, sendError } from '../utils/responseHandler';
import { config } from '../config';
import type { StringValue } from 'ms';

// Register or authenticate user via Clerk
export const syncUser = async (req: Request, res: Response) => {
  try {
    const { clerkId, email, firstName, lastName, profilePicture } = req.body;

    if (!clerkId || !email) {
      return sendError(res, 'Clerk ID and email are required', 400);
    }

    // Check if user already exists by clerkId OR email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { clerkId },
          { email }
        ]
      },
    });

    if (user) {
      // Update user if they exist (also update clerkId if missing)
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          clerkId,
          email,
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          profilePicture: profilePicture || user.profilePicture,
        },
      });
    } else {
      // Create new user if they don't exist
      user = await prisma.user.create({
        data: {
          clerkId,
          email,
          firstName,
          lastName,
          profilePicture,
        },
      });
    }

    // Generate JWT token using config
    const signOptions: SignOptions = { expiresIn: config.jwt.expiresIn };
    const token = jwt.sign(
      {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
      },
      config.jwt.secret as Secret,
      signOptions
    );

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          clerkId: user.clerkId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
        },
        token,
      },
      'User synced successfully',
      200
    );
  } catch (error) {
    console.error('Error syncing user:', error);
    return sendError(res, 'Error syncing user');
  }
};

// Get current user information
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(
      res,
      {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
      },
      'User retrieved successfully'
    );
  } catch (error) {
    console.error('Error getting current user:', error);
    return sendError(res, 'Error getting current user');
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }
    
    const { firstName, lastName } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
      },
    });
    
    return sendSuccess(
      res,
      {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      },
      'Profile updated successfully'
    );
  } catch (error) {
    console.error('Error updating profile:', error);
    return sendError(res, 'Error updating profile');
  }
};