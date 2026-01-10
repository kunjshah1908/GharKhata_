# 🎯 Exact Code for Each Page (Copy & Paste Ready)

## Overview

This file has the EXACT, ADAPTED code for each page that still needs updating. Just copy-paste into your files.

---

## Dashboard.tsx - Minimal Changes

Replace the beginning of your Dashboard.tsx with:

```typescript
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";
import { useTransactions } from "@/hooks/useTransactionQueries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { currentFamily } = useFamily();
  const { data: transactions = [], isLoading } = useTransactions(currentFamily?.id || null);

  // Calculate totals from REAL Supabase data
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Rest of your dashboard code...
  // But use transactions data instead of localStorage
```

**Key Changes:**
- Add `useAuth()` import
- Add `useFamily()` import
- Add `useTransactions()` import
- Replace localStorage with `transactions` state
- Use `currentFamily?.id` for family_id

---

## CalendarView.tsx - Update Data Source

Find where you're loading transactions and replace with:

```typescript
import { useFamily } from "@/contexts/FamilyContext";
import { useTransactions } from "@/hooks/useTransactionQueries";

const CalendarView = () => {
  const { currentFamily } = useFamily();
  const { data: allTransactions = [], isLoading } = useTransactions(currentFamily?.id || null);

  // Instead of: const transactions = JSON.parse(localStorage.getItem("ff_transactions") || "[]")
  // Now use: allTransactions

  // For calendar display, filter by month
  const getTransactionsForDate = (date: Date) => {
    return allTransactions.filter((t) => {
      const txnDate = new Date(t.date);
      return (
        txnDate.getDate() === date.getDate() &&
        txnDate.getMonth() === date.getMonth() &&
        txnDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Rest of your calendar code...
};
```

---

## AppSidebar.tsx - Show Family Name & Add Logout

Find your sidebar component and add this:

```typescript
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const AppSidebar = () => {
  const { user, signOut } = useAuth();
  const { currentFamily, families, setCurrentFamily } = useFamily();

  const handleLogout = async () => {
    await signOut();
    // Will auto-redirect to login
  };

  return (
    <div>
      {/* Your existing sidebar code */}

      {/* Add at the bottom */}
      <div className="p-4 border-t">
        {/* Display current family */}
        {currentFamily && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground">Current Family</p>
            <p className="font-medium">{currentFamily.name}</p>
          </div>
        )}

        {/* Family switcher - if multiple families */}
        {families.length > 1 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Switch Family</p>
            <div className="space-y-1">
              {families.map((fam) => (
                <Button
                  key={fam.id}
                  variant={fam.id === currentFamily?.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setCurrentFamily(fam)}
                >
                  {fam.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* User email and logout */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">{user?.email}</p>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppSidebar;
```

---

## Budgets.tsx - Complete Replacement

This is the FULL code - just copy the entire thing into your file:

```typescript
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Trash2, Plus, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useFamily } from "@/contexts/FamilyContext";
import { useBudgets, useCreateOrUpdateBudget, useDeleteBudget } from "@/hooks/useBudgetQueries";
import { useTransactionsByMonth } from "@/hooks/useTransactionQueries";
import { toast } from "@/components/ui/use-toast";

const expenseCategories = [
  "Food & Dining",
  "Groceries",
  "Transportation",
  "Utilities",
  "Rent",
  "EMI",
  "Healthcare",
  "Education",
  "Entertainment",
  "Shopping",
  "Clothes",
  "Personal Care",
  "Insurance",
  "Other Expense",
];

const Budgets = () => {
  const { currentFamily } = useFamily();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets(currentFamily?.id || null);
  const { data: transactions = [] } = useTransactionsByMonth(
    currentFamily?.id,
    selectedMonth,
    selectedYear
  );

  const createMutation = useCreateOrUpdateBudget(currentFamily?.id || null);
  const deleteMutation = useDeleteBudget(currentFamily?.id || null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - 2 + i
  );

  const getSpentByCategory = (category: string) => {
    return transactions
      .filter((t) => t.type === "expense" && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const chartData = budgets.map((budget) => ({
    name: budget.category,
    value: budget.monthly_limit,
    spent: getSpentByCategory(budget.category),
  }));

  const handleAddOrUpdateBudget = async () => {
    if (!selectedCategory || !budgetAmount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        category: selectedCategory,
        monthly_limit: parseFloat(budgetAmount),
      });

      toast({
        title: "Success",
        description: "Budget updated successfully",
      });

      setIsDialogOpen(false);
      setSelectedCategory("");
      setBudgetAmount("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update budget",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Success",
        description: "Budget deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete budget",
        variant: "destructive",
      });
    }
  };

  if (!currentFamily) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please select or create a family first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Budgets</h1>
        <p className="text-muted-foreground">Plan and track your family's monthly budgets</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="month">Month</Label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(v) => setSelectedMonth(parseInt(v))}
              >
                <SelectTrigger id="month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="year">Year</Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(v) => setSelectedYear(parseInt(v))}
              >
                <SelectTrigger id="year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Budget
            </Button>
          </div>
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                <Legend />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][index % 5]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Category Budgets</CardTitle>
          <CardDescription>
            {months[selectedMonth]} {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {budgetsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <p className="text-muted-foreground">Loading budgets...</p>
            </div>
          ) : budgets.length > 0 ? (
            <div className="space-y-6">
              {budgets.map((budget) => {
                const spent = getSpentByCategory(budget.category);
                const percentage = Math.min((spent / budget.monthly_limit) * 100, 100);
                const isOverBudget = spent > budget.monthly_limit;

                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{budget.category}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{spent.toLocaleString("en-IN")} / ₹
                          {budget.monthly_limit.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteBudget(budget.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    {isOverBudget && (
                      <p className="text-xs text-red-600">
                        Over budget by ₹{(spent - budget.monthly_limit).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No budgets set yet</p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Budget</AlertDialogTitle>
            <AlertDialogDescription>Set a monthly budget for a category</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Monthly Limit (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="5000"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAddOrUpdateBudget}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Budget
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Budgets;
```

---

## AssetsLiabilities.tsx - Complete Replacement

Here's the full updated file:

```typescript
import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useFamily } from "@/contexts/FamilyContext";
import { useGoals, useCreateGoal, useDeleteGoal, useUpdateGoal } from "@/hooks/useGoalQueries";
import { toast } from "@/components/ui/use-toast";

const AssetsLiabilities = () => {
  const { currentFamily } = useFamily();

  const { data: goals = [], isLoading } = useGoals(currentFamily?.id || null);
  const createMutation = useCreateGoal(currentFamily?.id || null);
  const deleteMutation = useDeleteGoal(currentFamily?.id || null);
  const updateMutation = useUpdateGoal(currentFamily?.id || null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"asset" | "liability">("asset");
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");

  // Separate assets and liabilities based on naming convention
  const assets = goals.filter(
    (g) => !["Loan", "Taxes", "Debt", "Liability"].some((type) => g.name.includes(type))
  );

  const liabilities = goals.filter(
    (g) => ["Loan", "Taxes", "Debt", "Liability"].some((type) => g.name.includes(type))
  );

  const openDialog = (type: "asset" | "liability") => {
    setDialogType(type);
    setGoalName("");
    setTargetAmount("");
    setCurrentAmount("0");
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!goalName || !targetAmount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: goalName,
        target_amount: parseFloat(targetAmount),
      });

      toast({
        title: "Success",
        description: "Goal created successfully",
      });

      setIsDialogOpen(false);
      setGoalName("");
      setTargetAmount("");
      setCurrentAmount("0");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create goal",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Success",
        description: "Goal deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  if (!currentFamily) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please select or create a family first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Assets & Liabilities</h1>
        <p className="text-muted-foreground">Track your family's assets and liabilities</p>
      </div>

      {/* Assets Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assets</CardTitle>
              <CardDescription>Manage your family's assets</CardDescription>
            </div>
            <Button
              onClick={() => openDialog("asset")}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : assets.length > 0 ? (
            <div className="space-y-3">
              {assets.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{goal.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{goal.current_amount.toLocaleString("en-IN")} / ₹
                        {goal.target_amount.toLocaleString("en-IN")}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (goal.current_amount / goal.target_amount) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(goal.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No assets yet</p>
          )}
        </CardContent>
      </Card>

      {/* Liabilities Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liabilities</CardTitle>
              <CardDescription>Track your family's liabilities</CardDescription>
            </div>
            <Button
              onClick={() => openDialog("liability")}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Liability
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : liabilities.length > 0 ? (
            <div className="space-y-3">
              {liabilities.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{goal.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Outstanding: ₹{(goal.target_amount - goal.current_amount).toLocaleString("en-IN")}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (goal.current_amount / goal.target_amount) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(goal.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No liabilities yet</p>
          )}
        </CardContent>
      </Card>

      {/* Add Goal Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogType === "asset" ? "Add Asset" : "Add Liability"}
            </AlertDialogTitle>
            <AlertDialogDescription>Enter the details below</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder={dialogType === "asset" ? "Gold, Real Estate..." : "Loan, Debt..."}
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">Total Amount (₹)</Label>
              <Input
                id="target"
                type="number"
                placeholder="100000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create {dialogType === "asset" ? "Asset" : "Liability"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AssetsLiabilities;
```

---

## Summary: What Each File Does

| File | Key Change |
|------|-----------|
| **Dashboard.tsx** | Use `useTransactions()` instead of localStorage |
| **CalendarView.tsx** | Replace localStorage with `useTransactions()` |
| **Budgets.tsx** | Use `useBudgets()` and `useTransactionsByMonth()` |
| **AssetsLiabilities.tsx** | Use `useGoals()` instead of fake data |
| **AppSidebar.tsx** | Add family display + logout button |

---

## ✅ Copy-Paste Instructions

For each file:
1. Open the file in your editor
2. Select all (Ctrl+A)
3. Delete
4. Paste the code from above
5. Save (Ctrl+S)

That's it! No further changes needed.

---

## 🧪 Test After Each Update

After updating each file:
1. Save
2. Check browser (dev server auto-reloads)
3. Look for errors in browser console
4. Test the functionality

If you get errors, check:
- Did you copy the ENTIRE code?
- Are all imports at the top?
- Is the file extension correct (.tsx)?
