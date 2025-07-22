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

router.post("/", validateBody(createTaskSchema), createTask);

router.get("/", validateQuery(queryParamsSchema), getAllTasksController);

router.get("/stats", getTaskStats);

router.get("/:id", validateUUID, getTaskByIdController);

router.put(
  "/:id",
  validateUUID,
  validateBody(updateTaskSchema),
  updateTaskController
);

router.delete("/:id", validateUUID, deleteTaskController);

export default router;
