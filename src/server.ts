import express from "express";
import cors from "cors";
import helmet from "helmet";
import taskRoutes from "./routes/taskRoutes";
import { initializeDatabase } from "./utils/database"; // Import the database initialization

// Create Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

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

// API Routes
app.use("/api/tasks", taskRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Task Management API is running!",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "endpoint not found",
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

    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
);

// Start server
const startServer = async () => {
  try {
    await initializeDatabase(); // Initialize the database before starting the server
    app.listen(PORT, () => {
      console.log(`Express server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1); // Exit if database connection fails
  }
};

startServer(); // Call the async function to start the server

export default app;