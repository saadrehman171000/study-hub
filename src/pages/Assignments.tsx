import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { AIAssistant } from '../components/AIAssistant';
import { motion } from 'framer-motion';
import { CalendarIcon, List, Plus, Clock, CheckCircle, Trash2, Edit, Loader2, BrainCircuit } from 'lucide-react';
import { format } from 'date-fns';
import { useApi } from '../lib/api/ApiContext';
import { Assignment, AssignmentCreate, AssignmentUpdate } from '../lib/api/assignmentService';


export function Assignments() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [selectedAssignmentForAI, setSelectedAssignmentForAI] = useState<Assignment | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<AssignmentCreate>({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'not-started',
    subject: '',
    priority: 'medium',
  });
  
  const { assignmentService } = useApi();

  // Load assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const data = await assignmentService.getAssignments();
        setAssignments(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError('Failed to load assignments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [assignmentService]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started':
        return 'bg-red-100 text-red-800 dark:bg-red-600/70 dark:text-white';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/70 dark:text-white';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-600/70 dark:text-white';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-600/70 dark:text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-500/70 dark:text-white';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/70 dark:text-white';
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-600/70 dark:text-white';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-600/70 dark:text-white';
    }
  };

  const handleCreateAssignment = async () => {
    try {
      const newAssignment = await assignmentService.createAssignment(formData);
      setAssignments([...assignments, newAssignment]);
      setIsCreating(false);
      resetForm();
    } catch (err) {
      console.error('Error creating assignment:', err);
      setError('Failed to create assignment. Please try again.');
    }
  };

  const handleUpdateAssignment = async () => {
    if (!currentAssignment) return;
    
    try {
      const updatedData: AssignmentUpdate = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        status: formData.status,
        subject: formData.subject,
        priority: formData.priority,
      };
      
      const updatedAssignment = await assignmentService.updateAssignment(
        currentAssignment.id,
        updatedData
      );
      
      setAssignments(
        assignments.map((a) => (a.id === updatedAssignment.id ? updatedAssignment : a))
      );
      
      setIsEditing(false);
      setCurrentAssignment(null);
      resetForm();
    } catch (err) {
      console.error('Error updating assignment:', err);
      setError('Failed to update assignment. Please try again.');
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      await assignmentService.deleteAssignment(id);
      setAssignments(assignments.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Error deleting assignment:', err);
      setError('Failed to delete assignment. Please try again.');
    }
  };

  const editAssignment = (assignment: Assignment) => {
    setCurrentAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      dueDate: new Date(assignment.dueDate).toISOString().split('T')[0],
      status: assignment.status as 'not-started' | 'in-progress' | 'completed',
      subject: assignment.subject || '',
      priority: assignment.priority as 'low' | 'medium' | 'high',
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'not-started',
      subject: '',
      priority: 'medium',
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAIAssistant = (assignment: Assignment) => {
    setSelectedAssignmentForAI(assignment);
    setShowAIAssistant(true);
  };

  const closeAIAssistant = () => {
    setShowAIAssistant(false);
    setSelectedAssignmentForAI(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignments</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'hover:bg-gray-100 dark:hover:bg-dark-200'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg ${
                viewMode === 'calendar'
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'hover:bg-gray-100 dark:hover:bg-dark-200'
              }`}
            >
              <CalendarIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
            >
              <Plus className="h-5 w-5" />
              <span>New Assignment</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 p-4 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-100 rounded-xl shadow-sm"
          >
            {/* Create/Edit Form */}
            {(isCreating || isEditing) && (
              <div className="p-6 border-b border-gray-200 dark:border-dark-200">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {isCreating ? 'Create New Assignment' : 'Edit Assignment'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-200 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-200 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Due Date *
                      </label>
                      <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-200 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-200 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-200 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                      >
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-200 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setIsEditing(false);
                        setCurrentAssignment(null);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={isCreating ? handleCreateAssignment : handleUpdateAssignment}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm"
                    >
                      {isCreating ? 'Create' : 'Update'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'list' ? (
              <div className={`divide-y divide-gray-200 dark:divide-dark-200 ${assignments.length === 0 ? 'p-6 text-center text-gray-500 dark:text-gray-400' : ''}`}>
                {assignments.length === 0 ? (
                  <p>No assignments yet. Create one to get started!</p>
                ) : (
                  assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {assignment.title}
                          </h3>
                          {assignment.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {assignment.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                              {assignment.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                              {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)} priority
                            </span>
                            <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Clock className="h-4 w-4 mr-1" />
                              Due {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 flex items-center"
                            onClick={() => openAIAssistant(assignment)}
                            title="Get AI assistance"
                          >
                            <BrainCircuit className="h-5 w-5" />
                          </button>
                          <button 
                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            onClick={() => editAssignment(assignment)}
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                            onClick={() => handleDeleteAssignment(assignment.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="p-6">
                {/* Calendar view will be integrated with the existing Calendar component */}
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Switch to calendar view to see assignments in calendar format
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* AI Assistant Modal */}
      {showAIAssistant && selectedAssignmentForAI && (
        <AIAssistant 
          assignment={selectedAssignmentForAI} 
          onClose={closeAIAssistant} 
        />
      )}
    </DashboardLayout>
  );
}
