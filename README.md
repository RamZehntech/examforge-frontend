# 🖥️ CHUNK 3: Frontend — Deployment Guide

## Step 0: Set Your Backend URL

Open `src/utils/api.js` and find this line at the top:

```js
const API_BASE = import.meta.env.VITE_API_URL || "https://examforge-api.onrender.com";
```

Replace `https://examforge-api.onrender.com` with YOUR Render backend URL from Chunk 2.

---

## Local Testing (Optional)

```bash
cd chunk3-frontend
npm install
cp .env.example .env
# Edit .env → set VITE_API_URL to your Render backend URL
npm run dev
```

Open http://localhost:5173 — the app should load and connect to your backend.

---

## Deploy to Netlify (Free, 24/7)

### Step 1: Push to GitHub

1. Go to **https://github.com** → **"+"** → **"New repository"**
2. Name it `examforge-frontend`, **Public**, click **Create**
3. Upload files:

```bash
cd chunk3-frontend
git init
git add .
git commit -m "ExamForge frontend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/examforge-frontend.git
git push -u origin main
```

Or drag and drop all files into GitHub web interface.

### Step 2: Deploy on Netlify

1. Go to **https://app.netlify.com** → sign up with GitHub
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** → select your `examforge-frontend` repo
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **"Show advanced"** → **"New variable"** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Your Render backend URL (e.g. `https://examforge-api.onrender.com`) |

6. Click **"Deploy site"**
7. Wait 1-2 minutes — you'll get a URL like `https://examforge-xyz.netlify.app`

### Step 3: Update Backend CORS

Go back to **Render dashboard** → your backend service → **Environment**:
- Update `FRONTEND_URL` to your new Netlify URL (e.g. `https://examforge-xyz.netlify.app`)
- Click **Save Changes** → Render will auto-redeploy

### Step 4: Create Admin Account

1. Open your Netlify URL in browser
2. Register with: `admin@exam.com` / `admin123`
3. Go to **Supabase SQL Editor** and run:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'admin@exam.com';
   ```
4. Log out and log back in — you'll now see the Admin Dashboard

### Step 5: Test Everything!

✅ **As Admin:**
- Log in as admin@exam.com
- Click "Upload Test" → paste JSON → Validate → Publish
- The sample General Knowledge Quiz should already be there

✅ **As Student:**
- Open in incognito/private window
- Register a new student account
- Take a test → verify timer works
- Submit → check result page

---

## 🎉 Your app is LIVE!

**Your working URLs:**
- Frontend: `https://examforge-xyz.netlify.app`
- Backend: `https://examforge-api.onrender.com`
- Database: Supabase dashboard

**Share the frontend URL** — anyone can register and take tests!

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Failed to fetch" on login | Check VITE_API_URL is correct, no trailing slash |
| CORS error in console | Update FRONTEND_URL in Render env vars to match Netlify URL |
| Backend takes 30s first load | Normal for Render free tier — it sleeps after 15min inactivity |
| "Invalid credentials" for admin | Run the SQL UPDATE to set role='admin', then log out/in |
| Blank page on Netlify | Make sure `netlify.toml` is in the root of your repo |

## Optional: Custom Domain

1. In Netlify → **Domain settings** → **Add custom domain**
2. Follow DNS instructions to point your domain
3. Update `FRONTEND_URL` in Render to match new domain
