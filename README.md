# Task Management API

A robust RESTful API for managing tasks built with Node.js, Express.js, TypeScript, and SQLite. The API provides full CRUD operations for tasks with comprehensive validation, error handling, and interactive Swagger documentation.

## 🚀 Features

- **Full CRUD Operations**: Create, Read, Update, and Delete tasks
- **Task Statistics**: Get insights about your task data
- **Data Validation**: Comprehensive input validation using Zod schemas
- **Interactive Documentation**: Swagger UI for easy API exploration
- **Type Safety**: Built with TypeScript for better code quality
- **Security**: Helmet.js for security headers and CORS configuration
- **Error Handling**: Centralized error handling with detailed responses
- **Health Checks**: Monitor API status and health

## Setup Instructions

Follow these steps to set up and run the Task Management API on your local machine.

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Clone the Repository
```bash
git clone <your-repository-url>
cd TODO-BACKEND
```

### Install Dependencies
```bash
npm install
```

### 1. Database Setup
The SQLite database will be automatically initialized when you start the server for the first time.

### 2. Start the Development Server
```bash
npm run dev
```

## 📖 API Documentation

### Interactive Documentation

* **Deployed Frontend :**  http://localhost:5000/api-docs
- View all available endpoints
- Test API calls directly from the browser
- See request/response schemas

