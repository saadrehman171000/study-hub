# Student Study Hub Setup Guide

This guide will help you set up and run the Student Study Hub application.

## Prerequisites

- Node.js v16 or later
- NPM v7 or later
- PostgreSQL (if running locally) or use the provided Neon database

## Environment Variables

The application requires the following environment variables:

### Backend (.env file in backend directory)

```
DATABASE_URL="postgresql://neondb_owner:npg_pnsoOAKT7M3x@ep-long-surf-a4rscmig-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET=studyhub_secret_key_for_jwt_tokens
GEMINI_API_KEY=AIzaSyCNhHqmwbVfwuG7XQvl7FD8-00rTDR90aA
PORT=3005
```

## Setup Steps

1. **Install dependencies for both frontend and backend:**

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

2. **Generate Prisma client:**

```bash
cd backend
npx prisma generate
cd ..
```

3. **Run the application:**

There are several ways to run the application:

### Option 1: Run both frontend and backend concurrently

```bash
node start-servers.js
```

### Option 2: Run frontend and backend separately

Terminal 1:
```bash
cd backend
npm run dev:fixed
```

Terminal 2:
```bash
npm run dev
```

### Option 3: Run frontend on alternative port

```bash
node start-alt-port.js
```

## Troubleshooting

### Connection refused errors

If you see "Connection refused" errors:

1. Make sure the backend server is running on port 3005
2. Check the backend console for any database connection errors
3. Verify that your .env file contains the correct database URL

### Database connection issues

If you have issues connecting to the database:

1. Make sure the Neon database is accessible from your network
2. Check if the database credentials are correct

## API Endpoints

The backend server provides the following API endpoints:

- `/api/health` - Health check endpoint
- `/api/users` - User management
- `/api/assignments` - Assignment management
- `/api/resources` - Study resources management
- `/api/study-sessions` - Study session tracking
- `/api/notes` - Notes management
- `/api/calendar` - Calendar events
- `/api/music` - Study music
- `/api/goals` - Academic goals
- `/api/ai` - AI assistant 