import { DashboardLayout } from '../components/DashboardLayout';
import { motion } from 'framer-motion';
import { CalendarIcon, ChevronLeft, ChevronRight, Loader2, Plus, X, Clock, File } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from 'date-fns';
import { useApi } from '../lib/api/ApiContext';
import { CalendarEvent } from '../lib/api/calendarService';
import { Assignment } from '../lib/api/assignmentService';

// Define a combined event type for calendar display
interface CalendarDisplayEvent {
  id: string;
  title: string;
  date: string;
  type: 'event' | 'deadline' | 'completed' | 'meeting';
  description?: string | null;
  startTime?: string;
  endTime?: string;
  originalEvent?: CalendarEvent | Assignment;
}

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarDisplayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState<CalendarDisplayEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventType: 'event',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '10:00',
    allDay: false,
    location: ''
  });
  
  const { calendarService, assignmentService } = useApi();
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start, end });

  useEffect(() => {
    fetchEvents();
  }, [calendarService, assignmentService]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Fetch calendar events
      const calendarEvents = await calendarService.getCalendarEvents();
      
      // Fetch assignments (they also go on the calendar)
      const assignments = await assignmentService.getAssignments();
      
      // Combine and format events for the calendar
      const formattedEvents: CalendarDisplayEvent[] = [
        ...calendarEvents.map(event => ({
          id: event.id,
          title: event.title,
          date: format(new Date(event.startTime), 'yyyy-MM-dd'),
          type: (event.type === 'meeting' ? 'meeting' : 'event') as 'event' | 'meeting',
          description: event.description,
          startTime: format(new Date(event.startTime), 'HH:mm'),
          endTime: event.endTime ? format(new Date(event.endTime), 'HH:mm') : undefined,
          originalEvent: event
        })),
        ...assignments.map(assignment => ({
          id: assignment.id,
          title: assignment.title,
          date: format(new Date(assignment.dueDate), 'yyyy-MM-dd'),
          type: assignment.status === 'completed' ? 'completed' as const : 'deadline' as const,
          description: assignment.description,
          originalEvent: assignment
        }))
      ];
      
      setEvents(formattedEvents);
      setError(null);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError('Failed to load calendar events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = (date: Date) => {
    setSelectedDate(date);
    const formattedDate = format(date, 'yyyy-MM-dd');
    setNewEvent({
      ...newEvent,
      startDate: formattedDate,
      endDate: formattedDate
    });
    setShowAddModal(true);
  };

  const handleCreateEvent = async () => {
    try {
      if (!newEvent.title) {
        setError('Event title is required');
        return;
      }
      
      const startDateTime = new Date(`${newEvent.startDate}T${newEvent.startTime}`);
      let endDateTime = null;
      
      if (newEvent.endDate && newEvent.endTime) {
        endDateTime = new Date(`${newEvent.endDate}T${newEvent.endTime}`);
      }
      
      // Create new event
      await calendarService.createCalendarEvent({
        title: newEvent.title,
        description: newEvent.description,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime ? endDateTime.toISOString() : undefined,
        allDay: newEvent.allDay,
        type: newEvent.eventType as 'event' | 'meeting'
      });
      
      // Reset form and close modal
      setNewEvent({
        title: '',
        description: '',
        eventType: 'event',
        startDate: '',
        startTime: '09:00',
        endDate: '',
        endTime: '10:00',
        allDay: false,
        location: ''
      });
      setShowAddModal(false);
      
      // Refresh events
      await fetchEvents();
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event. Please try again.');
    }
  };

  const handleDeleteEvent = async (event: CalendarDisplayEvent) => {
    if (!event.originalEvent) return;
    
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        if (event.type === 'event' || event.type === 'meeting') {
          // It's a calendar event
          await calendarService.deleteCalendarEvent(event.id);
        } else if (event.type === 'deadline' || event.type === 'completed') {
          // It's an assignment
          await assignmentService.deleteAssignment(event.id);
        }
        
        setShowEventDetails(null);
        await fetchEvents();
      } catch (err) {
        console.error('Error deleting event:', err);
        setError('Failed to delete event. Please try again.');
      }
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'deadline':
        return 'bg-red-100 text-red-800 dark:bg-red-600/70 dark:text-white';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-600/70 dark:text-white';
      case 'meeting':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/70 dark:text-white';
      case 'event':
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-500/70 dark:text-white';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <button 
            onClick={() => {
              setSelectedDate(new Date());
              setNewEvent({
                ...newEvent,
                startDate: format(new Date(), 'yyyy-MM-dd'),
                endDate: format(new Date(), 'yyyy-MM-dd')
              });
              setShowAddModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            <Plus className="h-5 w-5" />
            <span>Add Event</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 p-4 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-100 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {days.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {daysInMonth.map((day, index) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayEvents = events.filter(event => event.date === dateKey);
                
                return (
                  <div
                    key={index}
                    className={`
                      h-24 p-2 border rounded-lg relative
                      ${isToday(day) ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-700' : 'border-gray-200 dark:border-gray-700'}
                      ${!isSameMonth(day, currentDate) ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}
                    `}
                  >
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{format(day, 'd')}</span>
                      {isSameMonth(day, currentDate) && (
                        <button 
                          onClick={() => handleAddEvent(day)}
                          className="text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="mt-1 space-y-1 overflow-y-auto max-h-16">
                      {dayEvents.map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className={`
                            text-xs p-1 rounded truncate cursor-pointer hover:opacity-80
                            ${getEventTypeColor(event.type)}
                          `}
                          title={event.title}
                          onClick={() => setShowEventDetails(event)}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-100 rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Event</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Title*
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-dark-800 dark:text-white"
                  placeholder="Enter event title"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Type
                </label>
                <select
                  value={newEvent.eventType}
                  onChange={e => setNewEvent({ ...newEvent, eventType: e.target.value as 'event' | 'meeting' })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-dark-800 dark:text-white"
                >
                  <option value="event">Event</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newEvent.startDate}
                    onChange={e => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-dark-800 dark:text-white"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-dark-800 dark:text-white"
                    disabled={newEvent.allDay}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newEvent.endDate}
                    onChange={e => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-dark-800 dark:text-white"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-dark-800 dark:text-white"
                    disabled={newEvent.allDay}
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={newEvent.allDay}
                  onChange={e => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                  className="mr-2 dark:accent-primary-400"
                />
                <label htmlFor="allDay" className="text-sm text-gray-700 dark:text-gray-300">
                  All day event
                </label>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Location"
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-dark-800 dark:text-white"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Description"
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-dark-800 dark:text-white"
                  rows={3}
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-200 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-100 rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Event Details</h3>
              <button 
                onClick={() => setShowEventDetails(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${getEventTypeColor(showEventDetails.type)}`}>
              {showEventDetails.type.charAt(0).toUpperCase() + showEventDetails.type.slice(1)}
            </div>
            
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{showEventDetails.title}</h2>
            
            {showEventDetails.description && (
              <p className="text-gray-700 dark:text-gray-300 mb-4">{showEventDetails.description}</p>
            )}
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="flex items-center space-x-3 mb-2">
                <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {format(parseISO(showEventDetails.date), 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              
              {showEventDetails.startTime && (
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {showEventDetails.startTime} 
                    {showEventDetails.endTime ? ` - ${showEventDetails.endTime}` : ''}
                  </span>
                </div>
              )}
            </div>
            
            {(showEventDetails.type === 'event' || showEventDetails.type === 'meeting') && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <button
                  onClick={() => handleDeleteEvent(showEventDetails)}
                  className="w-full text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg p-2 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  Delete Event
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
