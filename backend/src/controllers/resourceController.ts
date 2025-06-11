import { Request, Response } from 'express';
import { prisma } from '../index';
import { sendSuccess, sendError } from '../utils/responseHandler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { NextFunction } from 'express';

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/resources');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const safeFilename = `${uniqueSuffix}${ext}`;
    
    cb(null, safeFilename);
  }
});

// Configure multer with error handling
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Accept all files for now, but you could filter by mime type here
    cb(null, true);
  }
});

// Get all resources for current user
export const getResources = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { parentId } = req.query;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Filter resources by parent ID if provided
    const resources = await prisma.resource.findMany({
      where: {
        userId,
        parentId: parentId ? String(parentId) : null,
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    return sendSuccess(res, resources, 'Resources retrieved successfully');
  } catch (error) {
    console.error('Error getting resources:', error);
    return sendError(res, 'Error getting resources');
  }
};

// Get a specific resource
export const getResource = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const resource = await prisma.resource.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!resource) {
      return sendError(res, 'Resource not found', 404);
    }

    return sendSuccess(res, resource, 'Resource retrieved successfully');
  } catch (error) {
    console.error('Error getting resource:', error);
    return sendError(res, 'Error getting resource');
  }
};

// Create new resource (folder or file)
export const createResource = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const {
      name,
      description,
      type,
      fileUrl,
      fileSize,
      parentId,
    } = req.body;

    // Simple validation
    if (!name || !type) {
      return sendError(res, 'Name and type are required', 400);
    }

    // Validate type is either folder or file
    if (type !== 'folder' && type !== 'file') {
      return sendError(res, 'Type must be either folder or file', 400);
    }

    // If it's a file, check for fileUrl
    if (type === 'file' && !fileUrl) {
      return sendError(res, 'File URL is required for file resources', 400);
    }

    // Check if parent exists (if parentId is provided)
    if (parentId) {
      const parentResource = await prisma.resource.findFirst({
        where: {
          id: parentId,
          userId,
          type: 'folder', // Parent must be a folder
        },
      });

      if (!parentResource) {
        return sendError(res, 'Parent folder not found', 404);
      }
    }

    const newResource = await prisma.resource.create({
      data: {
        name,
        description,
        type,
        fileUrl,
        fileSize,
        parentId,
        userId,
      },
    });

    return sendSuccess(res, newResource, 'Resource created successfully', 201);
  } catch (error) {
    console.error('Error creating resource:', error);
    return sendError(res, 'Error creating resource');
  }
};

// Update resource
export const updateResource = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { name, description } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Check if resource exists and belongs to user
    const existingResource = await prisma.resource.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingResource) {
      return sendError(res, 'Resource not found', 404);
    }

    // Update resource (only name and description can be updated)
    const updatedResource = await prisma.resource.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    return sendSuccess(res, updatedResource, 'Resource updated successfully');
  } catch (error) {
    console.error('Error updating resource:', error);
    return sendError(res, 'Error updating resource');
  }
};

// Delete resource
export const deleteResource = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Check if resource exists and belongs to user
    const existingResource = await prisma.resource.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingResource) {
      return sendError(res, 'Resource not found', 404);
    }

    // If it's a folder, we may want to delete its contents as well
    if (existingResource.type === 'folder') {
      // Delete all resources within this folder
      await prisma.resource.deleteMany({
        where: {
          parentId: id,
          userId,
        },
      });
    } else if (existingResource.type === 'file' && existingResource.fileUrl) {
      // If it's a file, delete the actual file from disk
      try {
        const filePath = path.join(__dirname, '../..', existingResource.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted file: ${filePath}`);
        }
      } catch (fileErr) {
        console.error('Error deleting file from disk:', fileErr);
        // Continue with the database deletion even if file deletion fails
      }
    }

    // Delete the resource itself
    await prisma.resource.delete({
      where: { id },
    });

    return sendSuccess(res, null, 'Resource deleted successfully');
  } catch (error) {
    console.error('Error deleting resource:', error);
    return sendError(res, 'Error deleting resource');
  }
};

// Upload a file resource
export const uploadResource = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }
    
    if (!req.file) {
      return sendError(res, 'No file uploaded', 400);
    }
    
    // Extract file details
    const { originalname, filename, size, path: filePath } = req.file;
    
    // Extract other form data
    const { name, parentId } = req.body;
    
    // Use the original name from the file if no name provided
    const resourceName = name || originalname;
    
    // Generate file URL with the correct path for direct access
    // Important: This should be a URL path that's directly accessible from the browser
    const fileUrl = `/uploads/resources/${filename}`;
    
    console.log('Upload details:', {
      originalname,
      filename,
      size,
      filePath,
      fileUrl
    });
    
    // Format file size for display
    const fileSize = formatFileSize(size);
    
    // Create resource in database
    const resource = await prisma.resource.create({
      data: {
        name: resourceName,
        type: 'file',
        fileUrl,
        fileSize,
        parentId: parentId || null,
        userId,
      },
    });
    
    return sendSuccess(res, resource, 'File uploaded successfully', 201);
  } catch (error) {
    console.error('Error uploading file:', error);
    return sendError(res, 'Error uploading file');
  }
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  else return (bytes / 1073741824).toFixed(1) + ' GB';
};

// Error handler for multer
export function handleUploadError(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'File size exceeds limit of 10MB', 400);
    }
    return sendError(res, `Upload error: ${err.message}`, 400);
  } else if (err) {
    return sendError(res, `Upload error: ${err.message}`, 500);
  }
  next();
} 