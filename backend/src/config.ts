import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Function to read the raw contents of the .env file for debugging
const readEnvFileContents = (filePath: string): string => {
  try {
    if (fs.existsSync(filePath)) {
      // Try different encoding options
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Check if there are any weird characters at the beginning (BOM)
        const cleanContent = content.replace(/^\uFEFF/, '');
        
        // Return a sanitized version (hiding sensitive values)
        return cleanContent
          .split('\n')
          .map(line => {
            // Skip empty lines
            if (!line.trim()) return line;
            // Check if line has an equals sign
            if (!line.includes('=')) return `Invalid line format: ${line}`;
            
            const parts = line.split('=');
            const key = parts[0].trim();
            return `${key}=[VALUE HIDDEN]`;
          })
          .join('\n');
      } catch (e) {
        return `Error parsing file content: ${e}`;
      }
    }
  } catch (err) {
    return `Error reading file: ${err}`;
  }
  return 'File not found';
};

// Directly read the .env file and parse manually
const manualLoadEnvFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')
        .replace(/^\uFEFF/, ''); // Remove BOM if present
      
      const lines = content.split('\n');
      
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;
        
        // Split by first equals sign
        const equalIndex = trimmedLine.indexOf('=');
        if (equalIndex === -1) continue;
        
        const key = trimmedLine.substring(0, equalIndex).trim();
        const value = trimmedLine.substring(equalIndex + 1).trim();
        
        if (key && value) {
          
          process.env[key] = value;
        }
      }
    }
  } catch (err) {
    
  }
};

// Determine the path to the .env file
const envPath = path.resolve(__dirname, '../.env');

// Check if .env file exists and log its status
if (fs.existsSync(envPath)) {
  
  
  
  
  // Try standard dotenv first
  dotenv.config({ path: envPath });
  
  // If environment variables aren't loaded, try manual loading
  if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
    
    manualLoadEnvFile(envPath);
  }
  
  // Manually set environment variables if needed
  if (!process.env.DATABASE_URL) {
    
    process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_pnsoOAKT7M3x@ep-long-surf-a4rscmig-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';
  }
  
  if (!process.env.JWT_SECRET) {
    
    process.env.JWT_SECRET = 'studyhub_secret_key_for_jwt_tokens';
  }
} else {
  
  // Try to load from default location
  dotenv.config();
}

// Configuration object with fallbacks
export const config = {
  database: {
    url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pnsoOAKT7M3x@ep-long-surf-a4rscmig-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'studyhub_secret_key_for_jwt_tokens',
    expiresIn: 604800, // 7 days in seconds
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || 'AIzaSyBF6XjAsoc_PXJVMImTLjqba03ZM8tOd00',
  },
  server: {
    port: parseInt(process.env.PORT || '3005', 10),
  }
}; 