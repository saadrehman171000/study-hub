import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, CheckCircle, Circle, ChevronDown, ChevronUp, Calendar, Target, BarChart3, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useApi } from '../lib/api/ApiContext';
import { AcademicGoal, Milestone, AcademicGoalCreate, AcademicGoalUpdate } from '../lib/api/academicGoalService';

// Define the goal interface (now using imported types)
interface Goal extends AcademicGoal {}

export function AcademicGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'progress' | 'title'>('date');
  
  const { academicGoalService } = useApi();
  
  // Form state
  const [formData, setFormData] = useState<Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    description: '',
    targetDate: new Date().toISOString().split('T')[0],
    category: 'academic',
    progress: 0,
    milestones: []
  });
  
  // New milestone form state
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    dueDate: ''
  });

  // Load goals (simulating API call)
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchGoals = async () => {
      try {
        setLoading(true);
        // Fetch goals from API
        const fetchedGoals = await academicGoalService.getAcademicGoals(
          filterCategory !== 'all' ? filterCategory : undefined
        );
        setGoals(fetchedGoals);
        setError(null);
      } catch (err) {
        console.error('Error fetching goals:', err);
        setError('Failed to load goals. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [academicGoalService, filterCategory]);

  // Filter and sort goals
  const filteredAndSortedGoals = [...goals].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    } else if (sortBy === 'progress') {
      return b.progress - a.progress;
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  // Toggle goal expansion
  const toggleGoalExpansion = (goalId: string) => {
    setExpandedGoal(expandedGoal === goalId ? null : goalId);
  };

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle progress change
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      progress: parseInt(e.target.value)
    });
  };

  // Add new milestone to form
  const addMilestone = () => {
    if (!newMilestone.title.trim()) return;
    
    setFormData({
      ...formData,
      milestones: [
        ...formData.milestones,
        {
          id: `temp-${Date.now()}`,
          title: newMilestone.title,
          completed: false,
          dueDate: newMilestone.dueDate || undefined
        }
      ]
    });
    
    setNewMilestone({ title: '', dueDate: '' });
  };

  // Remove milestone from form
  const removeMilestone = (index: number) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, i) => i !== index)
    });
  };

  // Create new goal
  const createGoal = async () => {
    if (!formData.title.trim()) {
      setError('Goal title is required');
      return;
    }
    
    try {
      setLoading(true);
      const newGoal = await academicGoalService.createAcademicGoal({
        title: formData.title,
        description: formData.description,
        targetDate: formData.targetDate,
        category: formData.category,
        progress: formData.progress,
        milestones: formData.milestones.map(m => ({
          id: m.id && m.id.startsWith('temp-') ? undefined : m.id,
          title: m.title,
          completed: m.completed,
          dueDate: m.dueDate
        }))
      });
      
      setGoals([...goals, newGoal]);
      resetForm();
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error('Error creating goal:', err);
      setError('Failed to create goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update existing goal
  const updateGoal = async () => {
    if (!editingGoal || !formData.title.trim()) return;
    
    try {
      setLoading(true);
      
      const updateData: AcademicGoalUpdate = {
        title: formData.title,
        description: formData.description,
        targetDate: formData.targetDate,
        category: formData.category,
        progress: formData.progress,
        // Use type casting to satisfy TypeScript while still handling temp IDs
        milestones: formData.milestones.map(m => {
          if (m.id.startsWith('temp-')) {
            // For new milestones, we need to create a new object that omits the ID
            return {
              title: m.title,
              completed: m.completed,
              dueDate: m.dueDate,
              // Add a dummy ID that will be ignored by the backend
              id: '' 
            };
          }
          return m;
        }) as Omit<Milestone, 'goalId'>[]
      };
      
      const updatedGoal = await academicGoalService.updateAcademicGoal(
        editingGoal.id,
        updateData
      );
      
      setGoals(goals.map(goal => goal.id === editingGoal.id ? updatedGoal : goal));
      resetForm();
      setEditingGoal(null);
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error('Error updating goal:', err);
      setError('Failed to update goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete goal
  const deleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      setLoading(true);
      await academicGoalService.deleteAcademicGoal(goalId);
      setGoals(goals.filter(goal => goal.id !== goalId));
      setError(null);
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError('Failed to delete goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Edit goal
  const editGoal = (goal: Goal) => {
    setFormData({
      title: goal.title,
      description: goal.description || '',
      targetDate: new Date(goal.targetDate).toISOString().split('T')[0],
      category: goal.category,
      progress: goal.progress,
      milestones: goal.milestones
    });
    
    setEditingGoal(goal);
    setShowForm(true);
  };

  // Toggle milestone completion
  const toggleMilestoneCompletion = async (goalId: string, milestoneId: string, currentlyCompleted: boolean) => {
    try {
      setLoading(true);
      
      // Update milestone status on the server
      await academicGoalService.updateMilestoneStatus(
        goalId, 
        milestoneId, 
        !currentlyCompleted
      );
      
      // Refresh the goals to get updated progress
      const updatedGoal = await academicGoalService.getAcademicGoal(goalId);
      
      // Update goals state
      setGoals(goals.map(goal => {
        if (goal.id === goalId) {
          return updatedGoal;
        }
        return goal;
      }));
      
      setError(null);
    } catch (err) {
      console.error('Error updating milestone:', err);
      setError('Failed to update milestone. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetDate: new Date().toISOString().split('T')[0],
      category: 'academic',
      progress: 0,
      milestones: []
    });
    setNewMilestone({ title: '', dueDate: '' });
    setError(null);
  };

  // Get category label
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'academic': return 'Academic';
      case 'exam': return 'Exam';
      case 'project': return 'Project';
      case 'skill': return 'Skill';
      case 'other': return 'Other';
      default: return category;
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-500/70 dark:text-white';
      case 'exam':
        return 'bg-red-100 text-red-800 dark:bg-red-600/70 dark:text-white';
      case 'project':
        return 'bg-green-100 text-green-800 dark:bg-green-600/70 dark:text-white';
      case 'skill':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-600/70 dark:text-white';
      case 'other':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-600/70 dark:text-white';
    }
  };

  // Get progress color
  const getProgressColor = (progress: number) => {
    if (progress < 25) {
      return 'bg-red-500 dark:bg-red-600';
    } else if (progress < 50) {
      return 'bg-yellow-500 dark:bg-yellow-600';
    } else if (progress < 75) {
      return 'bg-blue-500 dark:bg-blue-600';
    } else {
      return 'bg-green-500 dark:bg-green-600';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Academic Goals</h1>
          <button 
            onClick={() => {
              resetForm();
              setEditingGoal(null);
              setShowForm(!showForm);
            }}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            <Plus className="h-5 w-5" />
            <span>New Goal</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Goal Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-dark-100 rounded-xl shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-dark-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-200 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                    placeholder="Enter a specific goal"
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
                    placeholder="Describe your goal in detail"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Date *
                    </label>
                    <input
                      type="date"
                      name="targetDate"
                      value={formData.targetDate}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-200 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-200 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                    >
                      <option value="academic">Academic</option>
                      <option value="exam">Exam</option>
                      <option value="project">Project</option>
                      <option value="skill">Skill</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Progress ({formData.progress}%)
                  </label>
                  <input
                    type="range"
                    name="progress"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={handleProgressChange}
                    className="w-full h-2 bg-gray-200 dark:bg-dark-300 rounded-lg appearance-none cursor-pointer accent-primary-600 dark:accent-primary-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Milestones
                    </label>
                  </div>
                  
                  {/* Existing Milestones */}
                  <div className="space-y-2 mb-4">
                    {formData.milestones.map((milestone, index) => (
                      <div key={milestone.id} className="flex items-center justify-between bg-gray-50 dark:bg-dark-200 p-2 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{milestone.title}</p>
                          {milestone.dueDate && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Due: {format(new Date(milestone.dueDate), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMilestone(index)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add New Milestone */}
                  <div className="flex flex-col md:flex-row gap-2">
                    <input
                      type="text"
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                      placeholder="Add a milestone"
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-200 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                    />
                    <input
                      type="date"
                      value={newMilestone.dueDate}
                      onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                      className="w-full md:w-auto px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-200 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={addMilestone}
                      className="w-full md:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingGoal(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={editingGoal ? updateGoal : createGoal}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm dark:bg-primary-500 dark:hover:bg-primary-600"
                  >
                    {editingGoal ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters and Sorting */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                filterCategory === 'all'
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-dark-200 dark:text-gray-300'
              }`}
            >
              All Goals
            </button>
            <button
              onClick={() => setFilterCategory('academic')}
              className={`px-3 py-1 rounded-full text-sm ${
                filterCategory === 'academic'
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-dark-200 dark:text-gray-300'
              }`}
            >
              Academic
            </button>
            <button
              onClick={() => setFilterCategory('exam')}
              className={`px-3 py-1 rounded-full text-sm ${
                filterCategory === 'exam'
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-dark-200 dark:text-gray-300'
              }`}
            >
              Exams
            </button>
            <button
              onClick={() => setFilterCategory('project')}
              className={`px-3 py-1 rounded-full text-sm ${
                filterCategory === 'project'
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-dark-200 dark:text-gray-300'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setFilterCategory('skill')}
              className={`px-3 py-1 rounded-full text-sm ${
                filterCategory === 'skill'
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-dark-200 dark:text-gray-300'
              }`}
            >
              Skills
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'progress' | 'title')}
              className="px-3 py-1 rounded-lg border border-gray-300 dark:border-dark-200 bg-white dark:bg-dark-200 text-gray-900 dark:text-white text-sm"
            >
              <option value="date">Due Date</option>
              <option value="progress">Progress</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>

        {/* Goals List */}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedGoals.length === 0 ? (
              <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No goals found. Create a new goal to get started!
                </p>
              </div>
            ) : (
              filteredAndSortedGoals.map((goal) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-dark-100 rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(goal.category)}`}>
                            {getCategoryLabel(goal.category)}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-4">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Due {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center">
                            <Target className="h-4 w-4 mr-1" />
                            {goal.milestones.length} milestones
                          </span>
                        </div>
                        
                        {goal.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {expandedGoal === goal.id 
                              ? goal.description 
                              : goal.description.length > 120 
                                ? `${goal.description.substring(0, 120)}...` 
                                : goal.description
                            }
                          </p>
                        )}
                        
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{goal.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-dark-300 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${getProgressColor(goal.progress)}`}
                              style={{ width: `${goal.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button 
                          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                          onClick={() => editGoal(goal)}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                          onClick={() => toggleGoalExpansion(goal.id)}
                        >
                          {expandedGoal === goal.id ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Expanded Content - Milestones */}
                    {expandedGoal === goal.id && (
                      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-200">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Milestones</h4>
                        <div className="space-y-2">
                          {goal.milestones.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No milestones added yet.</p>
                          ) : (
                            goal.milestones.map((milestone) => (
                              <div 
                                key={milestone.id} 
                                className="flex items-start p-2 rounded-lg bg-gray-50 dark:bg-dark-200"
                              >
                                <button
                                  onClick={() => toggleMilestoneCompletion(goal.id, milestone.id, milestone.completed)}
                                  className={`mr-2 mt-0.5 text-gray-400 ${
                                    milestone.completed ? 'text-green-500 dark:text-green-400' : ''
                                  }`}
                                >
                                  {milestone.completed ? (
                                    <CheckCircle className="h-5 w-5" />
                                  ) : (
                                    <Circle className="h-5 w-5" />
                                  )}
                                </button>
                                <div className="flex-1">
                                  <p className={`text-sm font-medium ${
                                    milestone.completed 
                                      ? 'text-gray-500 dark:text-gray-400 line-through' 
                                      : 'text-gray-900 dark:text-white'
                                  }`}>
                                    {milestone.title}
                                  </p>
                                  {milestone.dueDate && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Due: {format(new Date(milestone.dueDate), 'MMM d, yyyy')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}