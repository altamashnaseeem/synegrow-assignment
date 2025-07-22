import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Task, TaskStatus, CreateTaskRequest, UpdateTaskRequest } from '../models/task';
import { 
  getAllTasks, 
  getTaskById, 
  addTask, 
  updateTask, 
  deleteTask 
} from '../utils/database';

// Create a new task
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, status }: CreateTaskRequest = req.body;
    
    const newTask: Task = {
      id: uuidv4(),
      title,
      description: description || '',
      status: status || TaskStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const createdTask = addTask(newTask);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: createdTask
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all tasks with optional pagination and filtering
export const getAllTasksController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, status, search } = req.query as {
      page?: string;
      limit?: string;
      status?: string;
      search?: string;
    };

    const pageNum = page ? parseInt(page) : undefined;
    const limitNum = limit ? parseInt(limit) : undefined;

    const result = getAllTasks(pageNum, limitNum, status, search);

    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: result.tasks,
      pagination: pageNum && limitNum ? {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalItems: result.total,
        itemsPerPage: limitNum
      } : undefined,
      total: result.total
    });
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get a single task by ID
export const getTaskByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const task = getTaskById(id);

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task retrieved successfully',
      data: task
    });
  } catch (error) {
    console.error('Error getting task:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update a task by ID
export const updateTaskController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates: UpdateTaskRequest = req.body;

    const updatedTask = updateTask(id, updates);

    if (!updatedTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete a task by ID
export const deleteTaskController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = deleteTask(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get task statistics 
export const getTaskStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const allTasks = getAllTasks();
    const tasks = allTasks.tasks;

    const stats = {
      total: tasks.length,
      pending: tasks.filter(task => task.status === TaskStatus.PENDING).length,
      inProgress: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length,
      completed: tasks.filter(task => task.status === TaskStatus.COMPLETED).length
    };

    res.status(200).json({
      success: true,
      message: 'Task statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error getting task stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};