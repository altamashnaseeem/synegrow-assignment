import { Task } from "../models/task";

// In-memory database
let tasks: Task[] = [];

// Get all tasks with optional pagination and filtering
export const getAllTasks = (
  page?: number,
  limit?: number,
  status?: string,
  search?: string
): {
  tasks: Task[];
  total: number;
  page?: number;
  totalPages?: number;
} => {
  let filteredTasks = [...tasks];

  if (status) {
    filteredTasks = filteredTasks.filter(
      (task) => task.status.toLowerCase() === status.toLowerCase()
    );
  }

  if (search) {
    filteredTasks = filteredTasks.filter((task) =>
      task.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Sort by creation date (newest first)
  filteredTasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = filteredTasks.length;

  // Apply pagination if provided
  if (page && limit) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    filteredTasks = filteredTasks.slice(startIndex, endIndex);

    return {
      tasks: filteredTasks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  return { tasks: filteredTasks, total };
};

// Get task by ID
export const getTaskById = (id: string): Task | undefined => {
  return tasks.find((task) => task.id === id);
};

// Add new task
export const addTask = (task: Task): Task => {
  tasks.push(task);
  return task;
};

// Update task by ID
export const updateTask = (id: string, updates: Partial<Task>): Task | null => {
  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return null;
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updates,
    updatedAt: new Date(),
  };

  return tasks[taskIndex];
};

// Delete task by ID
export const deleteTask = (id: string): boolean => {
  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return false;
  }

  tasks.splice(taskIndex, 1);
  return true;
};

// Get total count of tasks
export const getTaskCount = (): number => {
  return tasks.length;
};

// Clear all tasks (useful for testing)
export const clearAllTasks = (): void => {
  tasks = [];
};
