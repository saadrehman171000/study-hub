# StudyHub Backend

The backend API for the Student Study Hub application built with Node.js, Express, TypeScript, and PostgreSQL via NeonDB.

## Features

- RESTful API with Express and TypeScript
- PostgreSQL database with Prisma ORM
- Authentication with Clerk and JWT
- Resources for managing:
  - User profiles
  - Assignments
  - Study resources
  - Study sessions and analytics
  - Notes
  - Calendar events

## Project Structure

```
backend/
├── prisma/             # Prisma schema and migrations
├── src/
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Middleware functions
│   ├── models/         # Data models and types
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── index.ts        # App entry point
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## Installation

1. Clone the repository and navigate to the backend directory
2. Install dependencies:
   ```
   npm install
   ```
3. Set up your environment variables in `.env` file:
   ```
   DATABASE_URL="your-postgres-connection-string"
   CLERK_SECRET_KEY="your-clerk-secret-key"
   JWT_SECRET="your-jwt-secret"
   PORT=8000
   ```
4. Generate Prisma client:
   ```
   npm run prisma:generate
   ```
5. Push database schema to NeonDB:
   ```
   npm run prisma:push
   ```

## Development

Start the development server:
```
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/users/sync` - Sync user from Clerk
- `GET /api/users/me` - Get current user

### Assignments
- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/:id` - Get an assignment
- `POST /api/assignments` - Create an assignment
- `PUT /api/assignments/:id` - Update an assignment
- `DELETE /api/assignments/:id` - Delete an assignment

### Resources
- `GET /api/resources` - Get all resources
- `GET /api/resources/:id` - Get a resource
- `POST /api/resources` - Create a resource
- `PUT /api/resources/:id` - Update a resource
- `DELETE /api/resources/:id` - Delete a resource

### Study Sessions
- `GET /api/study-sessions` - Get all study sessions
- `GET /api/study-sessions/analytics` - Get analytics data
- `GET /api/study-sessions/:id` - Get a study session
- `POST /api/study-sessions/start` - Start a study session
- `PUT /api/study-sessions/:id/end` - End a study session
- `DELETE /api/study-sessions/:id` - Delete a study session

### Notes
- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get a note
- `POST /api/notes` - Create a note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

### Calendar
- `GET /api/calendar` - Get all calendar events
- `GET /api/calendar/:id` - Get a calendar event
- `POST /api/calendar` - Create a calendar event
- `PUT /api/calendar/:id` - Update a calendar event
- `DELETE /api/calendar/:id` - Delete a calendar event

## Authentication

This API uses Clerk for authentication along with JWT tokens. Protected routes require a Bearer token in the Authorization header.

# AI Assistant for Student Study Hub

This backend provides an AI-powered assignment assistant for the Student Study Hub application.

## Features

- AI-powered assignment assistance using Google's Gemini API
- File upload capabilities for analyzing assignment documents
- Conversation history storage for persistent interactions
- Support for various file types, including images, PDFs, and text documents

## Setup Instructions

1. **Install dependencies**:
   ```
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env` and fill in the required values:
   ```
   cp .env.example .env
   ```
   
   You'll need to:
   - Set your MongoDB connection string
   - Set a JWT secret for authentication
   - Add your Gemini API key (get one from [Google AI Studio](https://ai.google.dev/))

3. **Create required directories**:
   ```
   mkdir -p uploads/temp
   ```

4. **Start the server**:
   ```
   npm start
   ```

## API Endpoints

### Generate AI Response
- **URL**: `/api/ai/generate`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data` (for file uploads) or `application/json`
- **Body**:
  ```json
  {
    "assignmentId": "string",
    "query": "string"
  }
  ```
- **Optional**: Files can be uploaded using form data with the key 'files'
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "response": "AI response text",
      "timestamp": "ISO date string"
    }
  }
  ```

### Get Conversation History
- **URL**: `/api/ai/history/:assignmentId`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "role": "assistant",
        "text": "Hello! I'm your AI assistant...",
        "timestamp": "ISO date string"
      },
      {
        "role": "user",
        "text": "Can you help me understand this assignment?",
        "timestamp": "ISO date string"
      },
      ...
    ]
  }
  ```

## How It Works

1. The frontend component (`AIAssistant.tsx`) connects to this backend through the `aiAssistantService.ts`
2. When a user asks a question about an assignment, it's sent to the Gemini API
3. The AI provides guidance and explanations about the assignment
4. If files are uploaded, they are processed and provided to the AI for context
5. Conversation history is saved to the database for persistence

## Obtaining a Gemini API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Create an account or sign in
3. Navigate to the API keys section
4. Create a new API key
5. Add the key to your `.env` file as `GEMINI_API_KEY=your_key_here` 