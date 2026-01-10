# ⚡ SETUP NEW SUPABASE PROJECT - STEP BY STEP

You don't have a Supabase project yet! Follow these steps to create one and get your app working.

---

## 📝 STEP 1: CREATE SUPABASE PROJECT (5 min)

### 1.1 Go to Supabase
👉 **https://supabase.com/dashboard**

### 1.2 Create Account (if needed)
- Sign up with email or GitHub
- Verify your email if asked

### 1.3 Create New Project
1. Click **"New Project"** (big green button)
2. Fill in the form:

```
Organization: [Select your organization or create new]
Name: gharkhata
Database Password: [CHOOSE A STRONG PASSWORD AND SAVE IT!]
Region: [Choose closest - e.g., "Southeast Asia (Mumbai)" for India]
Pricing Plan: Free
```

3. Click **"Create new project"**
4. **WAIT 2-3 minutes** - You'll see a loading animation ⏳

---

## 🗄️ STEP 2: SETUP DATABASE TABLES (3 min)

### 2.1 Open SQL Editor
Once your project is ready:
1. Click **"SQL Editor"** in left sidebar
2. Click **"+ New Query"** (top right)

### 2.2 Run First Migration
1. Open this file on your computer:
   ```
   D:\GitHub Repositories\gharkhata_semicolon\supabase\migrations\20260109145416_58ad538f-578a-47f5-8249-ec81b4c2830b.sql
   ```

2. **Select ALL the content** (Ctrl+A) and **Copy** (Ctrl+C)

3. **Paste** into the Supabase SQL Editor

4. Click **"Run"** button (or Ctrl+Enter)

5. You should see: ✅ **"Success. XX rows affected"** or similar

### 2.3 Apply the Fix
1. Click **"+ New Query"** again

2. Open this file:
   ```
   D:\GitHub Repositories\gharkhata_semicolon\supabase\migrations\20260110000001_fix_family_member_insert_policy.sql
   ```

3. **Copy ALL content**

4. **Paste** into SQL Editor and **Run**

5. Should see: ✅ **"Success. No rows returned"**

---

## 🔑 STEP 3: GET YOUR CREDENTIALS (2 min)

### 3.1 Go to Settings
1. Click **"Settings"** (⚙️ icon) in left sidebar at bottom
2. Click **"API"** tab

### 3.2 Copy These Values

You'll see something like this:

```
Project URL: https://xyzabc123.supabase.co
```

Scroll down to **"Project API keys"**:

```
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ...
```

**COPY BOTH VALUES!**

### 3.3 Extract Project ID
From the URL `https://xyzabc123.supabase.co`, the Project ID is: `xyzabc123`

---

## 📝 STEP 4: UPDATE YOUR .ENV FILE (1 min)

### 4.1 Open .env File
```
D:\GitHub Repositories\gharkhata_semicolon\.env
```

### 4.2 Replace Values
The file currently looks like this:
```env
VITE_SUPABASE_PROJECT_ID="YOUR_NEW_PROJECT_ID_HERE"
VITE_SUPABASE_PUBLISHABLE_KEY="YOUR_NEW_ANON_PUBLIC_KEY_HERE"
VITE_SUPABASE_URL="YOUR_NEW_PROJECT_URL_HERE"
```

Replace with YOUR values from Step 3:

```env
VITE_SUPABASE_PROJECT_ID="xyzabc123"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://xyzabc123.supabase.co"
```

**SAVE THE FILE** (Ctrl+S)

---

## 🚀 STEP 5: RESTART YOUR APP (1 min)

### 5.1 Stop Current Dev Server
In your terminal, press **Ctrl+C**

### 5.2 Start Again
```powershell
npm run dev
```

### 5.3 Open in Browser
Go to: **http://localhost:5173** (or whatever port is shown)

---

## ✅ STEP 6: TEST IT! (2 min)

### 6.1 Register New User
1. Click **"Register"** or **"Sign Up"**
2. Fill in:
   - Email: test@example.com (or your real email)
   - Password: Test123456
   - Display Name: Test User
3. Click **"Continue"**

### 6.2 Create Family
1. You should see "Set Up Family" screen after ~1.5 seconds
2. Enter family name: "My Family"
3. Click **"Create Family"**

### 6.3 Success! 🎉
You should now see:
- ✅ Dashboard with your family data
- ✅ Sidebar with navigation
- ✅ Can add transactions, budgets, etc.

---

## 🐛 TROUBLESHOOTING

### Issue: "Invalid API key"
**Fix**: Double-check you copied the **anon public** key (NOT the service_role key)

### Issue: "Failed to fetch"
**Fix**: Make sure:
- Your Supabase project is running (check dashboard)
- Your .env file has the correct URL
- You restarted the dev server after updating .env

### Issue: "User not authenticated" when creating family
**Fix**: Make sure you ran BOTH SQL migrations in Step 2

### Issue: App won't start after updating .env
**Fix**: 
1. Stop the server (Ctrl+C)
2. Clear cache: `npm run build` (optional)
3. Start again: `npm run dev`

---

## 📋 QUICK CHECKLIST

Before asking for help, verify:

- [ ] Created Supabase project successfully
- [ ] Waited for project to finish creating (2-3 min)
- [ ] Ran BOTH SQL migrations (Step 2.2 and 2.3)
- [ ] Copied the correct values from Settings → API
- [ ] Updated .env file with new values
- [ ] Saved .env file
- [ ] Restarted dev server
- [ ] Can access app at localhost:5173

---

## 🎯 EXPECTED RESULT

After completing all steps:

✅ **Supabase Dashboard** shows:
- Your "gharkhata" project
- 9 tables in Database → Tables
- Policies set on all tables

✅ **Your App** should:
- Load without errors
- Allow user registration
- Allow family creation
- Show dashboard with data
- All features working

---

## 🆘 STILL STUCK?

If you followed all steps and it's not working:

1. **Open browser console** (F12) and check for errors
2. **Check Supabase logs**: Dashboard → Logs → API
3. **Verify database tables**: Dashboard → Database → Tables (should see 9 tables)
4. **Check if migrations ran**: Dashboard → Database → Migrations

Take screenshots and note any error messages!

---

## 💾 SAVE YOUR PASSWORD!

**IMPORTANT**: Save your Supabase database password somewhere safe!
- You'll need it if you want to use Supabase CLI
- You can reset it later in Settings → Database, but it's better to save it now

---

## 🎉 THAT'S IT!

Your GharKhata app should now be fully functional with:
- ✅ Working authentication
- ✅ Family management
- ✅ Transaction tracking
- ✅ Budget management
- ✅ Goal tracking
- ✅ Notes system
- ✅ Reports and analytics

Enjoy your finance app! 🚀
