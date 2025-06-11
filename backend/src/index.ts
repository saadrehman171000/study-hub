import { config } from './config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { userRouter } from './routes/userRoutes';
import { assignmentRouter } from './routes/assignmentRoutes';
import { resourceRouter } from './routes/resourceRoutes';
import { studySessionRouter } from './routes/studySessionRoutes';
import { noteRouter } from './routes/noteRoutes';
import { calendarRouter } from './routes/calendarRoutes';
import musicRouter from './routes/musicRoutes';
import academicGoalRouter from './routes/academicGoalRoutes';
import { aiAssistantRouter } from './routes/aiAssistantRoutes';
import { authMiddleware } from './middleware/authMiddleware';
import path from 'path';
import fs from 'fs';
import { seedData } from './utils/seedData';

// Create Express application
const app = express();
const port = config.server.port;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory at ${uploadsDir}`);
}

// Create resources directory within uploads if it doesn't exist
const resourcesDir = path.join(uploadsDir, 'resources');
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
  console.log(`Created resources directory at ${resourcesDir}`);
}

// Initialize Prisma client with explicit connection URL
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.database.url,
    },
  },
});

// Test database connection
prisma.$connect()
  .then(async () => {
    console.log('Successfully connected to database');
    
    // Seed data after successful connection
    try {
      await seedData(prisma);
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend build directory
const frontendBuildPath = path.join(__dirname, '../../../dist');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  console.log(`Serving static files from ${frontendBuildPath}`);
}

// Configure static file serving with proper error handling
app.use('/uploads', (req, res, next) => {
  const reqPath = req.path;
  const filePath = path.join(uploadsDir, reqPath);
  
  console.log(`Static file request: ${reqPath}`);
  console.log(`Looking for file at: ${filePath}`);
  
  // Check if file exists before serving
  if (fs.existsSync(filePath)) {
    console.log(`File found: ${filePath}`);
    express.static(uploadsDir)(req, res, next);
  } else {
    console.error(`File not found: ${filePath}`);
    res.status(404).send('File not found');
  }
});

// Debug route to verify uploads directory path
app.get('/debug/uploads-path', (req, res) => {
  const uploadsPath = path.join(__dirname, '../uploads');
  const exists = fs.existsSync(uploadsPath);
  const uploadsDirContents = exists ? fs.readdirSync(uploadsPath) : [];
  
  const resourcesPath = path.join(uploadsPath, 'resources');
  const resourcesDirExists = fs.existsSync(resourcesPath);
  const resourcesDirContents = resourcesDirExists ? fs.readdirSync(resourcesPath) : [];
  
  res.json({
    uploadsPath,
    exists,
    uploadsDirContents,
    resourcesPath,
    resourcesDirExists,
    resourcesDirContents,
    __dirname,
    fullPath: path.resolve(uploadsPath)
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api/users', userRouter);
app.use('/api/assignments', authMiddleware, assignmentRouter);
app.use('/api/resources', authMiddleware, resourceRouter);
app.use('/api/study-sessions', authMiddleware, studySessionRouter);
app.use('/api/notes', authMiddleware, noteRouter);
app.use('/api/calendar', authMiddleware, calendarRouter);
app.use('/api/music', musicRouter);
app.use('/api/goals', academicGoalRouter);
app.use('/api/ai', aiAssistantRouter);

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Uploads directory: ${path.resolve(uploadsDir)}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled promise rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle clean shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

