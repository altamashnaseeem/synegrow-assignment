import swaggerJsdoc from 'swagger-jsdoc';
import { TaskStatus } from './models/task'; // Import TaskStatus for schema definition

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: `
        A comprehensive Task Management API built with Express, TypeScript, and SQLite.
        
        ## Features
        - Create, read, update, and delete tasks
        - Filter and search tasks
        - Pagination support
        - Task statistics
        - Input validation
        - Error handling
        
        ## Base URL
        All API endpoints are prefixed with \`/api\`
        
        ## Response Format
        All responses follow a consistent format:
        \`\`\`json
        {
          "success": boolean,
          "message": string,
          "data": object | array,
          "pagination": object (for paginated responses),
          "errors": array (for validation errors)
        }
        \`\`\`
      `,
      contact: {
        name: 'API Support',
        email: 'support@taskmanagement.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
      {
        url: 'https://api.taskmanagement.com/api',
        description: 'Production server',
      },
    ],
    components: {
      schemas: {
        TaskStatus: {
          type: 'string',
          enum: Object.values(TaskStatus),
          description: 'The status of a task.',
          example: TaskStatus.PENDING,
        },
        Task: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'The unique identifier of the task.',
              example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            },
            title: {
              type: 'string',
              description: 'The title of the task.',
              example: 'Buy groceries',
              minLength: 1,
              maxLength: 100,
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'A detailed description of the task.',
              example: 'Milk, eggs, bread, and fruits.',
              maxLength: 500,
            },
            status: {
              $ref: '#/components/schemas/TaskStatus',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date and time when the task was created.',
              example: '2023-10-27T10:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date and time when the task was last updated.',
              example: '2023-10-27T11:30:00.000Z',
            },
          },
          required: ['id', 'title', 'status', 'createdAt', 'updatedAt'],
        },
        CreateTaskRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The title of the task.',
              example: 'Plan vacation',
              minLength: 1,
              maxLength: 100,
            },
            description: {
              type: 'string',
              description: 'Optional description of the task.',
              example: 'Research destinations and book flights.',
              maxLength: 500,
            },
            status: {
              $ref: '#/components/schemas/TaskStatus',
              description: 'Initial status of the task (defaults to PENDING).',
            },
          },
          required: ['title'],
          additionalProperties: false,
        },
        UpdateTaskRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'New title for the task.',
              example: 'Finalize vacation plans',
              minLength: 1,
              maxLength: 100,
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'New description for the task.',
              example: 'Confirm hotel bookings and activities.',
              maxLength: 500,
            },
            status: {
              $ref: '#/components/schemas/TaskStatus',
              description: 'New status for the task.',
            },
          },
          minProperties: 1,
          additionalProperties: false,
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
              description: 'Indicates if the request was successful',
            },
            message: {
              type: 'string',
              example: 'Internal server error',
              description: 'Human-readable error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'title',
                    description: 'The field that caused the validation error',
                  },
                  message: {
                    type: 'string',
                    example: 'Title cannot be empty',
                    description: 'Detailed error message for the field',
                  },
                },
                required: ['field', 'message'],
              },
              nullable: true,
              description: 'Array of validation errors (only present for validation failures)',
            },
          },
          required: ['success', 'message'],
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'number',
              example: 1,
              minimum: 1,
              description: 'Current page number',
            },
            totalPages: {
              type: 'number',
              example: 5,
              minimum: 0,
              description: 'Total number of pages',
            },
            totalItems: {
              type: 'number',
              example: 50,
              minimum: 0,
              description: 'Total number of items across all pages',
            },
            itemsPerPage: {
              type: 'number',
              example: 10,
              minimum: 1,
              maximum: 100,
              description: 'Number of items per page',
            },
            hasNextPage: {
              type: 'boolean',
              example: true,
              description: 'Indicates if there is a next page',
            },
            hasPreviousPage: {
              type: 'boolean',
              example: false,
              description: 'Indicates if there is a previous page',
            },
          },
          required: ['currentPage', 'totalPages', 'totalItems', 'itemsPerPage'],
        },
        TaskStats: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
              example: 10,
              minimum: 0,
              description: 'Total number of tasks',
            },
            pending: {
              type: 'number',
              example: 3,
              minimum: 0,
              description: 'Number of tasks with PENDING status',
            },
            inProgress: {
              type: 'number',
              example: 4,
              minimum: 0,
              description: 'Number of tasks with IN_PROGRESS status',
            },
            completed: {
              type: 'number',
              example: 3,
              minimum: 0,
              description: 'Number of tasks with COMPLETED status',
            },
            completionRate: {
              type: 'number',
              example: 30.0,
              minimum: 0,
              maximum: 100,
              description: 'Percentage of completed tasks',
            },
          },
          required: ['total', 'pending', 'inProgress', 'completed'],
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
              description: 'Indicates if the request was successful',
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully',
              description: 'Human-readable success message',
            },
            data: {
              type: 'object',
              description: 'Response data (varies by endpoint)',
            },
          },
          required: ['success', 'message'],
        },
      },
      responses: {
        BadRequest: {
          description: 'Bad Request - Invalid input or validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        NotFound: {
          description: 'Not Found - Resource does not exist',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
      },
      parameters: {
        TaskId: {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid'
          },
          description: 'The unique identifier of the task',
          example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
        },
        PageNumber: {
          name: 'page',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          description: 'Page number for pagination'
        },
        PageSize: {
          name: 'limit',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          },
          description: 'Number of items per page'
        },
        TaskStatus: {
          name: 'status',
          in: 'query',
          schema: {
            $ref: '#/components/schemas/TaskStatus'
          },
          description: 'Filter tasks by status'
        },
        SearchQuery: {
          name: 'search',
          in: 'query',
          schema: {
            type: 'string',
            minLength: 1,
            maxLength: 100
          },
          description: 'Search tasks by title or description'
        },
        SortBy: {
          name: 'sortBy',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['createdAt', 'updatedAt', 'title', 'status'],
            default: 'createdAt'
          },
          description: 'Field to sort by'
        },
        SortOrder: {
          name: 'sortOrder',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'desc'
          },
          description: 'Sort order (ascending or descending)'
        }
      },
    },
    tags: [
      {
        name: 'Tasks',
        description: 'Operations related to task management',
        externalDocs: {
          description: 'Find out more about task management',
          url: 'https://docs.taskmanagement.com/tasks'
        }
      },
      {
        name: 'Statistics',
        description: 'Task statistics and analytics',
      }
    ],
    externalDocs: {
      description: 'Find out more about Task Management API',
      url: 'https://docs.taskmanagement.com'
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

// Add custom CSS for better styling
export const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 50px 0 }
    .swagger-ui .info .title { color: #3b82f6 }
    .swagger-ui .scheme-container { 
      background: #f8fafc; 
      border: 1px solid #e2e8f0; 
      border-radius: 8px; 
      padding: 20px; 
      margin: 20px 0; 
    }
  `,
  customSiteTitle: 'Task Management API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    tryItOutEnabled: true,
    requestSnippetsEnabled: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
  }
};

export default swaggerSpec;