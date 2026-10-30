import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { requestLogger } from './middleware/logger.js';
import { validateContentType } from './middleware/validateContentType.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import cacheRoutes from './routes/cacheRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import { registerEventListeners } from './events/listeners.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Event Listeners (Lab session Step 2)
registerEventListeners();

const isTest = process.env.NODE_ENV === 'test' || process.env.npm_lifecycle_event === 'test' || process.argv.some(arg => arg.includes('test'));

// Connect to MongoDB only when not running in isolated test mode
if (!isTest) {
  connectDB();
}

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(validateContentType);
app.use(requestLogger);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'Practical 12 CI/CD Pipeline Automated Testing & Deployment Backend',
    database: 'MongoDB (taskdb_p12)',
    environment: process.env.NODE_ENV || 'development',
    ciStatus: 'Automated Test Suite Active',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/cache', cacheRoutes);
app.use('/api/events', eventRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(globalErrorHandler);

let server;
if (!isTest) {
  server = app.listen(PORT, () => {
    console.log(`
🚀 Practical 12 Backend running on port ${PORT}
🍃 Connected to MongoDB: ${process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskdb_p12'}
🔐 Auth REST:    http://localhost:${PORT}/api/auth
📋 Tasks REST:   http://localhost:${PORT}/api/tasks
📨 Events REST:  http://localhost:${PORT}/api/events/logs
🩺 Health Check: http://localhost:${PORT}/api/health
    `);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
      const fallbackPort = Number(PORT) + 1;
      console.warn(`⚠️ Port ${PORT} is busy or restricted by OS (${err.code}). Falling back to port ${fallbackPort}...`);
      app.listen(fallbackPort, () => {
        console.log(`🚀 Practical 12 Server running on http://localhost:${fallbackPort}`);
      });
    } else {
      console.error('Server error:', err);
    }
  });
}

export default app;
