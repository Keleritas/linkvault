/**
 * Routes for LinkVault API
 */

import express from 'express';
import multer from 'multer';
import { nanoid } from 'nanoid';
import database from './database.js';
import storage from './storage.js';
import { verifyFirebaseToken } from "./authMiddleware.js";


const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  }
});

router.post("/upload",
  verifyFirebaseToken,
  upload.single("file"),
  async (req,res)=>{
  try {
    const { text, expiryMinutes, password, maxViews, oneTimeView } = req.body;
    const file = req.file;

    // Validation: must have either text or file
    if (!text && !file) {
      return res.status(400).json({
        error: 'Either text or file must be provided'
      });
    }

    if (text && file) {
      return res.status(400).json({
        error: 'Cannot upload both text and file simultaneously'
      });
    }

    // Generate unique ID
    const uniqueId = nanoid(10);

    // Calculate expiry time
    const defaultExpiry = parseInt(process.env.DEFAULT_EXPIRY_MINUTES) || 10;
    const expiryTime = expiryMinutes ? parseInt(expiryMinutes) : defaultExpiry;
    const expiresAt = new Date(Date.now() + expiryTime * 60 * 1000);

    let contentData = {
      id: uniqueId,
      expiresAt: expiresAt.toISOString(),
      oneTimeView: oneTimeView === 'true' || oneTimeView === true,
      maxViews: maxViews ? parseInt(maxViews) : null,
      password: password || null
    };

    // Handle text upload
    if (text) {
      contentData.type = 'text';
      contentData.content = text;
    }

    // Handle file upload
    if (file) {
      try {
        const storageResult = await storage.saveFile(file, uniqueId);
        
        contentData.type = 'file';
        contentData.fileName = file.originalname;
        contentData.fileSize = file.size;
        contentData.mimeType = file.mimetype;
        contentData.content = storageResult.filePath;
        
        if (storageResult.storageUrl) {
          contentData.storageUrl = storageResult.storageUrl;
        }
      } catch (error) {
        console.error('File storage error:', error);
        return res.status(500).json({
          error: 'Failed to store file'
        });
      }
    }

    // Save to database
    const savedContent = database.create(contentData);

    // Return success response with share link
    res.status(201).json({
      success: true,
      id: uniqueId,
      shareUrl: `${process.env.FRONTEND_URL}/share/${uniqueId}`,
      expiresAt: savedContent.expiresAt,
      type: savedContent.type
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File size exceeds maximum limit'
      });
    }
    
    res.status(500).json({
      error: 'Internal server error during upload'
    });
  }
});

/**
 * GET /api/content/:id
 * Retrieve content by ID
 */
router.get('/content/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.query;

    // Find content in database
    const content = database.findById(id);

    if (!content) {
      return res.status(404).json({
        error: 'Content not found'
      });
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(content.expiresAt);
    
    if (expiresAt < now) {
      // Delete expired content
      if (content.type === 'file') {
        try {
          await storage.deleteFile(content.content);
        } catch (err) {
          console.error('Error deleting expired file:', err);
        }
      }
      database.delete(id);
      
      return res.status(410).json({
        error: 'Content has expired'
      });
    }

    // Check password protection
    if (content.password && content.password !== password) {
      return res.status(401).json({
        error: 'Invalid password',
        requiresPassword: true
      });
    }

    // Check max views
    if (content.maxViews && content.viewCount >= content.maxViews) {
      // Delete content that exceeded max views
      if (content.type === 'file') {
        try {
          await storage.deleteFile(content.content);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }
      database.delete(id);
      
      return res.status(410).json({
        error: 'Maximum view limit reached'
      });
    }

    // Increment view count
    const updatedContent = database.update(id, {
      viewCount: content.viewCount + 1
    });

    // Prepare response
    const response = {
      type: content.type,
      createdAt: content.createdAt,
      expiresAt: content.expiresAt,
      viewCount: updatedContent.viewCount,
      requiresPassword: !!content.password
    };

    // Add type-specific data
    if (content.type === 'text') {
      response.content = content.content;
    } else if (content.type === 'file') {
      response.fileName = content.fileName;
      response.fileSize = content.fileSize;
      response.mimeType = content.mimeType;
    }

    // Handle one-time view
    if (content.oneTimeView) {
      // Mark for deletion after response is sent
      res.on('finish', async () => {
        if (content.type === 'file') {
          try {
            await storage.deleteFile(content.content);
          } catch (err) {
            console.error('Error deleting one-time file:', err);
          }
        }
        database.delete(id);
      });
    }

    res.json(response);

  } catch (error) {
    console.error('Content retrieval error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/download/:id
 * Download file content
 */
router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.query;

    const content = database.findById(id);

    if (!content) {
      return res.status(404).json({
        error: 'Content not found'
      });
    }

    // Check if file type
    if (content.type !== 'file') {
      return res.status(400).json({
        error: 'Content is not a file'
      });
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(content.expiresAt);
    
    if (expiresAt < now) {
      await storage.deleteFile(content.content);
      database.delete(id);
      
      return res.status(410).json({
        error: 'Content has expired'
      });
    }

    // Check password
    if (content.password && content.password !== password) {
      return res.status(401).json({
        error: 'Invalid password'
      });
    }

    // Get file from storage
    try {
      const fileBuffer = await storage.getFile(content.content);
      
      res.setHeader('Content-Type', content.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${content.fileName}"`);
      res.send(fileBuffer);
      
    } catch (error) {
      console.error('File download error:', error);
      res.status(500).json({
        error: 'Failed to retrieve file'
      });
    }

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/content/:id
 * Manually delete content
 */
router.delete('/content/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const content = database.findById(id);

    if (!content) {
      return res.status(404).json({
        error: 'Content not found'
      });
    }

    // Check password if protected
    if (content.password && content.password !== password) {
      return res.status(401).json({
        error: 'Invalid password'
      });
    }

    // Delete file if exists
    if (content.type === 'file') {
      try {
        await storage.deleteFile(content.content);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    // Delete from database
    database.delete(id);

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/stats
 * Get database statistics (for monitoring)
 */
router.get('/stats', (req, res) => {
  try {
    const stats = database.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router;