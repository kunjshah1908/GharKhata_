# 🎯 QUICK SETUP GUIDE - START HERE!

## You Need to Create a Supabase Project First!

The project doesn't exist yet. Here's the 10-minute setup:

---

## ⚡ FAST TRACK (Follow in Order)

### 1️⃣ CREATE PROJECT (3 min)
```
https://supabase.com/dashboard
→ Click "New Project"
→ Name: gharkhata
→ Password: [SAVE THIS!]
→ Region: Closest to you
→ Click "Create" → Wait 2-3 min
```

### 2️⃣ SETUP DATABASE (3 min)
```
→ Click "SQL Editor" (left sidebar)
→ Click "+ New Query"
→ Copy content from: supabase/migrations/20260109145416_*.sql
→ Paste and Run
→ Click "+ New Query" again
→ Copy content from: supabase/migrations/20260110000001_*.sql
→ Paste and Run
```

### 3️⃣ GET CREDENTIALS (2 min)
```
→ Click "Settings" → "API"
→ Copy "Project URL" (e.g., https://abc123.supabase.co)
→ Copy "anon public" key (starts with eyJ...)
```

### 4️⃣ UPDATE .ENV FILE (1 min)
```
Open: D:\GitHub Repositories\gharkhata_semicolon\.env
Replace with YOUR values:

VITE_SUPABASE_PROJECT_ID="abc123"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJ..."
VITE_SUPABASE_URL="https://abc123.supabase.co"

Save file!
```

### 5️⃣ RESTART APP (1 min)
```powershell
# In terminal: Ctrl+C to stop
npm run dev
```

### 6️⃣ TEST (2 min)
```
→ Open http://localhost:5173
→ Register new user
→ Create family
→ See dashboard ✅
```

---

## 📚 DETAILED GUIDE

👉 **See `SETUP_FROM_SCRATCH.md` for complete step-by-step instructions**

---

## 🚨 IMPORTANT

- **Save your database password** - you'll need it later!
- **Run BOTH SQL migrations** - not just one
- **Restart dev server** after updating .env
- **Use "anon public" key** - NOT service_role

---

## ✅ SUCCESS LOOKS LIKE

After setup:
- ✅ Can register users
- ✅ Can create families  
- ✅ Dashboard loads with data
- ✅ All features work

---

## 🆘 HELP

Something not working? Check:
1. Did you wait for project to finish creating? (2-3 min)
2. Did you run BOTH migrations?
3. Did you copy the correct API key?
4. Did you save .env and restart server?

Open browser console (F12) to see detailed error messages.

---

**Total Time: ~10 minutes** ⏱️
