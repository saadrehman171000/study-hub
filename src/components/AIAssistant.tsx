"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, BrainCircuit, Loader2, Upload, Copy, Check } from "lucide-react"
import type { Assignment } from "../lib/api/assignmentService"
import { useApi } from "../lib/api/ApiContext"

// Define the types for AI responses
interface AIResponse {
  text: string
  timestamp: Date
  role: string
}

interface AIAssistantProps {
  assignment: Assignment
  onClose: () => void
}

export function AIAssistant({ assignment, onClose }: AIAssistantProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [userQuery, setUserQuery] = useState("")
  const [conversation, setConversation] = useState<AIResponse[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { aiAssistantService } = useApi()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Load conversation history when component mounts
  useEffect(() => {
    const loadConversationHistory = async () => {
      try {
        setIsLoading(true)
        // Try to load conversation history from the backend
        const history = await aiAssistantService.getConversationHistory(assignment.id)
        
        if (history && history.length > 0) {
          // Convert backend format to component format
          const formattedHistory = history.map(msg => ({
            text: msg.text,
            timestamp: new Date(msg.timestamp),
            role: msg.role
          }))
          setConversation(formattedHistory)
        } else {
          // If no history, show initial greeting
          const initialGreeting = {
            text: `Hello! I'm your AI assistant for the assignment "${assignment.title}". How can I help you understand or approach this assignment?`,
            timestamp: new Date(),
            role: 'user'
          }
          setConversation([initialGreeting])
        }
      } catch (err) {
        // Default greeting if we can't load history
        const initialGreeting = {
          text: `Hello! I'm your AI assistant for the assignment "${assignment.title}". How can I help you understand or approach this assignment?`,
          timestamp: new Date(),
          role: 'user'
        }
        setConversation([initialGreeting])
      } finally {
        setIsLoading(false)
      }
    }

    loadConversationHistory()
  }, [assignment, aiAssistantService])

  // Auto-scroll to bottom of chat when conversation updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [conversation])

  // Handle sending a message to the AI
  const handleSendMessage = async () => {
    if (!userQuery.trim() && uploadedFiles.length === 0) return

    const userMessage = userQuery
    setUserQuery("")
    setError(null)
    setIsLoading(true)

    // Add user message to conversation
    const newUserResponse: AIResponse = {
      text: userMessage,
      timestamp: new Date(),
      role: 'user'
    }

    setConversation((prev) => [...prev, newUserResponse])

    try {
      // Call the AI service to get a response
      const response = await aiAssistantService.generateResponse(
        assignment.id, 
        userMessage,
        uploadedFiles.length > 0 ? uploadedFiles : undefined
      )

      // Add AI response to conversation
      const newAIResponse: AIResponse = {
        text: response.response,
        timestamp: new Date(response.timestamp),
        role: 'AI'
      }

      setConversation((prev) => [...prev, newAIResponse])
      setUploadedFiles([])
    } catch (error) {
      setError("I'm sorry, I encountered an error processing your request. Please try again.")

      // Add error message to conversation
      const errorResponse: AIResponse = {
        text: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        role: 'AI'
      }

      setConversation((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle file upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      setUploadedFiles((prev) => [...prev, ...filesArray])
    }
  }

  // Remove a file from the upload list
  const removeFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.name !== fileName))
  }

  // Copy conversation to clipboard
  const copyConversation = () => {
    const text = conversation.map((msg) => `${msg.timestamp.toLocaleTimeString()}: ${msg.text}`).join("\n\n")

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Format message text with basic markdown-like styling
  const formatMessageText = (text: string) => {
    // Split by newlines
    const lines = text.split("\n");
    const result: JSX.Element[] = [];
    let currentList: JSX.Element[] = [];
    let inUnorderedList = false;
    let inOrderedList = false;

    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if line is a heading (starts with #)
      if (line.startsWith("# ")) {
        // If we were in a list, close it before adding heading
        if (inUnorderedList) {
          result.push(<ul key={`ul-${i}`} className="list-disc ml-6 mb-3">{currentList}</ul>);
          currentList = [];
          inUnorderedList = false;
        } else if (inOrderedList) {
          result.push(<ol key={`ol-${i}`} className="list-decimal ml-6 mb-3">{currentList}</ol>);
          currentList = [];
          inOrderedList = false;
        }
        
        result.push(
          <h2 key={`h-${i}`} className="text-xl font-bold mb-2">
            {formatText(line.substring(2))}
          </h2>
        );
      }
      // Check if line is a subheading (starts with ##)
      else if (line.startsWith("## ")) {
        // If we were in a list, close it before adding subheading
        if (inUnorderedList) {
          result.push(<ul key={`ul-${i}`} className="list-disc ml-6 mb-3">{currentList}</ul>);
          currentList = [];
          inUnorderedList = false;
        } else if (inOrderedList) {
          result.push(<ol key={`ol-${i}`} className="list-decimal ml-6 mb-3">{currentList}</ol>);
          currentList = [];
          inOrderedList = false;
        }
        
        result.push(
          <h3 key={`h-${i}`} className="text-lg font-semibold mb-2">
            {formatText(line.substring(3))}
          </h3>
        );
      }
      // Check if line is an unordered list item (starts with - or *)
      else if (line.startsWith("- ") || line.startsWith("* ")) {
        // If we were in an ordered list, close it before starting unordered list
        if (inOrderedList) {
          result.push(<ol key={`ol-${i}`} className="list-decimal ml-6 mb-3">{currentList}</ol>);
          currentList = [];
          inOrderedList = false;
        }
        
        // Add to unordered list
        inUnorderedList = true;
        currentList.push(
          <li key={`li-${i}`}>
            {formatText(line.substring(2))}
          </li>
        );
      }
      // Check if line is a numbered list item (starts with 1., 2., etc.)
      else if (/^\d+\.\s/.test(line)) {
        // If we were in an unordered list, close it before starting ordered list
        if (inUnorderedList) {
          result.push(<ul key={`ul-${i}`} className="list-disc ml-6 mb-3">{currentList}</ul>);
          currentList = [];
          inUnorderedList = false;
        }
        
        // Add to ordered list
        inOrderedList = true;
        currentList.push(
          <li key={`li-${i}`}>
            {formatText(line.substring(line.indexOf(".") + 1))}
          </li>
        );
      }
      // Check if line is empty (for spacing)
      else if (line.trim() === "") {
        // If we were in a list, close it before adding spacing
        if (inUnorderedList) {
          result.push(<ul key={`ul-${i}`} className="list-disc ml-6 mb-3">{currentList}</ul>);
          currentList = [];
          inUnorderedList = false;
        } else if (inOrderedList) {
          result.push(<ol key={`ol-${i}`} className="list-decimal ml-6 mb-3">{currentList}</ol>);
          currentList = [];
          inOrderedList = false;
        }
        
        result.push(<br key={`br-${i}`} />);
      }
      // Regular paragraph
      else {
        // If we were in a list, close it before adding paragraph
        if (inUnorderedList) {
          result.push(<ul key={`ul-${i}`} className="list-disc ml-6 mb-3">{currentList}</ul>);
          currentList = [];
          inUnorderedList = false;
        } else if (inOrderedList) {
          result.push(<ol key={`ol-${i}`} className="list-decimal ml-6 mb-3">{currentList}</ol>);
          currentList = [];
          inOrderedList = false;
        }
        
        result.push(
          <p key={`p-${i}`} className="mb-2">
            {formatText(line)}
          </p>
        );
      }
    }
    
    // If we're still in a list at the end, close it
    if (inUnorderedList) {
      result.push(<ul key="ul-final" className="list-disc ml-6 mb-3">{currentList}</ul>);
    } else if (inOrderedList) {
      result.push(<ol key="ol-final" className="list-decimal ml-6 mb-3">{currentList}</ol>);
    }
    
    return result;
  }
  
  // Helper function to format text with bold and italic
  const formatText = (text: string): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = [];
    let currentIndex = 0;
    
    // Process bold text (wrapped in **)
    const boldRegex = /\*\*(.*?)\*\*/g;
    let boldMatch;
    
    while ((boldMatch = boldRegex.exec(text)) !== null) {
      // Add text before the match
      if (boldMatch.index > currentIndex) {
        parts.push(text.substring(currentIndex, boldMatch.index));
      }
      
      // Add bold text
      parts.push(<strong key={`bold-${boldMatch.index}`}>{boldMatch[1]}</strong>);
      
      // Update current index
      currentIndex = boldMatch.index + boldMatch[0].length;
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }
    
    // Process italic text (wrapped in *)
    return parts.map(part => {
      if (typeof part !== 'string') return part;
      
      const italicParts: (string | JSX.Element)[] = [];
      let italicCurrentIndex = 0;
      const italicRegex = /\*(.*?)\*/g;
      let italicMatch;
      
      while ((italicMatch = italicRegex.exec(part)) !== null) {
        // Add text before the match
        if (italicMatch.index > italicCurrentIndex) {
          italicParts.push(part.substring(italicCurrentIndex, italicMatch.index));
        }
        
        // Add italic text
        italicParts.push(<em key={`italic-${italicMatch.index}`}>{italicMatch[1]}</em>);
        
        // Update current index
        italicCurrentIndex = italicMatch.index + italicMatch[0].length;
      }
      
      // Add remaining text
      if (italicCurrentIndex < part.length) {
        italicParts.push(part.substring(italicCurrentIndex));
      }
      
      return italicParts;
    }).flat();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-dark-100 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-200">
          <div className="flex items-center">
            <BrainCircuit className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Assignment Assistant</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Assignment Info */}
        <div className="bg-gray-50 dark:bg-dark-200 p-4">
          <h3 className="font-medium text-gray-900 dark:text-white">Assignment: {assignment.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Due: {new Date(assignment.dueDate).toLocaleDateString()}
            {assignment.subject && ` • Subject: ${assignment.subject}`}
          </p>
        </div>

        {/* Chat Container */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {conversation.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? "bg-gray-100 dark:bg-dark-200 text-gray-800 dark:text-gray-200"
                      : "bg-primary-50 dark:bg-primary-900/20 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  <div className="text-sm">{formatMessageText(message.text)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600 dark:text-primary-400" />
              <span className="ml-2 text-gray-600 dark:text-gray-300">Thinking...</span>
            </div>
          )}
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="px-4 py-2 bg-gray-50 dark:bg-dark-200 border-t border-gray-200 dark:border-dark-200">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Uploaded Files:</p>
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center bg-white dark:bg-dark-300 rounded-lg px-3 py-1 text-sm">
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button onClick={() => removeFile(file.name)} className="ml-2 text-gray-400 hover:text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-dark-200">
          <div className="flex items-center space-x-2 mb-2">
            <button
              onClick={handleUploadClick}
              className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
            >
              <Upload className="h-4 w-4 mr-1" />
              <span>Upload File</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />

            <button
              onClick={copyConversation}
              className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 ml-auto"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  <span>Copy Conversation</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Ask about your assignment..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-200 bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || (!userQuery.trim() && uploadedFiles.length === 0)}
              className={`p-2 rounded-lg ${
                isLoading || (!userQuery.trim() && uploadedFiles.length === 0)
                  ? "bg-gray-300 dark:bg-dark-300 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-primary-600 hover:bg-primary-700 text-white"
              }`}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
