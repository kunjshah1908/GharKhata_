# Code Snippets for Updating Other Pages

## Page 1: Update Budgets.tsx

Replace the entire `src/pages/Budgets.tsx` with this (adapted for your project):

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

  // Fetch budgets and transactions
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets(currentFamily?.id || null);
  const { data: transactions = [] } = useTransactionsByMonth(
    currentFamily?.id,
    selectedMonth,
    selectedYear
  );

  // Mutations
  const createMutation = useCreateOrUpdateBudget(currentFamily?.id || null);
  const deleteMutation = useDeleteBudget(currentFamily?.id || null);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  // Calculate spent by category for current month
  const getSpentByCategory = (category: string) => {
    return transactions
      .filter((t) => t.type === "expense" && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Get budget for category
  const getBudgetForCategory = (category: string) => {
    const budget = budgets.find((b) => b.category === category);
    return budget ? budget.monthly_limit : 0;
  };

  // Chart data
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
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Budgets</h1>
        <p className="text-muted-foreground">Plan and track your family's monthly budgets</p>
      </div>

      {/* Month/Year Selector */}
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

      {/* Budget Chart */}
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

      {/* Budgets List */}
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
                          ₹{spent.toLocaleString("en-IN")} / ₹{budget.monthly_limit.toLocaleString("en-IN")}
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

      {/* Budget Dialog */}
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

## Page 2: Update AssetsLiabilities.tsx

Key changes for `src/pages/AssetsLiabilities.tsx`:

```typescript
import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFamily } from "@/contexts/FamilyContext";
import { useGoals, useCreateGoal, useDeleteGoal } from "@/hooks/useGoalQueries";
import { toast } from "@/components/ui/use-toast";

const AssetsLiabilities = () => {
  const { currentFamily } = useFamily();
  
  // Fetch goals from Supabase
  const { data: goals = [], isLoading } = useGoals(currentFamily?.id || null);
  const createMutation = useCreateGoal(currentFamily?.id || null);
  const deleteMutation = useDeleteGoal(currentFamily?.id || null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [selectedColor, setSelectedColor] = useState("#10B981");

  // Separate assets and liabilities
  // Asset: color green/yellow/purple (Gold/Silver/Real Estate)
  // Liability: color red/orange
  
  const assets = goals.filter(g => 
    !["Loan", "Taxes", "Debt"].some(type => g.name.includes(type))
  );
  
  const liabilities = goals.filter(g => 
    ["Loan", "Taxes", "Debt"].some(type => g.name.includes(type))
  );

  const handleCreateGoal = async () => {
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
        color: selectedColor,
      });

      toast({
        title: "Success",
        description: "Goal created successfully",
      });

      setIsDialogOpen(false);
      setGoalName("");
      setTargetAmount("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create goal",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGoal = async (id: string) => {
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
      {/* Page Header */}
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
              onClick={() => setIsDialogOpen(true)}
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
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="font-medium">{goal.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ₹{goal.current_amount.toLocaleString("en-IN")} / ₹{goal.target_amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteGoal(goal.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
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
              onClick={() => setIsDialogOpen(true)}
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
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="font-medium">{goal.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Outstanding: ₹{(goal.target_amount - goal.current_amount).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteGoal(goal.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No liabilities yet</p>
          )}
        </CardContent>
      </Card>

      {/* Dialog - similar to Transactions */}
      {/* Add AlertDialog here for creating goals */}
    </div>
  );
};

export default AssetsLiabilities;
```

---

## Summary: What to Change

### In `src/pages/Budgets.tsx`:
- Replace localStorage with `useBudgets()` hook
- Use `useCreateOrUpdateBudget()` for adding budgets
- Use `useDeleteBudget()` for deleting
- Fetch transactions with `useTransactionsByMonth()`

### In `src/pages/AssetsLiabilities.tsx`:
- Replace fake transaction data with `useGoals()`
- Use `useCreateGoal()` for creating goals
- Use `useDeleteGoal()` for deleting goals
- Map goals to asset/liability display

### In `src/pages/Dashboard.tsx`:
- Import `useTransactions()` instead of localStorage
- Show real family transaction data
- Display current family name

### In `src/pages/CalendarView.tsx`:
- Use `useTransactions()` to sync with Supabase
- Calendar dates now linked to real data

---

## ✅ Checklist for Completion

- [ ] Budgets.tsx updated with Supabase hooks
- [ ] AssetsLiabilities.tsx updated with useGoals
- [ ] Dashboard.tsx shows real transaction data
- [ ] All pages show `currentFamily` data
- [ ] Authentication flow working (register → family → dashboard)
- [ ] Data persists after refresh
- [ ] Delete operations work from all pages
- [ ] No more localStorage usage on dashboard pages
