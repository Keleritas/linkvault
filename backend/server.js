/**
 * LinkVault Backend Server
 * Secure file and text sharing application
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import routes from './routes.js';
import database from './database.js';
import storage from './storage.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    storageType: storage.getStorageType()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'LinkVault API',
    version: '1.0.0',
    description: 'Secure file and text sharing service',
    endpoints: {
      upload: 'POST /api/upload',
      getContent: 'GET /api/content/:id',
      downloadFile: 'GET /api/download/:id',
      deleteContent: 'DELETE /api/content/:id',
      stats: 'GET /api/stats',
      health: 'GET /health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

/**
 * Cleanup expired content
 * Runs every 5 minutes to delete expired entries
 */
function cleanupExpiredContent() {
  console.log('Running cleanup job...');
  
  const expiredContent = database.getAll().filter(content => {
    const expiresAt = new Date(content.expiresAt);
    return expiresAt < new Date();
  });

  expiredContent.forEach(async (content) => {
    try {
      // Delete file if exists
      if (content.type === 'file') {
        await storage.deleteFile(content.content);
        console.log(`Deleted expired file: ${content.fileName}`);
      }
      
      // Delete from database
      database.delete(content.id);
    } catch (error) {
      console.error(`Error cleaning up content ${content.id}:`, error);
    }
  });

  if (expiredContent.length > 0) {
    console.log(`Cleaned up ${expiredContent.length} expired items`);
  }
}

// Schedule cleanup job every 5 minutes
cron.schedule('*/5 * * * *', cleanupExpiredContent);

// Run cleanup on startup
setTimeout(cleanupExpiredContent, 5000);

// Start server
app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║        LinkVault Backend Server            ║');
  console.log('╚════════════════════════════════════════════╝\n');
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Storage type: ${storage.getStorageType()}`);
  console.log(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`Cleanup job scheduled (every 5 minutes)`);
  console.log(`\nAPI Documentation: http://localhost:${PORT}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});