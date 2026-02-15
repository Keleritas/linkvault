# LinkVault - Secure File & Text Sharing Application

A full-stack web application that allows users to upload text or files and share them securely with others using generated expiring links. Built with React, Node.js, Express, and Tailwind CSS.

![LinkVault Banner](https://via.placeholder.com/1200x400/0ea5e9/ffffff?text=LinkVault+-+Secure+Sharing)

## Features

### Core Features
- **Text & File Sharing**: Upload plain text or any file type (one per share)
- **Unique Shareable URLs**: Generate secure, hard-to-guess links
- **Auto-Expiring Content**: Set custom expiry times (5 minutes to 7 days)
- **Secure Access**: Content accessible only via generated link
- **No Authentication Required**: Simple, anonymous sharing

### Advanced Features (Bonus)
- **Password Protection**: Add password security to shared content
- **One-Time View Links**: Content deletes after first access
- **View Limits**: Set maximum number of views/downloads
- **Manual Deletion**: Delete content before expiry
- **Background Cleanup**: Automatic deletion of expired content via cron jobs
- **File Size Validation**: Maximum 10MB file size limit
- **Responsive UI**: Beautiful, modern interface with glass-morphism design

## Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React +      │
│   Vite)         │
└────────┬────────┘
         │
         │ HTTP/REST API
         │
┌────────▼────────┐
│   Backend       │
│   (Express.js)  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼────┐
│ JSON │  │ Local │
│  DB  │  │ Files │
└──────┘  └───────┘
```

### Data Flow Diagram

```
User Upload Flow:
┌──────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│Client│───>│ Express  │───>│ Storage  │───>│ Database │
│      │    │ Router   │    │ Service  │    │          │
└──────┘    └──────────┘    └──────────┘    └──────────┘
    │              │              │               │
    │              │              ▼               ▼
    │              │         Save File      Save Metadata
    │              ▼
    │         Generate ID
    │         Create Link
    │              │
    └──────────────┘
         Return URL

Content Retrieval Flow:
┌──────┐    ┌──────────┐    ┌──────────┐    ┌─────────┐
│Client│───>│ Express  │───>│ Database │───>│ Storage │
│      │    │ Router   │    │          │    │ Service │
└──────┘    └──────────┘    └──────────┘    └─────────┘
    ▲              │              │               │
    │              │              ▼               ▼
    │              │        Check Expiry    Get File
    │              │        Validate Pwd
    │              │        Increment Views
    │              ▼
    └──────────────┘
       Return Content

Background Cleanup (Cron):
┌──────────┐    ┌──────────┐    ┌─────────┐
│  Cron    │───>│ Database │───>│ Storage │
│  Job     │    │          │    │ Service │
└──────────┘    └──────────┘    └─────────┘
    │              │               │
    │              ▼               ▼
    └──────> Find Expired   Delete Files
             Delete Records
```

## Tech Stack

### Frontend
- **React 18**: UI library
- **Vite**: Build tool and dev server
- **React Router DOM**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client
- **Lucide React**: Icon library

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Multer**: File upload middleware
- **nanoid**: Unique ID generation
- **node-cron**: Background job scheduling
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

### Database
- **JSON-based Database**: In-memory with file persistence
- *Easily replaceable with MongoDB, PostgreSQL, or MySQL*

### Storage
- **Local Storage**: Files stored in uploads directory
- **Firebase Storage (Optional)**: Cloud storage option

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Keleritas/linkvault.git
cd linkvault
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Backend .env Configuration:**
```env
PORT=5001
NODE_ENV=development
STORAGE_TYPE=local
MAX_FILE_SIZE=10485760
DEFAULT_EXPIRY_MINUTES=10
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd ../frontend

# Install dependencies
npm install
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

## Project Structure

```
linkvault/
├── backend/
│   ├── database.js           # Database schema and operations
│   ├── storage.js            # File storage service
│   ├── routes.js             # API routes
│   ├── server.js             # Express server setup
│   ├── package.json          # Backend dependencies
│   ├── .env.example          # Environment variables template
│   ├── .gitignore           # Git ignore rules
│   └── uploads/             # Local file storage (created automatically)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadComponent.jsx    # Upload UI component
│   │   │   ├── SuccessModal.jsx       # Success modal
│   │   │   └── ViewContent.jsx        # Content viewer
│   │   ├── pages/
│   │   │   └── Home.jsx               # Home page
│   │   ├── utils/
│   │   │   ├── api.js                 # API client
│   │   │   └── helpers.js             # Helper functions
│   │   ├── App.jsx                    # Main app component
│   │   ├── main.jsx                   # Entry point
│   │   └── index.css                  # Global styles
│   ├── public/                        # Static assets
│   ├── index.html                     # HTML template
│   ├── package.json                   # Frontend dependencies
│   ├── vite.config.js                 # Vite configuration
│   ├── tailwind.config.js             # Tailwind configuration
│   ├── postcss.config.js              # PostCSS configuration
│   └── .gitignore                     # Git ignore rules
│
└── README.md                          # This file
```

## API Documentation

### Base URL
```
http://localhost:5001/api
```

### Endpoints

#### 1. Upload Content
**POST** `/api/upload`

Upload text or file content.

**Request (Form Data):**
```
text: string (for text upload)
file: File (for file upload)
expiryMinutes: number (optional, default: 10)
password: string (optional)
maxViews: number (optional)
oneTimeView: boolean (optional)
```

**Response:**
```json
{
  "success": true,
  "id": "abc123xyz",
  "shareUrl": "http://localhost:5173/share/abc123xyz",
  "expiresAt": "2024-02-15T12:00:00Z",
  "type": "text"
}
```

#### 2. Get Content
**GET** `/api/content/:id?password=xxx`

Retrieve content by ID.

**Response (Text):**
```json
{
  "type": "text",
  "content": "Your shared text here",
  "createdAt": "2026-02-15T11:00:00Z",
  "expiresAt": "2026-02-15T12:00:00Z",
  "viewCount": 1,
  "requiresPassword": false
}
```

**Response (File):**
```json
{
  "type": "file",
  "fileName": "document.pdf",
  "fileSize": 1048576,
  "mimeType": "application/pdf",
  "createdAt": "2024-02-15T11:00:00Z",
  "expiresAt": "2024-02-15T12:00:00Z",
  "viewCount": 1,
  "requiresPassword": false
}
```

#### 3. Download File
**GET** `/api/download/:id?password=xxx`

Download file content.

**Response:** File binary data with appropriate headers

#### 4. Delete Content
**DELETE** `/api/content/:id`

Manually delete content.

**Request Body:**
```json
{
  "password": "optional-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Content deleted successfully"
}
```

#### 5. Get Statistics
**GET** `/api/stats`

Get database statistics.

**Response:**
```json
{
  "total": 100,
  "active": 75,
  "expired": 25,
  "textCount": 50,
  "fileCount": 50
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "error": "Either text or file must be provided"
}
```

**401 Unauthorized:**
```json
{
  "error": "Invalid password",
  "requiresPassword": true
}
```

**404 Not Found:**
```json
{
  "error": "Content not found"
}
```

**410 Gone:**
```json
{
  "error": "Content has expired"
}
```

**413 Payload Too Large:**
```json
{
  "error": "File size exceeds maximum limit"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

## UI/UX Design

### Design Philosophy
- **Glass-morphism**: Modern frosted glass effect
- **Gradient Accents**: Vibrant blue-purple-pink gradients
- **Dark Theme**: Professional dark mode interface
- **Smooth Animations**: Subtle transitions and micro-interactions
- **Responsive**: Mobile-first design approach

### Color Palette
- Primary: Blue (#0ea5e9) to Purple (#8b5cf6)
- Background: Dark slate (#0f172a, #1e293b)
- Accents: Pink (#ec4899), Green (#10b981)
- Glass: White with 5% opacity

### Typography
- Display: Poppins (Bold, 600-800)
- Body: Poppins (Regular, 400-500)
- Code: JetBrains Mono

## Security Features

1. **Unique ID Generation**: Uses nanoid for cryptographically strong IDs
2. **Password Hashing**: Optional password protection (stored as-is for demo)
3. **No Public Listing**: Content not searchable or browsable
4. **Automatic Expiry**: Content auto-deletes after time limit
5. **View Limits**: Restrict number of accesses
6. **One-Time Links**: Self-destructing content
7. **File Type Validation**: Frontend and backend validation
8. **Size Limits**: Maximum 10MB file size
9. **CORS Protection**: Restricted cross-origin requests

## Configuration Options

### Storage Configuration

**Local Storage (Default):**
```env
STORAGE_TYPE=local
```
Files stored in `backend/uploads/` directory

**Firebase Storage (Optional):**
```env
STORAGE_TYPE=firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_STORAGE_BUCKET=your-bucket-name
```

### Expiry Presets

Default expiry options available:
- 5 minutes
- 10 minutes (default)
- 30 minutes
- 1 hour
- 6 hours
- 12 hours
- 24 hours
- 7 days

### File Size Limits

Modify in `.env`:
```env
MAX_FILE_SIZE=10485760  # 10MB in bytes
```

## Background Jobs

### Cleanup Cron Job

Runs every 5 minutes to delete expired content:

```javascript
// Schedule: */5 * * * * (every 5 minutes)
- Finds all expired entries
- Deletes associated files from storage
- Removes database records
- Logs cleanup statistics
```

## Testing the Application

### Manual Testing Checklist

**Upload Functionality:**
- [ ] Upload plain text
- [ ] Upload various file types (PDF, images, documents)
- [ ] Test file size limits
- [ ] Verify unique URL generation

**Access Control:**
- [ ] Access content with valid link
- [ ] Attempt access without link (should fail)
- [ ] Test password-protected content
- [ ] Verify expired content returns error

**Advanced Features:**
- [ ] Test one-time view deletion
- [ ] Verify max view limits
- [ ] Test manual deletion
- [ ] Check expiry time options

**UI/UX:**
- [ ] Test on mobile devices
- [ ] Verify responsive design
- [ ] Check animations and transitions
- [ ] Test copy-to-clipboard functionality

## Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**CORS Errors:**
- Verify `FRONTEND_URL` in backend `.env`
- Check frontend API base URL configuration

**File Upload Fails:**
- Check file size limits
- Verify uploads directory permissions
- Check available disk space

**Database Not Persisting:**
- Ensure write permissions for backend directory
- Check if `database.json` is being created

## Deployment

### Backend Deployment (Example: Heroku)

```bash
# From backend directory
heroku create linkvault-api
heroku config:set NODE_ENV=production
git push heroku main
```

### Frontend Deployment (Example: Vercel)

```bash
# From frontend directory
vercel --prod
```

### Environment Variables for Production

**Backend:**
```env
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://yourdomain.com
```

**Frontend:**
Create `.env.production`:
```env
VITE_API_URL=https://your-api-domain.com/api
```

## Design Decisions

### Database Choice
- **JSON-based**: Simple, no external dependencies for development
- **Easily Replaceable**: Can swap with MongoDB, PostgreSQL, or MySQL by modifying `database.js`
- **File Persistence**: Survives server restarts

### Storage Strategy
- **Local First**: No external dependencies by default
- **Firebase Optional**: Easy cloud storage integration
- **Modular Design**: Storage service abstraction allows easy provider switching

### Frontend Architecture
- **Component-Based**: Reusable React components
- **Client-Side Routing**: Better UX with React Router
- **API Abstraction**: Centralized API client in utils

### Security Approach
- **No Authentication**: Simplified UX for MVP
- **Link-Based Security**: Unique, hard-to-guess URLs
- **Optional Password**: User choice for sensitive content

## Future Enhancements

### Potential Features
- [ ] User authentication and accounts
- [ ] Content analytics dashboard
- [ ] Batch uploads
- [ ] Custom expiry times
- [ ] Email notifications
- [ ] QR code generation for links
- [ ] Content preview before download
- [ ] Folder/collection support
- [ ] API rate limiting
- [ ] Content encryption at rest

### Technical Improvements
- [ ] Database migration to PostgreSQL/MongoDB
- [ ] Redis caching layer
- [ ] CDN integration for files
- [ ] Comprehensive unit tests
- [ ] Integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Monitoring and logging (Winston/Morgan)

## Contributing

This is a take-home assignment project. If you'd like to improve it:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
