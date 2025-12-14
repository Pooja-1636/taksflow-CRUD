import { User, Task, TaskStatus, TaskPriority, AuthResponse } from '../types';

// Constants for LocalStorage keys
const STORAGE_KEYS = {
  USERS: 'app_users',
  TASKS: 'app_tasks',
  TOKEN: 'app_token',
  CURRENT_USER: 'app_current_user'
};

// Helper to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper interface for storage to include password
interface StoredUser extends User {
  password?: string;
}

// --- Mock Database Initialization ---
const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
  }
};
initStorage();

// --- Auth Services ---

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    await delay(800); // Simulate API call
    const users: StoredUser[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    
    // Auto-register a demo user if list is empty
    if (users.length === 0 && email === 'demo@example.com') {
      const newUser: StoredUser = {
        id: 'user-1',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'admin',
        createdAt: new Date().toISOString(),
        password: 'password'
      };
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      const token = 'fake-jwt-token-' + Date.now();
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      
      const { password: _, ...safeUser } = newUser;
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
      return { user: safeUser, token };
    }

    const user = users.find(u => u.email === email);
    
    // Validate credentials
    if (!user) {
       throw new Error('Invalid credentials');
    }
    
    // Check password if it exists on the record (backward compatibility)
    if (user.password && user.password !== password) {
        throw new Error('Invalid credentials');
    }

    const token = 'fake-jwt-token-' + Date.now();
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    
    const { password: _, ...safeUser } = user;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
    
    return { user: safeUser, token };
  },

  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    await delay(1000);
    const users: StoredUser[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser: StoredUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role: 'user',
      createdAt: new Date().toISOString(),
      password: password
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    const token = 'fake-jwt-token-' + Date.now();
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    
    const { password: _, ...safeUser } = newUser;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));

    return { user: safeUser, token };
  },

  logout: async () => {
    await delay(200);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  updateProfile: async (userId: string, data: { name?: string; email?: string; password?: string }): Promise<User> => {
    await delay(600);
    const users: StoredUser[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) throw new Error('User not found');

    // Update fields
    const updatedUser = { ...users[index] };
    if (data.name) updatedUser.name = data.name;
    if (data.email) updatedUser.email = data.email;
    if (data.password) updatedUser.password = data.password;
    
    users[index] = updatedUser;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Update current session if it's the logged in user
    const { password: _, ...safeUser } = updatedUser;
    
    // Check if we are updating the currently logged in user to sync session
    const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || '{}');
    if (currentUser.id === userId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
    }

    return safeUser;
  }
};

// --- Task Services (CRUD) ---

export const taskService = {
  getAll: async (): Promise<Task[]> => {
    await delay(600);
    const tasks: Task[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error("Unauthorized");
    
    // Filter tasks by logged-in user
    return tasks.filter(t => t.userId === currentUser.id).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  create: async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Task> => {
    await delay(500);
    const tasks: Task[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error("Unauthorized");

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    tasks.push(newTask);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return newTask;
  },

  update: async (id: string, data: Partial<Task>): Promise<Task> => {
    await delay(500);
    const tasks: Task[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    const index = tasks.findIndex(t => t.id === id);
    
    if (index === -1) throw new Error("Task not found");

    const updatedTask = {
      ...tasks[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    tasks[index] = updatedTask;
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return updatedTask;
  },

  delete: async (id: string): Promise<void> => {
    await delay(400);
    let tasks: Task[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }
};