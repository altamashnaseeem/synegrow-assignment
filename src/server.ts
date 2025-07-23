// server.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import taskRoutes from "./routes/taskRoutes";
import { initializeDatabase } from "./utils/database";

// Import Swagger related modules
import swaggerUi from 'swagger-ui-express';
import swaggerSpec, { swaggerOptions } from './swagger';

// Create Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://validator.swagger.io"],
    },
  },
}));

// CORS middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (optional)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use("/api/tasks", taskRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Task Management API is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    documentation: `${req.protocol}://${req.get('host')}/api-docs`
  });
});

// API status endpoint
app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Task Management API v1.0.0",
    endpoints: {
      tasks: "/api/tasks",
      documentation: "/api-docs",
      health: "/"
    }
  });
});

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

// Redirect /docs to /api-docs for convenience
app.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.path,
    method: req.method,
    availableEndpoints: [
      "GET /api/tasks",
      "POST /api/tasks", 
      "GET /api/tasks/:id",
      "PUT /api/tasks/:id",
      "DELETE /api/tasks/:id",
      "GET /api/tasks/stats"
    ]
  });
});

// 404 handler for all other routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    suggestion: "Visit /api-docs for API documentation"
  });
});

// Global error handler
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", error);

    // Handle different types of errors
    let statusCode = error.status || 500;
    let message = error.message || "Internal server error";

    // Database connection errors
    if (error.code === 'SQLITE_CANTOPEN') {
      statusCode = 503;
      message = "Database connection failed";
    }

    // JSON parsing errors
    if (error.type === 'entity.parse.failed') {
      statusCode = 400;
      message = "Invalid JSON format";
    }

    res.status(statusCode).json({
      success: false,
      message: message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        details: error 
      })
    });
  }
);

// Graceful shutdown handlers
const gracefulShutdown = (signal: string) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Express server is running on http://localhost:${PORT}`);
      console.log(`📚 Swagger docs available at http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health check available at http://localhost:${PORT}/`);
      console.log(`📊 API status available at http://localhost:${PORT}/api`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;