# 🚀 Free Deployment Step-by-Step Guide

Yes! Once you finish these steps, you will get a single public link (like `https://nexuserp.vercel.app`) that you can send to your friend. They can open it on their phone or laptop anywhere in the world and use the app fully!

Here is the exact step-by-step process to deploy it for free:

## Phase 1: Set Up Cloud Databases
Because free servers delete local files on restart, you must move your databases to the cloud.

1. **MongoDB (For AI/Express):**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
   - Create a **Free M0 Cluster**.
   - Under "Database Access", create a username and password.
   - Under "Network Access", allow access from anywhere (`0.0.0.0/0`).
   - Click "Connect" -> "Drivers" and copy your connection string (it looks like `mongodb+srv://<user>:<pass>@cluster...`). Save this for later.

   dhrumilvaghela22_db_user : t6PuI9o50DDZ001M
   mongodb+srv://dhrumilvaghela22_db_user:<t6PuI9o50DDZ001M>@nexuserp.wlkelu4.mongodb.net/?appName=NexusERP

2. **Redis (For Sockets):**
   - Go to [Upstash](https://upstash.com/) and create a free account.
   - Create a Redis database.
   - Scroll down to find the `REDIS_URL` connection string. Save this.

   UPSTASH_REDIS_REST_URL="https://usable-fly-117759.upstash.io"

3. **PostgreSQL (To replace SQLite for Django):**
   - Go to [Neon.tech](https://neon.tech/) and create a free account.
   - Create a new project/database.
   - Copy the PostgreSQL connection string. Save this.
postgresql://neondb_owner:npg_j6gGZEK2Fdkz@ep-winter-flower-ax4kw0g0.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require
---

## Phase 2: Update Your Code for Production
You need to make a few code changes so your apps know they are in the cloud, not on `localhost`.

### 1. Update Django (in `/forged`)
- You must install adapters for Postgres and a production web server. Run this in your terminal:
  ```bash
  pip install psycopg2-binary dj-database-url gunicorn
  pip freeze > requirements.txt
  ```
- In `forged/settings.py`, replace your SQLite database setting with this so it reads from the cloud:
  ```python
  import dj_database_url
  import os
  
  DATABASES = {
      'default': dj_database_url.config(
          default=os.environ.get('DATABASE_URL', 'sqlite:///db.sqlite3')
      )
  }
  ```

### 2. Update Frontend URLs (in `/frontend`)
- In files like `AIBusinessSetup.jsx`, you have hardcoded `http://127.0.0.1:8000` and `http://127.0.0.1:3001`. 
- You need to change these to look for environment variables, or update them to the live Render URLs (you will get these URLs in Phase 3).
  ```javascript
  // Change this:
  const EXPRESS_API = "http://127.0.0.1:3001";
  const DJANGO_API = "http://127.0.0.1:8000";
  
  // To this (after you deploy in Phase 3):
  const EXPRESS_API = "https://your-express-app.onrender.com";
  const DJANGO_API = "https://your-django-app.onrender.com";
  ```

*Push all these changes to your GitHub repository before moving to Phase 3.*

---

## Phase 3: Deploy the Backends (Render.com)
1. Go to [Render.com](https://render.com/) and link your GitHub account.
2. **Deploy Django:**
   - Click "New" -> "Web Service".
   - Select your GitHub repository.
   - **Root Directory:** `forged`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn forged.wsgi:application`
   - **Environment Variables:** Add `DATABASE_URL` and paste your Neon PostgreSQL string.
   - Click **Create**. Render will give you a live URL (e.g., `https://nexus-django.onrender.com`).
3. **Deploy Express:**
   - Click "New" -> "Web Service".
   - Select your GitHub repository.
   - **Root Directory:** `express_app`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:** Add `MONGODB_URI` (from Atlas), `REDIS_URL` (from Upstash), and `GEMINI_API_KEY`.
   - Click **Create**. Render will give you a live URL (e.g., `https://nexus-express.onrender.com`).

---

## Phase 4: Deploy the Frontend (Vercel)
*(Make sure you updated your React code with the two Render URLs from Phase 3 and pushed to GitHub!)*

1. Go to [Vercel.com](https://vercel.com/) and log in with GitHub.
2. Click "Add New" -> "Project" and select your repository.
3. Open the **"Root Directory"** setting and select the `frontend` folder.
4. Click **Deploy**.

🎉 **You are done!** Vercel will give you a live URL. You can send this link to your friend, and they will be able to use the entire application!
