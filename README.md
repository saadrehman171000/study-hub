# Student Study Hub

A comprehensive study management platform for students with features for tracking assignments, storing study resources, scheduling study sessions, taking notes, and visualizing study analytics.

## Features

- 🔐 **User Authentication** - Secure login with Clerk
- 📝 **Assignments** - Create and manage assignments with due dates, priorities, and status tracking
- 📚 **Study Resources** - Organize and store study materials by subject
- 📊 **Analytics** - Track study time and visualize productivity
- 📅 **Calendar** - Schedule and manage study sessions and deadlines
- 📓 **Notes** - Take and organize study notes
- 🌓 **Dark Mode** - Toggle between light and dark themes

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- Clerk for authentication

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL via NeonDB
- Prisma ORM
- JWT for API authentication

## Project Structure

```
student-study-hub/
├── backend/             # Backend API server
│   ├── prisma/          # Database schema and migrations
│   ├── src/             # Backend source code
│   └── ...
├── src/                 # Frontend source code
│   ├── components/      # Reusable UI components
│   ├── context/         # React context providers
│   ├── lib/             # Utility functions and API clients
│   ├── pages/           # Page components
│   └── ...
└── ...
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- PostgreSQL database (or NeonDB account)
- Clerk account for authentication

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/student-study-hub.git
   cd student-study-hub
   ```

2. Install dependencies:
   ```
   npm install
   cd backend && npm install
   ```

3. Set up environment variables:
   
   Create a `.env` file in the root directory:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

   Create a `.env` file in the backend directory:
   ```
   DATABASE_URL=your_postgres_connection_string
   CLERK_SECRET_KEY=your_clerk_secret_key
   JWT_SECRET=your_jwt_secret
   PORT=8000
   ```

4. Initialize the database:
   ```
   cd backend
   npm run prisma:generate
   npm run prisma:push
   ```

### Development

Run both frontend and backend in development mode:
```
npm run dev:all
```

Or run them separately:

Frontend:
```
npm run dev
```

Backend:
```
cd backend
npm run dev
```

### Building for Production

Frontend:
```
npm run build
```

Backend:
```
cd backend
npm run build
```

## API Documentation

See the [backend README](./backend/README.md) for detailed API documentation.

## License

This project is licensed under the MIT License. 