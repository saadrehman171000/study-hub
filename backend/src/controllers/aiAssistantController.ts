import { Request, Response } from 'express';
import { prisma } from '../index';
import { config } from '../config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { CohereClient } from 'cohere-ai';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/ai-assistant');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Initialize upload middleware
export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept common document and image formats
    const fileTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|md|rtf/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Unsupported file format!'));
    }
  }
});

// Initialize Cohere
const cohere = new CohereClient({ token: 'TacfNZaQsUOFSaTUCtp41TY9vQOjUkHdBeWjuCUa' });

// Controller methods
export const aiAssistantController = {
  /**
   * Generate a response for a user query about an assignment
   */
  generateResponse: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // For development/testing, use fixed user ID
      const userId = '9d05f380-7760-4833-9add-dfb70c0439ff';
      
      const { assignmentId, query } = req.body;
      
      // Get assignment details to provide context to the AI
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId }
      });
      
      if (!assignment) {
        return res.status(404).json({ 
          message: 'Assignment not found' 
        });
      }
      
      // Check if the assignment belongs to the user (but don't enforce for development)
      if (assignment.userId !== userId) {
        
        // Temporarily commenting out this restriction for development/testing
        // return res.status(403).json({ 
        //   message: 'You do not have permission to access this assignment' 
        // });
      }
      
      // Process files if they exist
      let fileContents = '';
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files as Express.Multer.File[]) {
          // For text-based files, try to read the content
          if (file.mimetype.includes('text') || 
              file.mimetype.includes('pdf') || 
              file.originalname.endsWith('.md')) {
            try {
              const content = fs.readFileSync(file.path, 'utf8');
              fileContents += `\nFile: ${file.originalname}\nContent: ${content}\n`;
            } catch (error) {
              
            }
          } else {
            // For non-text files, just mention they were included
            fileContents += `\nFile: ${file.originalname} (non-text file)\n`;
          }
        }
      }
      
      // Find or create conversation using Prisma's directly accessed client
      const prismaAny = prisma as any;
      let conversation = await prismaAny.aIConversation.findFirst({
        where: {
          assignmentId,
          userId
        },
        include: {
          messages: {
            orderBy: {
              timestamp: 'asc'
            }
          }
        }
      });
      
      if (!conversation) {
        
        conversation = await prismaAny.aIConversation.create({
          data: {
            assignmentId,
            userId,
            messages: {
              create: {
                text: `Hello! I'm your AI assistant for the assignment "${assignment.title}". How can I help you understand or approach this assignment?`,
                role: 'assistant'
              }
            }
          },
          include: {
            messages: true
          }
        });
      }
      
      // Add user message to conversation
      await prismaAny.aIMessage.create({
        data: {
          text: query,
          role: 'user',
          conversationId: conversation.id
        }
      });
      
      // Prepare context for AI from previous messages and assignment details
      let messageHistory = conversation.messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));
      
      // Ensure the first message is from the user if we have a history
      if (messageHistory.length > 0 && messageHistory[0].role === 'model') {
        // Either remove the first message or create a dummy user prompt
        // We'll create a dummy user prompt
        messageHistory = [
          {
            role: 'user',
            parts: [{ text: 'Tell me about this assignment' }]
          },
          ...messageHistory
        ];
      }
      
      // Prepare prompt with assignment context
      const assignmentContext = `
Assignment Title: ${assignment.title}
Due Date: ${new Date(assignment.dueDate).toLocaleDateString()}
${assignment.description ? `Description: ${assignment.description}` : ''}
${assignment.subject ? `Subject: ${assignment.subject}` : ''}
${assignment.priority ? `Priority: ${assignment.priority}` : ''}
${fileContents ? `\nAdditional Files Information:\n${fileContents}` : ''}

The student is asking: ${query}

Please provide a helpful, educational response that helps the student understand or approach the assignment. Don't do the work for them, but guide them in the right direction.
`;

      try {
        const cohereResponse = await cohere.generate({
          model: 'command', // or 'command-light' for a smaller model
          prompt: assignmentContext,
          maxTokens: 300,
          temperature: 0.7,
        });

        const aiResponse = cohereResponse.generations[0].text;

        // Add AI response to conversation
        const aiMessage = await prismaAny.aIMessage.create({
          data: {
            text: aiResponse,
            role: 'assistant',
            conversationId: conversation.id
          }
        });

        // Ensure consistent response structure
        const responseData = {
          data: {
            response: aiResponse,
            timestamp: aiMessage.timestamp
          }
        };

        return res.status(200).json(responseData);
      } catch (cohereError) {
        console.error("Cohere API error:", cohereError);
        // Provide a fallback response
        const fallbackResponse = "I'm sorry, I encountered an issue processing your request. This might be due to a temporary problem with the AI service. Please try again in a moment.";
        // Add fallback response to conversation
        const aiMessage = await prismaAny.aIMessage.create({
          data: {
            text: fallbackResponse,
            role: 'assistant',
            conversationId: conversation.id
          }
        });
        // Ensure consistent response structure for fallback
        const fallbackResponseData = {
          data: {
            response: fallbackResponse,
            timestamp: aiMessage.timestamp
          }
        };
        return res.status(200).json(fallbackResponseData);
      }
    } catch (error: any) {
      
      return res.status(500).json({
        message: 'Error generating AI response',
        error: error.message
      });
    }
  },
  
  /**
   * Get conversation history for an assignment
   */
  getConversationHistory: async (req: Request, res: Response) => {
    try {
      // For development/testing, use fixed user ID
      const userId = '9d05f380-7760-4833-9add-dfb70c0439ff';
      
      
      const { assignmentId } = req.params;
      
      
      // Check if assignment exists
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId }
      });
      
      if (!assignment) {
        return res.status(404).json({ 
          message: 'Assignment not found' 
        });
      }
      
      
      
      // Check if the assignment belongs to the user (but don't enforce for development)
      if (assignment.userId !== userId) {
        
        // Temporarily commenting out this restriction for development/testing
        // return res.status(403).json({ 
        //   message: 'You do not have permission to access this assignment' 
        // });
      }
      
      // Find conversation using Prisma's directly accessed client
      const prismaAny = prisma as any;
      const conversation = await prismaAny.aIConversation.findFirst({
        where: {
          assignmentId,
          userId
        },
        include: {
          messages: {
            orderBy: {
              timestamp: 'asc'
            }
          }
        }
      });
      
      if (!conversation) {
        return res.status(200).json({
          data: []
        });
      }
      
      // Map messages to match frontend format
      const messages = conversation.messages.map((message: any) => ({
        text: message.text,
        role: message.role,
        timestamp: message.timestamp
      }));
      
      return res.status(200).json({
        data: messages
      });
    } catch (error: any) {
      
      return res.status(500).json({
        message: 'Error fetching conversation history',
        error: error.message
      });
    }
  }
};