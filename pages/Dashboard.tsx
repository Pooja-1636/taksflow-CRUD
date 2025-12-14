import React, { useEffect, useState, useMemo } from 'react';
import { taskService } from '../services/api';
import { Task, TaskStatus, TaskPriority } from '../types';
import { Button, Input, Select, TextArea, Card, Badge, Modal } from '../components/Common';
import { Plus, Search, Filter, Edit2, Trash2, Calendar, AlertCircle, ChevronDown, Save, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  
  // Modal State for Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Modal State for Delete Confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Modal State for Update Confirmation
  const [isUpdateConfirmModalOpen, setIsUpdateConfirmModalOpen] = useState(false);

  const { user } = useAuth();

  const fetchTasks = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await taskService.getAll();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateOpen = () => {
    setCurrentTask({
      title: '',
      description: '',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date().toISOString().split('T')[0],
      assignedTo: ''
    });
    setValidationErrors({});
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditOpen = (task: Task) => {
    // Ensure status and priority have fallbacks if missing in data
    setCurrentTask({ 
      ...task, 
      status: task.status || TaskStatus.TODO,
      priority: task.priority || TaskPriority.MEDIUM,
      dueDate: task.dueDate.split('T')[0],
      assignedTo: task.assignedTo || ''
    });
    setValidationErrors({});
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const initiateDelete = (id: string) => {
    setTaskToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    
    try {
      await taskService.delete(taskToDelete);
      setTasks(prev => prev.filter(t => t.id !== taskToDelete));
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    
    try {
      await taskService.update(taskId, { status: newStatus });
      // Refresh list to ensure consistency, but don't show full loading spinner
      await fetchTasks(false);
    } catch (err) {
      console.error("Failed to update status", err);
      // Revert/Refresh on error
      fetchTasks(true);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!currentTask.title?.trim()) {
      errors.title = 'Title is required';
    } else if (currentTask.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    }

    if (!currentTask.description?.trim()) {
      errors.description = 'Description is required';
    } else if (currentTask.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    }

    if (!currentTask.dueDate) {
      errors.dueDate = 'Due date is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isEditMode && currentTask.id) {
        setIsUpdateConfirmModalOpen(true);
        return;
    }

    // Create flow
    processSubmit();
  };

  const processSubmit = async () => {
      setIsSubmitting(true);
      try {
        const payload = {
          ...currentTask,
          status: currentTask.status || TaskStatus.TODO,
          priority: currentTask.priority || TaskPriority.MEDIUM
        };
  
        if (isEditMode && currentTask.id) {
          const updated = await taskService.update(currentTask.id, payload);
          setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
        } else {
          const created = await taskService.create(payload as Omit<Task, 'id'>);
          setTasks(prev => [created, ...prev]);
        }
        setIsModalOpen(false);
        setIsUpdateConfirmModalOpen(false);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
  };

  // Filter Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'ALL' || task.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [tasks, searchQuery, filterStatus]);

  // Helpers for UI
  const getPriorityColor = (p: TaskPriority) => {
    switch(p) {
      case TaskPriority.HIGH: return 'red';
      case TaskPriority.MEDIUM: return 'yellow';
      case TaskPriority.LOW: return 'blue';
      default: return 'gray';
    }
  };

  const getStatusColor = (s: TaskStatus) => {
    switch(s) {
      case TaskStatus.COMPLETED: return 'green';
      case TaskStatus.IN_PROGRESS: return 'blue';
      case TaskStatus.TODO: return 'gray';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">Welcome back, {user?.name}. Here's what needs to be done.</p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button onClick={handleCreateOpen} icon={Plus}>New Task</Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-10 block w-full border border-gray-300 rounded-md py-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select 
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: TaskStatus.TODO, label: 'To Do' },
                { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
                { value: TaskStatus.COMPLETED, label: 'Completed' },
              ]}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Task List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <CheckSquare className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {filteredTasks.map(task => (
              <Card key={task.id} className="p-5 hover:shadow-md transition-shadow flex flex-col h-full border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <Badge color={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => handleEditOpen(task)} className="text-gray-400 hover:text-primary-600 transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => initiateDelete(task.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{task.title}</h3>
                <p className="text-gray-500 text-sm mb-4 flex-grow line-clamp-3">{task.description}</p>
                
                {task.assignedTo && (
                  <div className="flex items-center text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded">
                    <UserIcon className="h-3 w-3 mr-1.5" />
                    <span className="font-medium mr-1">Assigned to:</span> {task.assignedTo}
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <div className="relative group/status inline-block">
                    <select
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        title="Change status"
                    >
                        <option value={TaskStatus.TODO}>TODO</option>
                        <option value={TaskStatus.IN_PROGRESS}>IN PROGRESS</option>
                        <option value={TaskStatus.COMPLETED}>COMPLETED</option>
                    </select>
                    <div className="transition-transform group-hover/status:scale-105">
                        <Badge color={getStatusColor(task.status)}>
                            <div className="flex items-center gap-1">
                                {task.status.replace('_', ' ')}
                                <ChevronDown className="h-3 w-3 opacity-0 group-hover/status:opacity-100 transition-opacity" />
                            </div>
                        </Badge>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={isEditMode ? 'Edit Task' : 'Create New Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Title" 
            required 
            value={currentTask.title || ''} 
            onChange={e => setCurrentTask({...currentTask, title: e.target.value})}
            error={validationErrors.title}
          />
          <TextArea 
            label="Description" 
            required
            className="h-24"
            value={currentTask.description || ''}
            onChange={e => setCurrentTask({...currentTask, description: e.target.value})}
            error={validationErrors.description}
          />
          
          <Input 
            label="Assigned To" 
            placeholder="Enter assignee name"
            value={currentTask.assignedTo || ''} 
            onChange={e => setCurrentTask({...currentTask, assignedTo: e.target.value})}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Status"
              options={[
                { value: TaskStatus.TODO, label: 'To Do' },
                { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
                { value: TaskStatus.COMPLETED, label: 'Completed' },
              ]}
              value={currentTask.status || TaskStatus.TODO}
              onChange={e => setCurrentTask({...currentTask, status: e.target.value as TaskStatus})}
              error={validationErrors.status}
            />
             <Select 
              label="Priority"
              options={[
                { value: TaskPriority.LOW, label: 'Low' },
                { value: TaskPriority.MEDIUM, label: 'Medium' },
                { value: TaskPriority.HIGH, label: 'High' },
              ]}
              value={currentTask.priority || TaskPriority.MEDIUM}
              onChange={e => setCurrentTask({...currentTask, priority: e.target.value as TaskPriority})}
              error={validationErrors.priority}
            />
          </div>
          <Input 
            label="Due Date" 
            type="date"
            required
            value={currentTask.dueDate || ''}
            onChange={e => setCurrentTask({...currentTask, dueDate: e.target.value})}
            error={validationErrors.dueDate}
          />
          <div className="flex justify-end pt-4 space-x-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>{isEditMode ? 'Save Changes' : 'Create Task'}</Button>
          </div>
        </form>
      </Modal>

      {/* Update Confirmation Modal */}
      <Modal
        isOpen={isUpdateConfirmModalOpen}
        onClose={() => setIsUpdateConfirmModalOpen(false)}
        title="Confirm Update"
      >
        <div className="space-y-4">
            <div className="flex items-center space-x-3 text-blue-600 bg-blue-50 p-3 rounded-md">
                <AlertCircle className="h-6 w-6" />
                <p className="text-sm font-medium">Update Task Details</p>
            </div>
            <p className="text-sm text-gray-500">
                Are you sure you want to save these changes to the task?
            </p>
            <div className="flex justify-end pt-2 space-x-3">
                <Button variant="secondary" onClick={() => setIsUpdateConfirmModalOpen(false)}>Cancel</Button>
                <Button onClick={processSubmit} isLoading={isSubmitting} icon={Save}>Confirm Update</Button>
            </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Task"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="h-6 w-6" />
            <p className="text-sm font-medium">This action cannot be undone.</p>
          </div>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this task? It will be permanently removed from your dashboard.
          </p>
          <div className="flex justify-end pt-2 space-x-3">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete Task</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// CheckSquare Icon helper for empty state
function CheckSquare(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}