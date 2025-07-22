import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { TaskStatus } from "../models/task";

// Validation schema for creating a new task
export const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(100).required().messages({
    "string.empty": "Title cannot be empty",
    "string.max": "Title must be less than 100 characters",
    "any.required": "Title is required",
  }),
  description: Joi.string().max(500).allow("").optional().messages({
    "string.max": "Description must be less than 500 characters",
  }),
  status: Joi.string()
    .valid(...Object.values(TaskStatus))
    .optional()
    .messages({
      "any.only": "Status must be one of: PENDING, COMPLETED, IN_PROGRESS",
    }),
});

// Validation schema for updating a task
export const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(100).optional().messages({
    "string.empty": "Title cannot be empty",
    "string.max": "Title must be less than 100 characters",
  }),
  description: Joi.string().max(500).allow("").optional().messages({
    "string.max": "Description must be less than 500 characters",
  }),
  status: Joi.string()
    .valid(...Object.values(TaskStatus))
    .optional()
    .messages({
      "any.only": "Status must be one of: PENDING, COMPLETED, IN_PROGRESS",
    }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

// Validation schema for query parameters
export const queryParamsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  status: Joi.string()
    .valid(...Object.values(TaskStatus))
    .optional(),
  search: Joi.string().max(100).optional(),
});

// Middleware function to validate request body
export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    req.body = value;
    next();
  };
};

// Middleware function to validate query parameters
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    req.query = value;
    next();
  };
};

// Middleware to validate UUID format
export const validateUUID = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task ID format",
    });
  }

  next();
};
