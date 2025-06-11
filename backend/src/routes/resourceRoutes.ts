import express from 'express';
import {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  uploadResource,
  upload
} from '../controllers/resourceController';

export const resourceRouter = express.Router();

// Get all resources
resourceRouter.get('/', getResources);

// Get a specific resource
resourceRouter.get('/:id', getResource);

// Create a new resource
resourceRouter.post('/', createResource);

// Update a resource
resourceRouter.put('/:id', updateResource);

// Delete a resource
resourceRouter.delete('/:id', deleteResource);

// Upload a file resource
resourceRouter.post('/upload', upload.single('file'), uploadResource); 