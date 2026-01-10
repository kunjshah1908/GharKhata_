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

  const chartData = budgets.map((budget) => {
    const spent = getSpentByCategory(budget.category);
    return {
      name: budget.category,
      budget: budget.monthly_limit,
      spent: spent,
      remaining: Math.max(0, budget.monthly_limit - spent),
      overBudget: Math.max(0, spent - budget.monthly_limit),
    };
  });

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.monthly_limit, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + getSpentByCategory(budget.category), 0);

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
        <p className="text-muted-foreground">Plan and track your family's monthly budgets by category</p>
      </div>

      {/* Budget Summary Cards */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ₹{totalBudget.toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalSpent > totalBudget ? 'text-red-600' : 'text-green-600'}`}>
                ₹{totalSpent.toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalBudget - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{(totalBudget - totalSpent).toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalBudget > 0 && totalSpent / totalBudget > 1 ? 'text-red-600' : 'text-blue-600'}`}>
                {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                of monthly budget used
              </p>
            </CardContent>
          </Card>
        </div>
      )}

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
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Budget vs Spending Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Allocation</CardTitle>
              <CardDescription>Planned budget distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                  <Legend />
                  <Pie
                    data={chartData}
                    dataKey="budget"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"][index % 8]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Spending vs Budget Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Spending Overview</CardTitle>
              <CardDescription>Actual spending vs budget</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Total Budget</span>
                  <span className="font-semibold text-blue-600">₹{totalBudget.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Total Spent</span>
                  <span className={`font-semibold ${totalSpent > totalBudget ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{totalSpent.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Remaining</span>
                  <span className={`font-semibold ${totalBudget - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{(totalBudget - totalSpent).toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Budget Status Summary */}
                <div className="pt-2 border-t">
                  <h4 className="font-medium mb-2">Budget Status</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-green-50 rounded">
                      <div className="text-lg font-semibold text-green-600">
                        {budgets.filter(b => getSpentByCategory(b.category) < b.monthly_limit * 0.8).length}
                      </div>
                      <div className="text-xs text-green-700">Under Budget</div>
                    </div>
                    <div className="p-2 bg-yellow-50 rounded">
                      <div className="text-lg font-semibold text-yellow-600">
                        {budgets.filter(b => {
                          const spent = getSpentByCategory(b.category);
                          return spent >= b.monthly_limit * 0.8 && spent <= b.monthly_limit;
                        }).length}
                      </div>
                      <div className="text-xs text-yellow-700">On Track</div>
                    </div>
                    <div className="p-2 bg-red-50 rounded">
                      <div className="text-lg font-semibold text-red-600">
                        {budgets.filter(b => getSpentByCategory(b.category) > b.monthly_limit).length}
                      </div>
                      <div className="text-xs text-red-700">Over Budget</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Overall Progress</span>
                    <span>{totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%</span>
                  </div>
                  <Progress
                    value={totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0}
                    className="h-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
                const percentage = budget.monthly_limit > 0 ? (spent / budget.monthly_limit) * 100 : 0;
                const remaining = Math.max(0, budget.monthly_limit - spent);
                const overBudget = Math.max(0, spent - budget.monthly_limit);
                const isOverBudget = spent > budget.monthly_limit;
                const isUnderBudget = spent < budget.monthly_limit * 0.8; // Less than 80% used

                return (
                  <Card key={budget.id} className={`border-l-4 ${isOverBudget ? 'border-l-red-500' : isUnderBudget ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{budget.category}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-muted-foreground">
                              Spent: ₹{spent.toLocaleString("en-IN")}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Budget: ₹{budget.monthly_limit.toLocaleString("en-IN")}
                            </span>
                            <span className={`text-sm font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {remaining >= 0 ? 'Remaining' : 'Over'}: ₹{Math.abs(remaining).toLocaleString("en-IN")}
                            </span>
                          </div>
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

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className={`font-medium ${isOverBudget ? 'text-red-600' : isUnderBudget ? 'text-green-600' : 'text-yellow-600'}`}>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={Math.min(percentage, 100)}
                          className={`h-3 ${isOverBudget ? '[&>div]:bg-red-500' : isUnderBudget ? '[&>div]:bg-green-500' : '[&>div]:bg-yellow-500'}`}
                        />
                        {percentage > 100 && (
                          <Progress
                            value={((percentage - 100) / 100) * 100}
                            className="h-1 [&>div]:bg-red-500 mt-1"
                          />
                        )}
                      </div>

                      <div className="mt-3 p-3 rounded-lg bg-muted/30">
                        {isOverBudget ? (
                          <div className="flex items-center gap-2 text-red-600">
                            <span className="text-sm font-medium">⚠️ Over Budget</span>
                            <span className="text-sm">
                              You've exceeded your budget by ₹{overBudget.toLocaleString("en-IN")}
                            </span>
                          </div>
                        ) : isUnderBudget ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <span className="text-sm font-medium">✅ Under Budget</span>
                            <span className="text-sm">
                              Great job! You have ₹{remaining.toLocaleString("en-IN")} remaining
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-yellow-600">
                            <span className="text-sm font-medium">⚡ On Track</span>
                            <span className="text-sm">
                              You're using your budget appropriately with ₹{remaining.toLocaleString("en-IN")} left
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
