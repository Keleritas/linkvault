/**
 * Database Schema for LinkVault
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const DB_PATH = path.join(__dirname, 'database.json');

/**
 * Content Schema
 * {
 *   id: string (unique identifier),
 *   type: 'text' | 'file',
 *   content: string (text content or file path),
 *   fileName: string (original file name for file uploads),
 *   fileSize: number (file size in bytes),
 *   mimeType: string (MIME type of the file),
 *   storageUrl: string (Firebase URL if using Firebase storage),
 *   createdAt: Date,
 *   expiresAt: Date,
 *   password: string (optional - hashed password),
 *   maxViews: number (optional - max view/download count),
 *   viewCount: number (current view/download count),
 *   oneTimeView: boolean (delete after first view)
 * }
 */

class Database {
  constructor() {
    this.data = { contents: [] };
    this.loadData();
  }

  /**
   * Load data from JSON file
   */
  loadData() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const rawData = fs.readFileSync(DB_PATH, 'utf8');
        this.data = JSON.parse(rawData);
        console.log(`Loaded ${this.data.contents.length} items from database`);
      } else {
        this.saveData();
      }
    } catch (error) {
      console.error('Error loading database:', error);
      this.data = { contents: [] };
    }
  }

  /**
   * Save data to JSON file
   */
  saveData() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  /**
   * Create a new content entry
   */
  create(contentData) {
    const newContent = {
      ...contentData,
      createdAt: new Date().toISOString(),
      viewCount: 0
    };
    this.data.contents.push(newContent);
    this.saveData();
    return newContent;
  }

  /**
   * Find content by ID
   */
  findById(id) {
    return this.data.contents.find(content => content.id === id);
  }

  /**
   * Update content
   */
  update(id, updateData) {
    const index = this.data.contents.findIndex(content => content.id === id);
    if (index !== -1) {
      this.data.contents[index] = { ...this.data.contents[index], ...updateData };
      this.saveData();
      return this.data.contents[index];
    }
    return null;
  }

  /**
   * Delete content by ID
   */
  delete(id) {
    const index = this.data.contents.findIndex(content => content.id === id);
    if (index !== -1) {
      const deleted = this.data.contents.splice(index, 1)[0];
      this.saveData();
      return deleted;
    }
    return null;
  }

  /**
   * Find and delete expired content
   */
  deleteExpired() {
    const now = new Date();
    const initialLength = this.data.contents.length;
    
    this.data.contents = this.data.contents.filter(content => {
      const expiresAt = new Date(content.expiresAt);
      return expiresAt > now;
    });
    
    const deletedCount = initialLength - this.data.contents.length;
    if (deletedCount > 0) {
      this.saveData();
      console.log(`Deleted ${deletedCount} expired content items`);
    }
    
    return deletedCount;
  }

  getAll() {
    return this.data.contents;
  }

  /**
   * Get database statistics
   */
  getStats() {
    const now = new Date();
    const active = this.data.contents.filter(c => new Date(c.expiresAt) > now).length;
    const expired = this.data.contents.length - active;
    
    return {
      total: this.data.contents.length,
      active,
      expired,
      textCount: this.data.contents.filter(c => c.type === 'text').length,
      fileCount: this.data.contents.filter(c => c.type === 'file').length
    };
  }
}

// Export singleton instance
export default new Database();