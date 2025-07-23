import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { Task, TaskStatus } from '../models/task';

let db: Database;

const DB_PATH = './tasks.db'; // SQLite database file

export const initializeDatabase = async (): Promise<void> => {
  try {
    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    console.log(`Connected to SQLite database at ${DB_PATH}`);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      );
    `);
    console.log('Tasks table ensured to exist.');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1); // Exit if database cannot be initialized
  }
};

// Get all tasks with optional pagination and filtering
export const getAllTasks = async (
  page?: number,
  limit?: number,
  status?: string,
  search?: string
): Promise<{
  tasks: Task[];
  total: number;
  page?: number;
  totalPages?: number;
}> => {
  let query = 'SELECT * FROM tasks WHERE 1=1';
  const params: (string | number)[] = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status.toUpperCase());
  }

  if (search) {
    query += ' AND title LIKE ?';
    params.push(`%${search}%`);
  }

  // Get total count first
  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const totalResult = await db.get(countQuery, params);
  const total = totalResult ? totalResult.total : 0;

  // Order by createdAt (newest first)
  query += ' ORDER BY createdAt DESC';

  // Apply pagination if provided
  if (page && limit) {
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
  }

  const tasks = await db.all<Task[]>(query, params);

  // Convert Date strings back to Date objects if necessary (sqlite stores DATETIME as string)
  const formattedTasks = tasks.map(task => ({
    ...task,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt)
  }));


  if (page && limit) {
    return {
      tasks: formattedTasks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  return { tasks: formattedTasks, total };
};

// Get task by ID
export const getTaskById = async (id: string): Promise<Task | undefined> => {
  const task = await db.get<Task>('SELECT * FROM tasks WHERE id = ?', id);
  if (task) {
    return {
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt)
    };
  }
  return undefined;
};

// Add new task
export const addTask = async (task: Task): Promise<Task> => {
  await db.run(
    'INSERT INTO tasks (id, title, description, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
    task.id,
    task.title,
    task.description,
    task.status,
    task.createdAt.toISOString(),
    task.updatedAt.toISOString()
  );
  return task;
};

// Update task by ID
// Changed return type from Promise<Task | null> to Promise<Task | undefined>
export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task | undefined> => {
  const existingTask = await getTaskById(id);
  if (!existingTask) {
    return undefined; // Return undefined if task not found, matching getTaskById's return type
  }

  const updatedTask = {
    ...existingTask,
    ...updates,
    updatedAt: new Date(),
  };

  const setClauses: string[] = [];
  const params: (string | Date)[] = [];

  if (updates.title !== undefined) {
    setClauses.push('title = ?');
    params.push(updatedTask.title);
  }
  if (updates.description !== undefined) {
    setClauses.push('description = ?');
    params.push(updatedTask.description);
  }
  if (updates.status !== undefined) {
    setClauses.push('status = ?');
    params.push(updatedTask.status);
  }
  setClauses.push('updatedAt = ?');
  params.push(updatedTask.updatedAt.toISOString());

  const query = `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`;
  params.push(id);

  await db.run(query, params);

  // Retrieve the updated task to return the full object
  return getTaskById(id);
};

// Delete task by ID
export const deleteTask = async (id: string): Promise<boolean> => {
  const result = await db.run('DELETE FROM tasks WHERE id = ?', id);
  // Safely access result.changes, defaulting to 0 if undefined
  return (result.changes ?? 0) > 0;
};

// Get total count of tasks
export const getTaskCount = async (): Promise<number> => {
  const result = await db.get('SELECT COUNT(*) as total FROM tasks');
  return result ? result.total : 0;
};

// Clear all tasks (useful for testing)
export const clearAllTasks = async (): Promise<void> => {
  await db.run('DELETE FROM tasks');
};
