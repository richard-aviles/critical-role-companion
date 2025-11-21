# Troubleshooting - Common Issues & Solutions

**Last Updated:** 2025-11-20

---

## 🔍 How to Use This Guide

1. **Find your error** in the table of contents below
2. **Follow the steps** to diagnose the issue
3. **Try the solution**
4. **If still stuck,** gather the info in "When Asking for Help" and ask

---

## 📋 Common Issues by Topic

### Neon & Database
- [Connection fails](#connection-fails)
- [`.env` file not loading](#env-file-not-loading)
- [Database query errors](#database-query-errors)

### Backend Setup
- [Python venv issues](#python-venv-issues)
- [Dependency installation fails](#dependency-installation-fails)
- [Port 8000 already in use](#port-8000-already-in-use)

### Frontend Setup
- [Node modules won't install](#node-modules-wont-install)
- [npm run dev fails](#npm-run-dev-fails)
- [CORS errors](#cors-errors)

### Cloudflare R2
- [Can't create bucket](#cant-create-bucket)
- [Upload fails](#upload-fails)
- [Image URL doesn't work](#image-url-doesnt-work)

### Local Development
- [Frontend can't reach backend](#frontend-cant-reach-backend)
- [WebSocket connection fails](#websocket-connection-fails)
- [Port conflicts](#port-conflicts)

---

## 🔧 Detailed Solutions

### Connection fails

**Symptoms:**
```
✗ Connection failed: could not connect to server
```

**Steps to diagnose:**

1. **Check Neon is alive:**
   - Go to https://console.neon.tech/
   - Click on your `critical-role-companion` project
   - Look for any error messages
   - Check if project shows "Active" status

2. **Check your connection string:**
   ```bash
   cd backend
   cat .env | grep DATABASE_URL
   ```
   - Should output: `DATABASE_URL=postgresql://...`
   - If blank, see [`.env` file not loading](#env-file-not-loading)

3. **Test with psql (optional):**
   ```bash
   # If you have PostgreSQL client installed
   psql "postgresql://neondb_owner:PASSWORD@HOST/neondb?sslmode=require"
   ```
   - If it connects, problem is in Python code
   - If it fails, problem is network/credentials

4. **Check internet connection:**
   - Try: `ping google.com`
   - Should return response (not timeout)

**Solutions:**

- **If Neon project is inactive:** Click "Resume project" in Neon dashboard
- **If credentials wrong:** Get new connection string from Neon dashboard
- **If network issue:** Check firewall, VPN, or network connection
- **If still failing:** Grab the exact error message and ask for help

---

### `.env` file not loading

**Symptoms:**
```
KeyError: 'DATABASE_URL'
# Or
Settings object has default values instead of .env values
```

**Steps to diagnose:**

1. **Check file exists:**
   ```bash
   cd backend
   ls -la .env
   # Should show: -rw-r--r-- ... .env
   ```
   - If "No such file or directory" → file doesn't exist

2. **Check file location:**
   ```bash
   pwd  # Should output: .../backend
   ls -la .env  # Should find it in CURRENT directory
   ```

3. **Check file contents:**
   ```bash
   cat .env
   ```
   - Should show your DATABASE_URL line
   - Should NOT be empty

4. **Check .env format:**
   ```bash
   # CORRECT:
   DATABASE_URL=postgresql://...
   ADMIN_TOKEN=mytoken

   # WRONG:
   DATABASE_URL = postgresql://...  # Space around =
   'DATABASE_URL'=...                # Quotes
   [database]                         # INI format
   ```

**Solutions:**

- **If file doesn't exist:**
  ```bash
  # Create it
  cd backend
  nano .env  # or use your favorite editor
  # Paste the variables and save
  ```

- **If in wrong directory:**
  ```bash
  # Move it to backend folder
  mv .env backend/.env
  ```

- **If file is empty:**
  ```bash
  # Add content
  echo "DATABASE_URL=postgresql://..." > backend/.env
  echo "ADMIN_TOKEN=mytoken" >> backend/.env
  ```

- **If file has wrong format:**
  - Remove spaces around `=`
  - Remove quotes
  - Use simple `KEY=VALUE` format

---

### Database query errors

**Symptoms:**
```
ProgrammingError: relation "campaigns" does not exist
# Or
IntegrityError: NOT NULL constraint failed
```

**Steps to diagnose:**

1. **Check database exists:**
   ```bash
   python test_db.py
   ```
   - If "Connection successful" → Database is fine
   - Problem is with tables/schema

2. **Check migrations were run:**
   ```bash
   # After Phase 0.3, should have alembic migrations
   ls -la alembic/versions/
   ```
   - If empty or missing → Migrations not created yet

3. **Check table structure:**
   ```bash
   # Connect to Neon and check
   psql YOUR_CONNECTION_STRING
   # Then in psql:
   \dt  # List all tables
   \d campaigns  # Describe campaigns table
   ```

**Solutions:**

- **If tables don't exist:**
  - Wait for Phase 0.3 (database migrations)
  - Or run manual migration script

- **If wrong schema:**
  - Check `PHASE_0_PROGRESS.md` for what tables should exist
  - Drop and recreate if needed (development only)

---

### Python venv issues

**Symptoms:**
```
python: command not found
# Or
'python' is not recognized
# Or
pip install fails
```

**Steps to diagnose:**

1. **Check Python is installed:**
   ```bash
   python --version
   # Should output: Python 3.11.x
   ```
   - If not found, install Python 3.11+ from python.org

2. **Check venv exists:**
   ```bash
   cd backend
   ls -la venv/
   # Should list venv folder
   ```

3. **Check venv is activated:**
   ```bash
   # Windows:
   where python
   # Should output: C:\...\venv\Scripts\python.exe

   # Mac/Linux:
   which python
   # Should output: /path/to/venv/bin/python
   ```
   - If shows system python, venv not activated

**Solutions:**

- **If Python not installed:**
  - Download from python.org
  - Make sure to check "Add Python to PATH" during install
  - Restart terminal after install

- **If venv doesn't exist:**
  ```bash
  cd backend
  python -m venv venv
  # Then activate (see below)
  ```

- **If not activated (Windows):**
  ```bash
  cd backend
  venv\Scripts\activate
  ```

- **If not activated (Mac/Linux):**
  ```bash
  cd backend
  source venv/bin/activate
  ```

---

### Dependency installation fails

**Symptoms:**
```
ERROR: Could not find a version that satisfies the requirement
# Or
pip install fails with permission denied
```

**Steps to diagnose:**

1. **Check venv is activated:**
   ```bash
   python -m pip --version
   # Should show path inside venv/
   ```

2. **Check requirements.txt exists:**
   ```bash
   cat requirements.txt
   # Should list packages
   ```

3. **Check file integrity:**
   ```bash
   # Make sure no special characters in file
   cat requirements.txt | head -5
   ```

**Solutions:**

- **If venv not activated:**
  - Activate it (see [Python venv issues](#python-venv-issues))

- **If requirements.txt missing:**
  - Create it with:
    ```bash
    echo "fastapi==0.115.0" > requirements.txt
    echo "uvicorn==0.30.6" >> requirements.txt
    # ... etc
    ```

- **If specific package fails:**
  ```bash
  # Try installing individually
  pip install fastapi==0.115.0
  # If this works, others probably will too
  ```

- **If permission denied:**
  ```bash
  # Make sure venv is activated
  # Or use --user flag (not recommended)
  pip install --upgrade pip setuptools wheel
  ```

---

### Port 8000 already in use

**Symptoms:**
```
OSError: [Errno 48] Address already in use
# Or
Port 8000 already in use by another process
```

**Steps to diagnose:**

1. **Check what's using the port:**
   ```bash
   # Windows (PowerShell as admin):
   Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess

   # Mac/Linux:
   lsof -i :8000
   ```

2. **Check if old server is still running:**
   ```bash
   # Look for uvicorn process
   ps aux | grep uvicorn
   ```

**Solutions:**

- **If old server still running:**
  ```bash
  # Kill it (find the PID from above and):
  kill -9 PID
  # Or in Windows:
  Stop-Process -Id PID -Force
  ```

- **If other app is using port:**
  - Use different port: `uvicorn main:app --port 8001`
  - Or stop the other app

- **If stuck, nuclear option:**
  ```bash
  # Restart your computer (port will be freed)
  ```

---

### Node modules won't install

**Symptoms:**
```
npm install fails with various errors
# Or
package.json not found
```

**Steps to diagnose:**

1. **Check you're in frontend directory:**
   ```bash
   pwd
   # Should end with: .../frontend
   ls package.json
   # Should list package.json
   ```

2. **Check npm is installed:**
   ```bash
   npm --version
   # Should output version number
   ```

3. **Check node_modules is writable:**
   ```bash
   ls -la node_modules/
   # If it exists, check permissions
   ```

**Solutions:**

- **If in wrong directory:**
  ```bash
  cd frontend
  npm install
  ```

- **If npm not installed:**
  - Download Node.js from nodejs.org (includes npm)
  - Install and restart terminal

- **If node_modules corrupted:**
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

- **If npm cache corrupted:**
  ```bash
  npm cache clean --force
  npm install
  ```

---

### npm run dev fails

**Symptoms:**
```
next not found
# Or
Error: Cannot find module 'next'
```

**Steps to diagnose:**

1. **Check dependencies installed:**
   ```bash
   ls -la node_modules/.bin/next
   # Should exist
   ```

2. **Check npm cache:**
   ```bash
   npm list next
   # Should show version
   ```

**Solutions:**

- **If dependencies not installed:**
  ```bash
  npm install
  # Then try again
  ```

- **If still failing:**
  ```bash
  npm install next@latest
  npm run dev
  ```

---

### CORS errors

**Symptoms:**
```
Access to XMLHttpRequest from 'http://localhost:3000' has been blocked
# Or
CORS error: Origin not allowed
```

**Steps to diagnose:**

1. **Check backend CORS config:**
   ```bash
   cd backend
   grep -A5 "CORSMiddleware" main.py
   # Should show: allow_origins=["*"]
   ```

2. **Check request headers:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Click on failed request
   - Look at Request Headers
   - Check Origin and Referer

**Solutions:**

- **If CORS middleware missing:**
  ```python
  from fastapi.middleware.cors import CORSMiddleware

  app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
  )
  ```

- **If origin not allowed (production):**
  ```python
  # Change from "*" to specific origins:
  allow_origins=[
    "https://yourdomain.com",
    "http://localhost:3000"  # keep for dev
  ]
  ```

---

### Can't create bucket

**Symptoms:**
```
Error: Bucket name not available
# Or
Permission denied creating bucket
```

**Steps to diagnose:**

1. **Check Cloudflare access:**
   - Go to https://dash.cloudflare.com/
   - Look for "R2" in left sidebar
   - If missing, you don't have R2 access

2. **Check bucket name rules:**
   - Must be lowercase
   - No spaces
   - No special characters except hyphens
   - Must be globally unique

**Solutions:**

- **If name taken:**
  - Try a different name with your account ID in it
  - Example: `critical-role-companion-xyz123`

- **If no R2 access:**
  - Contact Cloudflare support
  - Or use different storage (AWS S3)

---

### Upload fails

**Symptoms:**
```
Upload to R2 failed
# Or
403 Forbidden
```

**Steps to diagnose:**

1. **Check R2 credentials:**
   ```bash
   cd backend
   grep R2 .env
   # Should show: R2_ACCESS_KEY_ID=xxx
   ```

2. **Check bucket exists:**
   - Go to Cloudflare R2
   - Should list your bucket

3. **Check API token permissions:**
   - Go to Cloudflare → R2 → API Tokens
   - Check token has "Object Read & Write" permission

**Solutions:**

- **If credentials wrong:**
  - Get new ones from Cloudflare
  - Update `.env`

- **If bucket doesn't exist:**
  - Create it (see [Can't create bucket](#cant-create-bucket))

- **If token has wrong permissions:**
  - Delete old token
  - Create new one with "Object Read & Write"

---

### Image URL doesn't work

**Symptoms:**
```
Image 404 Not Found
# Or
Image won't load, blank on page
```

**Steps to diagnose:**

1. **Check URL format:**
   ```
   Correct: https://cdn.example.com/campaign/portraits/char-id.png
   Wrong: /images/photo.png (relative path)
   ```

2. **Check bucket is public:**
   - Cloudflare R2 → Settings
   - "CORS" section should allow public access

3. **Check image was actually uploaded:**
   - Go to Cloudflare R2
   - Look in your bucket
   - Should see the file there

**Solutions:**

- **If URL is relative:**
  - Use full URL returned from backend

- **If bucket not public:**
  ```
  In Cloudflare R2:
  1. Go to bucket settings
  2. Enable public access
  3. Regenerate URLs
  ```

- **If image not uploaded:**
  - Check upload endpoint is working
  - Check R2 credentials are correct

---

### Frontend can't reach backend

**Symptoms:**
```
Network error: Failed to fetch
# Or
localhost:8000 refused connection
```

**Steps to diagnose:**

1. **Check backend is running:**
   ```bash
   curl http://localhost:8000/docs
   # Should return HTML (FastAPI docs)
   ```

2. **Check CORS headers:**
   - Browser DevTools → Network tab
   - Click failed request
   - Check Response Headers for `access-control-allow-origin`

3. **Check API URL in frontend:**
   ```bash
   grep -r "localhost:8000" frontend/lib/
   # Should show your API calls
   ```

**Solutions:**

- **If backend not running:**
  ```bash
  cd backend
  source venv/bin/activate  # or venv\Scripts\activate on Windows
  uvicorn main:app --reload
  ```

- **If CORS not set:**
  - See [CORS errors](#cors-errors) section

- **If wrong URL in frontend:**
  - Check `.env.local`:
    ```
    NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
    ```

---

### WebSocket connection fails

**Symptoms:**
```
WebSocket connection failed
# Or
ws://localhost:8000/ws 404 Not Found
```

**Steps to diagnose:**

1. **Check WebSocket endpoint exists:**
   ```bash
   grep -n "@app.websocket" backend/main.py
   # Should find the WebSocket route
   ```

2. **Check backend is running:**
   ```bash
   curl http://localhost:8000/docs
   # Should work
   ```

3. **Check frontend connects to right URL:**
   ```bash
   grep -n "ws://" frontend/lib/api.ts
   # Should show your WebSocket URL
   ```

**Solutions:**

- **If endpoint doesn't exist:**
  - Wait for Phase 0.3 (backend refactor adds it)

- **If backend not running:**
  - Start backend (see [Frontend can't reach backend](#frontend-cant-reach-backend))

- **If wrong URL:**
  - Should be: `ws://localhost:8000/campaigns/{id}/ws`
  - Not: `ws://localhost:8000/ws`

---

### Port conflicts

**Symptoms:**
```
Can't start frontend or backend on the same port
# Or
Both trying to use port 3000 or 8000
```

**Steps to diagnose:**

1. **Check which services are running:**
   ```bash
   # Windows (PowerShell):
   netstat -ano | findstr :3000
   netstat -ano | findstr :8000

   # Mac/Linux:
   lsof -i :3000
   lsof -i :8000
   ```

2. **Check configuration:**
   ```bash
   # Backend:
   grep -n "port" backend/main.py

   # Frontend:
   grep -n "port" frontend/package.json
   ```

**Solutions:**

- **If both on same port:**
  ```bash
  # Frontend (next.js) defaults to 3000
  # Backend defaults to 8000
  # They should not conflict
  # But if they do:

  # Change backend:
  uvicorn main:app --port 8001

  # Change frontend:
  PORT=3001 npm run dev
  ```

- **If old process still running:**
  - Kill it (see [Port 8000 already in use](#port-8000-already-in-use))

---

## 📞 When Asking for Help

**To get the best help, include:**

1. **Exact error message** (copy-paste from console)
2. **What you were doing** when it happened
3. **What you expected to happen**
4. **What actually happened**
5. **Steps you already tried**
6. **Your system info:**
   ```bash
   python --version
   node --version
   npm --version
   uname -a  # or "systeminfo" on Windows
   ```

**Example good question:**
```
I'm trying to run `npm run dev` in the frontend folder.
I get this error:
  Error: Cannot find module 'next'

I've already tried:
  1. Running `npm install`
  2. Deleting node_modules and reinstalling
  3. Clearing npm cache

My system: Python 3.11, Node 18.17, Windows 11

What should I try next?
```

**Example bad question:**
```
It doesn't work. Help!
```

---

## 🔄 Quick Checklist Before Asking for Help

- [ ] I checked the exact error message
- [ ] I googled the error (if short enough)
- [ ] I checked this troubleshooting guide
- [ ] I tried the suggested solution
- [ ] I restarted the service/terminal
- [ ] I checked my `.env` file for typos
- [ ] I'm in the right directory (`pwd`)
- [ ] I've activated my venv

**If all of the above are done, ask for help!**

---

Last updated: 2025-11-20
