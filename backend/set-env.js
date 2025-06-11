// This script manually sets environment variables for development

// Set environment variables explicitly
const fs = require('fs');
const path = require('path');

try {
  console.log('Setting environment variables for backend...');
  
  // Manually set the required environment variables
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_pnsoOAKT7M3x@ep-long-surf-a4rscmig-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";
  process.env.JWT_SECRET = "studyhub_secret_key_for_jwt_tokens";
  process.env.GEMINI_API_KEY = "AIzaSyCNhHqmwbVfwuG7XQvl7FD8-00rTDR90aA";
  process.env.PORT = "3005";
  
  console.log('Environment variables set successfully');
  console.log('PORT:', process.env.PORT);
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '[PROVIDED]' : '[MISSING]');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '[PROVIDED]' : '[MISSING]');
  
} catch (error) {
  console.error('Error setting environment variables:', error);
}