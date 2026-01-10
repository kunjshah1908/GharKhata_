# Supabase Integration Complete Setup Guide

## ✅ What's Been Created

Your project now has a complete Supabase backend integration with authentication and real-time database syncing. Here's everything that's been set up:

---

## 📁 New Files Created

### Authentication & Context Management
1. **`src/contexts/AuthContext.tsx`** - Auth state management with sign up, sign in, sign out, and password reset
2. **`src/contexts/FamilyContext.tsx`** - Family management (select family, create family, manage members)

### Query Hooks (React Query)
3. **`src/hooks/useTransactionQueries.ts`** - All transaction CRUD operations
4. **`src/hooks/useBudgetQueries.ts`** - All budget CRUD operations
5. **`src/hooks/useGoalQueries.ts`** - All goal/asset CRUD operations

### Authentication Pages
6. **`src/pages/Login.tsx`** - User login page
7. **`src/pages/Register.tsx`** - User registration and first family creation
8. **`src/pages/ForgotPassword.tsx`** - Password reset page

### Updated Files
9. **`src/App.tsx`** - Added auth providers, protected routes, and navigation
10. **`src/pages/Transactions.tsx`** - Now uses Supabase data instead of localStorage

---

## 🔧 Database Schema (Already Exists)

Your `supabase/migrations/` folder contains the complete database schema with:

### Tables
- **families** - Store family information
- **family_members** - Associate users with families
- **user_profiles** - User metadata
- **transactions** - Income/expense tracking
- **budgets** - Monthly budget limits by category
- **goals** - Financial goals
- **goal_contributions** - Contributions to goals
- **notes** - Family notes
- **obligations** - EMIs, rent, subscriptions

### Row Level Security (RLS) Policies
All tables have RLS enabled ensuring users only see their family's data.

---

## 🚀 How to Use the New Code

### Step 1: Users Must Authenticate First

Replace the landing page behavior. When users are not logged in, they see:
- Homepage (`/`) - Landing page
- `/login` - Sign in
- `/register` - Create account + family
- `/forgot-password` - Reset password

Once logged in, they access:
- `/dashboard` and all sub-pages

### Step 2: How Transactions Page Now Works

```typescript
// In your Transactions component, you now have:
const { currentFamily } = useFamily(); // Gets logged-in user's family

// Fetch transactions for a specific month
const { data: transactions } = useTransactionsByMonth(
  currentFamily?.id,
  selectedMonth,
  selectedYear
);

// Create new transaction
const createMutation = useCreateTransaction(currentFamily?.id);
await createMutation.mutateAsync({
  type: "expense",
  category: "Food & Dining",
  amount: 500,
  date: "2026-01-15",
  is_recurring: false
});

// Delete transaction
await deleteMutation.mutateAsync(transactionId);
```

**Key Adaptation**: Replace `currentFamily?.id` with your actual family ID from the `useFamily()` hook.

### Step 3: Update Other Pages (Budgets, Assets, Goals)

Follow the same pattern as Transactions:

#### For Budgets Page:
```typescript
import { useBudgets, useCreateOrUpdateBudget } from "@/hooks/useBudgetQueries";
import { useFamily } from "@/contexts/FamilyContext";

const Budgets = () => {
  const { currentFamily } = useFamily();
  const { data: budgets } = useBudgets(currentFamily?.id || null);
  const createMutation = useCreateOrUpdateBudget(currentFamily?.id || null);
  
  // Use mutations to create/update budgets
};
```

#### For Assets/Liabilities Page (Goals):
```typescript
import { useGoals, useCreateGoal } from "@/hooks/useGoalQueries";
import { useFamily } from "@/contexts/FamilyContext";

const AssetsLiabilities = () => {
  const { currentFamily } = useFamily();
  const { data: goals } = useGoals(currentFamily?.id || null);
  const createMutation = useCreateGoal(currentFamily?.id || null);
  
  // Use mutations for goal operations
};
```

---

## 🔑 Key Integration Points

### 1. **AuthContext Usage**
```typescript
import { useAuth } from "@/contexts/AuthContext";

const MyComponent = () => {
  const { user, loading, signOut } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return <div>Welcome {user.email}</div>;
};
```

### 2. **FamilyContext Usage**
```typescript
import { useFamily } from "@/contexts/FamilyContext";

const MyComponent = () => {
  const { currentFamily, currentMember, families, createFamily } = useFamily();
  
  // currentFamily: { id, name, currency, month_start_day }
  // currentMember: { id, role: "financial_manager" | "member" }
  // families: array of all families user belongs to
};
```

### 3. **Query Hooks Pattern**
All query hooks follow this pattern:

```typescript
// Read data
const { data, isLoading, error } = useQuery(...);

// Write data
const mutation = useMutation(...);
await mutation.mutateAsync(data);
```

---

## 📝 Important Customizations Needed

### For `AssetsLiabilities.tsx` Page

Replace the current fake data implementation with Goals from Supabase:

```typescript
import { useGoals, useCreateGoal, useDeleteGoal } from "@/hooks/useGoalQueries";
import { useFamily } from "@/contexts/FamilyContext";

// Remove: useState for fake transactions
// Add: useGoals, useCreateGoal, useDeleteGoal

const AssetsLiabilities = () => {
  const { currentFamily } = useFamily();
  const { data: goals = [] } = useGoals(currentFamily?.id || null);
  const createMutation = useCreateGoal(currentFamily?.id || null);
  const deleteMutation = useDeleteGoal(currentFamily?.id || null);

  // Map goals to your component's display logic
  // A "goal" in Supabase represents an asset or liability
};
```

### For `Budgets.tsx` Page

```typescript
import { useBudgets, useCreateOrUpdateBudget } from "@/hooks/useBudgetQueries";
import { useFamily } from "@/contexts/FamilyContext";
import { useTransactionsByMonth } from "@/hooks/useTransactionQueries";

const Budgets = () => {
  const { currentFamily } = useFamily();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const { data: budgets = [] } = useBudgets(currentFamily?.id || null);
  const { data: transactions = [] } = useTransactionsByMonth(
    currentFamily?.id,
    selectedMonth,
    selectedYear
  );
  const createMutation = useCreateOrUpdateBudget(currentFamily?.id || null);

  // Now use real data instead of localStorage
};
```

### For `Dashboard.tsx` Page

```typescript
import { useFamily } from "@/contexts/FamilyContext";
import { useTransactions } from "@/hooks/useTransactionQueries";

const Dashboard = () => {
  const { currentFamily } = useFamily();
  const { data: transactions = [] } = useTransactions(currentFamily?.id || null);

  // Display real family transactions
};
```

---

## 🔐 Environment Variables

Your `.env` file already has these set:
```
VITE_SUPABASE_PROJECT_ID="kgesubynduzwslvovgtn"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJ..."
VITE_SUPABASE_URL="https://kgesubynduzwslvovgtn.supabase.co"
```

**No changes needed here** - Supabase client is already configured.

---

## 🛠️ Testing the Integration

### 1. Start your dev server:
```bash
npm run dev
# or
bun run dev
```

### 2. Test Registration Flow:
- Go to `/register`
- Create an account with email and password
- Create a family
- Get redirected to dashboard

### 3. Test Login/Logout:
- Sign out from dashboard
- Go to `/login`
- Sign back in
- Your family data persists

### 4. Test Creating Transactions:
- In Transactions page, click "Add Income" or "Add Expense"
- Create a transaction
- It saves to Supabase (not localStorage)
- Refresh page - data still there!

---

## 📊 Data Flow Architecture

```
┌─────────────┐
│  React App  │
└──────┬──────┘
       │
       ├─ AuthContext (manages user auth)
       │
       ├─ FamilyContext (manages which family)
       │
       └─ React Query Hooks
           ├─ useTransactionQueries
           ├─ useBudgetQueries
           └─ useGoalQueries
                    │
                    └─ Supabase Client (calls backend)
                           │
                           └─ PostgreSQL Database
```

---

## ⚠️ Important: Adapt These for Your Project

### 1. **Dashboard.tsx** - Show real family data
### 2. **Budgets.tsx** - Fetch real budgets from DB
### 3. **AssetsLiabilities.tsx** - Use Goals table for assets/liabilities
### 4. **CalendarView.tsx** - Sync with Supabase transactions
### 5. **AppSidebar.tsx** - Show current family name and allow switching families

---

## 🎯 Next Steps

1. **Update Budgets.tsx** - Replace localStorage with useBudgets hook
2. **Update AssetsLiabilities.tsx** - Replace fake data with useGoals hook
3. **Update Dashboard.tsx** - Show real transaction data
4. **Update CalendarView.tsx** - Sync dates with Supabase data
5. **Add Family Switching UI** - Let users switch between families in sidebar

---

## 💡 Example: Complete Transaction Flow

```typescript
// File: src/pages/Transactions.tsx
import { useFamily } from "@/contexts/FamilyContext";
import {
  useTransactionsByMonth,
  useCreateTransaction,
  useDeleteTransaction,
} from "@/hooks/useTransactionQueries";

const Transactions = () => {
  const { currentFamily } = useFamily();
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedYear, setSelectedYear] = useState(2026);

  // Fetch transactions for month/year
  const { data: transactions = [] } = useTransactionsByMonth(
    currentFamily?.id,
    selectedMonth,
    selectedYear
  );

  // Mutations for CRUD
  const createMutation = useCreateTransaction(currentFamily?.id);
  const deleteMutation = useDeleteTransaction(currentFamily?.id);

  const handleAddTransaction = async () => {
    try {
      await createMutation.mutateAsync({
        type: "expense",
        category: "Food & Dining",
        amount: 500,
        date: "2026-01-15",
        is_recurring: false,
      });
      // UI auto-updates because React Query invalidates
    } catch (error) {
      console.error("Failed to create:", error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      // UI auto-updates
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  return (
    <div>
      {/* Your UI here - now using real data */}
      {transactions.map(txn => (
        <div key={txn.id}>
          {txn.category}: ₹{txn.amount}
        </div>
      ))}
    </div>
  );
};
```

---

## 🆘 Troubleshooting

### Issue: "currentFamily is null"
**Cause**: User hasn't created or selected a family
**Fix**: Redirect to family creation or selection page

### Issue: "useFamily must be used within FamilyProvider"
**Cause**: Component is not wrapped by FamilyProvider
**Fix**: Check App.tsx - FamilyProvider should wrap dashboard routes

### Issue: Transactions not loading
**Cause**: Network/permission issue
**Fix**: Check browser console for Supabase error messages, verify RLS policies

---

## ✨ You're All Set!

Your project now has:
- ✅ User authentication
- ✅ Multi-family support
- ✅ Real-time database syncing
- ✅ Proper data permissions via RLS
- ✅ React Query for caching

**Start by updating the remaining pages to use the new hooks!**
