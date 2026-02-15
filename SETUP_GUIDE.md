# LinkVault - Complete Setup Guide

This guide will walk you through setting up LinkVault from scratch, including all dependencies and configurations.

## Prerequisites Check

Before starting, ensure you have the following installed:

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Git
git --version
```

If any of these are missing, install them first:
- **Node.js & npm**: Download from [nodejs.org](https://nodejs.org/)
- **Git**: Download from [git-scm.com](https://git-scm.com/)

## Step-by-Step Installation

### 1. Clone or Download the Project

**Option A: Clone from Git**
```bash
git clone https://github.com/yourusername/linkvault.git
cd linkvault
```

**Option B: Download ZIP**
- Download the project ZIP file
- Extract to your desired location
- Open terminal in the extracted folder

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install all dependencies
npm install

# This will install:
# - express: Web framework
# - cors: Cross-origin resource sharing
# - dotenv: Environment variables
# - multer: File upload handling
# - nanoid: Unique ID generation
# - node-cron: Background jobs
# - firebase-admin: Optional cloud storage
```

**Expected output:**
```
added 150 packages, and audited 151 packages in 15s
```

### 3. Backend Configuration

Create a `.env` file in the backend directory:

```bash
# Copy the example file
cp .env.example .env

# Edit the file (use your preferred editor)
nano .env
# or
code .env
# or
vim .env
```

**Minimal .env configuration:**
```env
PORT=5001
NODE_ENV=development
STORAGE_TYPE=local
MAX_FILE_SIZE=10485760
DEFAULT_EXPIRY_MINUTES=10
FRONTEND_URL=http://localhost:5173
```

**Optional Firebase Configuration** (if using cloud storage):
```env
STORAGE_TYPE=firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_STORAGE_BUCKET=your-bucket-name
```

### 4. Test Backend Server

```bash
# Start the backend server
npm start
```

**Expected output:**
```
╔════════════════════════════════════════════╗
║        LinkVault Backend Server            ║
╚════════════════════════════════════════════╝

Server running on http://localhost:5001
Storage type: local
CORS enabled for: http://localhost:5173
Cleanup job scheduled (every 5 minutes)

API Documentation: http://localhost:5001
```

**Test the server:**
```bash
# In a new terminal
curl http://localhost:5001/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2024-02-15T10:00:00.000Z",
  "uptime": 5.123,
  "storageType": "local"
}
```

### 5. Frontend Setup

Open a **new terminal** window:

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install all dependencies
npm install

# This will install:
# - react & react-dom: UI library
# - react-router-dom: Routing
# - axios: HTTP client
# - lucide-react: Icons
# - tailwindcss: CSS framework
# - vite: Build tool
```

**Expected output:**
```
added 200 packages, and audited 201 packages in 20s
```

### 6. Frontend Configuration (Optional)

Create a `.env` file if you need to change API URL:

```bash
# In frontend directory
touch .env
```

**Content:**
```env
VITE_API_URL=http://localhost:5001/api
```

> **Note:** This is optional since Vite proxy is configured by default.

### 7. Start Frontend Development Server

```bash
# In frontend directory
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### 8. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the LinkVault homepage with:
- ✅ Animated background
- ✅ Feature cards
- ✅ Upload component
- ✅ Beautiful gradient design

## Troubleshooting

### Issue: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5001
```

**Solution:**
```bash
# Find and kill the process using port 5001
# On macOS/Linux:
lsof -ti:5001 | xargs kill -9

# On Windows:
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

Or change the port in `.env`:
```env
PORT=5001
```

### Issue: Module Not Found

**Error:**
```
Cannot find module 'express'
```

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: CORS Error in Browser

**Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
1. Check backend `.env` has correct `FRONTEND_URL`
2. Restart backend server
3. Clear browser cache

### Issue: Permission Denied

**Error:**
```
EACCES: permission denied, mkdir 'uploads'
```

**Solution:**
```bash
# Fix directory permissions (macOS/Linux)
sudo chown -R $USER:$USER .
chmod -R 755 .

# On Windows, run terminal as Administrator
```

### Issue: Tailwind Styles Not Loading

**Solution:**
1. Check `tailwind.config.js` exists
2. Verify `index.css` imports Tailwind
3. Restart Vite dev server
4. Clear browser cache (Ctrl+Shift+R)

## Verification Checklist

After setup, verify everything works:

- [ ] Backend server runs on port 5001
- [ ] Frontend runs on port 5173
- [ ] Can access http://localhost:5173
- [ ] Upload form is visible
- [ ] Can switch between Text/File upload
- [ ] Tailwind styles are applied
- [ ] No console errors

### Test Upload Flow

1. **Upload Text:**
   - Enter some text in the textarea
   - Select expiry time (10 minutes)
   - Click "Generate Secure Link"
   - Should see success modal with URL

2. **Test Share Link:**
   - Copy the generated URL
   - Open in new browser tab
   - Should see the shared text

3. **Upload File:**
   - Switch to File tab
   - Select a small file (< 10MB)
   - Click upload
   - Copy share link
   - Open in new tab
   - Click download button

## Development Workflow

### Running Both Servers

You'll need **two terminal windows**:

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

### Making Changes

**Backend Changes:**
- Edit files in `backend/`
- Server auto-restarts (if using nodemon)
- Or manually restart: Ctrl+C, then `npm start`

**Frontend Changes:**
- Edit files in `frontend/src/`
- Browser auto-refreshes (Hot Module Replacement)
- No restart needed

### Useful Commands

```bash
# Backend
cd backend
npm start          # Start server
npm run dev        # Start with nodemon (auto-restart)

# Frontend  
cd frontend
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
```

## Directory Structure After Setup

```
linkvault/
├── backend/
│   ├── node_modules/      # Installed
│   ├── uploads/           # Created automatically
│   ├── database.json      # Created on first upload
│   ├── .env              # You created this
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json  # Created by npm install
│   ├── server.js
│   ├── routes.js
│   ├── database.js
│   └── storage.js
│
├── frontend/
│   ├── node_modules/      # Installed
│   ├── public/
│   ├── src/
│   ├── .env              # Optional
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json  # Created by npm install
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── README.md
└── ARCHITECTURE.md
```

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 5001 | No |
| `NODE_ENV` | Environment | development | No |
| `STORAGE_TYPE` | Storage type (local/firebase) | local | No |
| `MAX_FILE_SIZE` | Max file size in bytes | 10485760 | No |
| `DEFAULT_EXPIRY_MINUTES` | Default expiry | 10 | No |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 | Yes |
| `FIREBASE_*` | Firebase credentials | - | Only if using Firebase |

### Frontend (.env)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | http://localhost:5001/api | No |

## Next Steps

Now that your setup is complete:

1. **Read the Documentation:**
   - [README.md](./README.md) - Full project documentation
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

2. **Test All Features:**
   - Text upload with different expiry times
   - File upload (various types)
   - Password protection
   - One-time view
   - View limits

3. **Customize:**
   - Modify colors in `tailwind.config.js`
   - Add your own features
   - Extend the API

4. **Deploy:**
   - See deployment section in README.md

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review browser console for errors (F12)
3. Check backend logs in terminal
4. Ensure all dependencies are installed
5. Verify environment variables are set correctly

## Quick Reference

**Start Development:**
```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev
```

**Access URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001
- Health Check: http://localhost:5001/health

**Stop Servers:**
```bash
# In each terminal
Ctrl + C
```

---