const aiService = require('../services/aiService');
const Assignment = require('../models/assignment');

/**
 * Generate an AI response for an assignment query
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateResponse = async (req, res) => {
  try {
    const { assignmentId, query } = req.body;
    const userId = req.user.id; // Assuming auth middleware sets req.user
    
    // Validate inputs
    if (!assignmentId || !query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Assignment ID and query are required'
      });
    }
    
    // Get the assignment details
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assignment not found'
      });
    }
    
    // Get the uploaded files (if any)
    const files = req.files || [];
    
    // Generate response from AI
    const response = await aiService.generateResponse({
      assignmentId,
      userId,
      query,
      assignment,
      files
    });
    
    res.status(200).json({
      success: true,
      data: {
        response,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error in AI assistant controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate AI response',
      error: error.message
    });
  }
};

/**
 * Get conversation history for a specific assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getConversationHistory = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user.id; // Assuming auth middleware sets req.user
    
    if (!assignmentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Assignment ID is required'
      });
    }
    
    const conversation = await aiService.getConversationHistory(userId, assignmentId);
    
    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch conversation history',
      error: error.message
    });
  }
}; 