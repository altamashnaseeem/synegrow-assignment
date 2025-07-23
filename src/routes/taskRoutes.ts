import express from "express";
import {
  createTask,
  getAllTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
  getTaskStats,
} from "../controllers/taskController";
import {
  validateBody,
  validateQuery,
  validateUUID,
  createTaskSchema,
  updateTaskSchema,
  queryParamsSchema,
} from "../middleware/validation";

const router = express.Router();

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *           examples:
 *             basic:
 *               summary: Basic task creation
 *               value:
 *                 title: "Complete project documentation"
 *                 description: "Write comprehensive documentation for the API"
 *                 status: "PENDING"
 *             minimal:
 *               summary: Minimal task (title only)
 *               value:
 *                 title: "Review code changes"
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               errors:
 *                 - field: "title"
 *                   message: "Title is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", validateBody(createTaskSchema), createTask);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks with pagination and filtering
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of tasks per page
 *         example: 10
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/TaskStatus'
 *         description: Filter tasks by status
 *         example: "PENDING"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search tasks by title or description
 *         example: "groceries"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title, status]
 *           default: createdAt
 *         description: Field to sort by
 *         example: "createdAt"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *         example: "desc"
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Tasks retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *             examples:
 *               success:
 *                 summary: Successful response with tasks
 *                 value:
 *                   success: true
 *                   message: "Tasks retrieved successfully"
 *                   data:
 *                     - id: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *                       title: "Buy groceries"
 *                       description: "Milk, eggs, bread, and fruits"
 *                       status: "PENDING"
 *                       createdAt: "2023-10-27T10:00:00.000Z"
 *                       updatedAt: "2023-10-27T10:00:00.000Z"
 *                   pagination:
 *                     currentPage: 1
 *                     totalPages: 3
 *                     totalItems: 25
 *                     itemsPerPage: 10
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", validateQuery(queryParamsSchema), getAllTasksController);

/**
 * @swagger
 * /tasks/stats:
 *   get:
 *     summary: Get task statistics
 *     tags: [Tasks]
 *     description: Retrieve statistics about tasks including total count and count by status
 *     responses:
 *       200:
 *         description: Task statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task statistics retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/TaskStats'
 *             examples:
 *               success:
 *                 summary: Successful statistics response
 *                 value:
 *                   success: true
 *                   message: "Task statistics retrieved successfully"
 *                   data:
 *                     total: 15
 *                     pending: 5
 *                     inProgress: 7
 *                     completed: 3
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/stats", getTaskStats);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the task
 *         example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *             examples:
 *               success:
 *                 summary: Successful task retrieval
 *                 value:
 *                   success: true
 *                   message: "Task retrieved successfully"
 *                   data:
 *                     id: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *                     title: "Buy groceries"
 *                     description: "Milk, eggs, bread, and fruits"
 *                     status: "PENDING"
 *                     createdAt: "2023-10-27T10:00:00.000Z"
 *                     updatedAt: "2023-10-27T10:00:00.000Z"
 *       400:
 *         description: Invalid UUID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Invalid UUID format"
 *               errors: null
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Task not found"
 *               errors: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", validateUUID, getTaskByIdController);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the task
 *         example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskRequest'
 *           examples:
 *             fullUpdate:
 *               summary: Update all fields
 *               value:
 *                 title: "Buy groceries and cook dinner"
 *                 description: "Milk, eggs, bread, fruits, and ingredients for pasta"
 *                 status: "IN_PROGRESS"
 *             statusOnly:
 *               summary: Update status only
 *               value:
 *                 status: "COMPLETED"
 *             titleAndDescription:
 *               summary: Update title and description
 *               value:
 *                 title: "Updated task title"
 *                 description: "Updated task description"
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error or invalid UUID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationError:
 *                 summary: Validation error
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "title"
 *                       message: "Title must be between 1 and 100 characters"
 *               invalidUUID:
 *                 summary: Invalid UUID
 *                 value:
 *                   success: false
 *                   message: "Invalid UUID format"
 *                   errors: null
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Task not found"
 *               errors: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  "/:id",
  validateUUID,
  validateBody(updateTaskSchema),
  updateTaskController
);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the task to delete
 *         example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedTaskId:
 *                       type: string
 *                       format: uuid
 *                       example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *             examples:
 *               success:
 *                 summary: Successful deletion
 *                 value:
 *                   success: true
 *                   message: "Task deleted successfully"
 *                   data:
 *                     deletedTaskId: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *       400:
 *         description: Invalid UUID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Invalid UUID format"
 *               errors: null
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Task not found"
 *               errors: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", validateUUID, deleteTaskController);

export default router;