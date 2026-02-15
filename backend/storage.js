/**
 * Storage Service
 * Handles file storage either locally or via Firebase Storage
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local storage directory
const UPLOADS_DIR = path.join(__dirname, 'uploads');

class StorageService {
  constructor() {
    this.storageType = process.env.STORAGE_TYPE || 'local';
    this.initStorage();
  }

  /**
   * Initialize storage based on type
   */
  initStorage() {
    if (this.storageType === 'local') {
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        console.log('Created uploads directory');
      }
    } else if (this.storageType === 'firebase') {
      // Initialize Firebase Admin SDK
      this.initFirebase();
    }
  }

  /**
   * Initialize Firebase Storage (optional)
   */
  initFirebase() {
    try {
      console.log('Firebase Storage not configured. Using local storage instead.');
      this.storageType = 'local';
    } catch (error) {
      console.error('Firebase initialization error:', error);
      console.log('Falling back to local storage');
      this.storageType = 'local';
    }
  }

  /**
   * Save file to storage
   * @param {Object} file - Multer file object
   * @param {string} uniqueId - Unique identifier for the file
   * @returns {Promise<Object>} Storage information
   */
  async saveFile(file, uniqueId) {
    if (this.storageType === 'firebase') {
      return await this.saveToFirebase(file, uniqueId);
    } else {
      return await this.saveToLocal(file, uniqueId);
    }
  }

  /**
   * Save file to local storage
   */
  async saveToLocal(file, uniqueId) {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uniqueId}${fileExtension}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, file.buffer, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            filePath: fileName,
            storageType: 'local',
            fullPath: filePath
          });
        }
      });
    });
  }

  /**
   * Save file to Firebase Storage
   */
  async saveToFirebase(file, uniqueId) {
    try {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uniqueId}${fileExtension}`;
      
      const fileUpload = this.bucket.file(fileName);
      
      await fileUpload.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname
          }
        }
      });

      // Make the file publicly accessible
      await fileUpload.makePublic();
      
      const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${fileName}`;
      
      return {
        filePath: fileName,
        storageType: 'firebase',
        storageUrl: publicUrl
      };
    } catch (error) {
      console.error('Firebase upload error:', error);
      throw error;
    }
  }

  /**
   * Get file from storage
   * @param {string} filePath - Path to the file
   * @returns {Promise<Buffer>} File buffer
   */
  async getFile(filePath) {
    if (this.storageType === 'firebase') {
      return await this.getFromFirebase(filePath);
    } else {
      return await this.getFromLocal(filePath);
    }
  }

  /**
   * Get file from local storage
   */
  async getFromLocal(fileName) {
    const filePath = path.join(UPLOADS_DIR, fileName);
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  /**
   * Get file from Firebase Storage
   */
  async getFromFirebase(fileName) {
    try {
      const file = this.bucket.file(fileName);
      const [data] = await file.download();
      return data;
    } catch (error) {
      console.error('Firebase download error:', error);
      throw error;
    }
  }

  /**
   * Delete file from storage
   * @param {string} filePath - Path to the file
   */
  async deleteFile(filePath) {
    if (this.storageType === 'firebase') {
      return await this.deleteFromFirebase(filePath);
    } else {
      return await this.deleteFromLocal(filePath);
    }
  }

  /**
   * Delete file from local storage
   */
  async deleteFromLocal(fileName) {
    const filePath = path.join(UPLOADS_DIR, fileName);
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Delete file from Firebase Storage
   */
  async deleteFromFirebase(fileName) {
    try {
      const file = this.bucket.file(fileName);
      await file.delete();
      return true;
    } catch (error) {
      if (error.code !== 404) {
        console.error('Firebase delete error:', error);
        throw error;
      }
      return true;
    }
  }

  /**
   * Get storage type
   */
  getStorageType() {
    return this.storageType;
  }
}

export default new StorageService();