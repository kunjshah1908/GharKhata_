import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Repeat, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  notes?: string;
  isRecurring: boolean;
  recurringDay?: number;
}

interface CategoryBudget {
  category: string;
  limit: number; // monthly limit in ₹
}

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
  const [familyBudget, setFamilyBudget] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartMode, setChartMode] = useState<"limits" | "spent">("limits");
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>(() => {
    const saved = localStorage.getItem("ff_category_budgets");
    if (saved) {
      try {
        return JSON.parse(saved) as CategoryBudget[];
      } catch {}
    }
    return expenseCategories.map((cat) => ({ category: cat, limit: 0 }));
  });

  // Persist category budgets
  useEffect(() => {
    try {
      localStorage.setItem("ff_category_budgets", JSON.stringify(categoryBudgets));
    } catch {}
  }, [categoryBudgets]);

  // Persist family budget
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ff_family_budget");
      if (saved) setFamilyBudget(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("ff_family_budget", familyBudget);
    } catch {}
  }, [familyBudget]);

  // Load transactions from localStorage
  const transactions: Transaction[] = useMemo(() => {
    try {
      const raw = localStorage.getItem("ff_transactions");
      if (!raw) return [];
      return JSON.parse(raw) as Transaction[];
    } catch {
      return [];
    }
  }, [selectedMonth, selectedYear]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  // Filter monthly expenses
  const monthlyExpenses = transactions.filter((t) => {
    const d = new Date(t.date);
    return t.type === "expense" && d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const totalSpent = monthlyExpenses.reduce((sum, t) => sum + t.amount, 0);
  const familyBudgetNumber = parseFloat(familyBudget) || 0;
  const overallPct = familyBudgetNumber > 0 ? Math.min(100, Math.round((totalSpent / familyBudgetNumber) * 100)) : 0;

  const spendByCategory = expenseCategories.map((cat) => {
    const spent = monthlyExpenses.filter((t) => t.category === cat).reduce((s, t) => s + t.amount, 0);
    const limit = categoryBudgets.find((b) => b.category === cat)?.limit || 0;
    const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
    const exceeded = limit > 0 && spent > limit;
    return { category: cat, spent, limit, pct, exceeded };
  });

  const updateCategoryLimit = (category: string, limitStr: string) => {
    const limit = parseFloat(limitStr) || 0;
    setCategoryBudgets((prev) => prev.map((b) => (b.category === category ? { ...b, limit } : b)));
  };

  // Pie chart data (division of budget)
  const chartColors = [
    "hsl(220, 70%, 50%)",
    "hsl(160, 60%, 45%)",
    "hsl(30, 80%, 55%)",
    "hsl(280, 65%, 60%)",
    "hsl(340, 75%, 55%)",
    "hsl(200, 65%, 55%)",
    "hsl(120, 55%, 45%)",
    "hsl(260, 50%, 55%)",
    "hsl(20, 75%, 60%)",
    "hsl(190, 50%, 50%)",
    "hsl(90, 50%, 45%)",
    "hsl(0, 60%, 50%)",
  ];

  const chartData = (chartMode === "limits"
    ? categoryBudgets
        .filter((b) => b.limit > 0)
        .map((b, i) => ({ name: b.category, value: b.limit, color: chartColors[i % chartColors.length] }))
    : expenseCategories
        .map((cat, i) => ({
          name: cat,
          value: monthlyExpenses.filter((t) => t.category === cat).reduce((s, t) => s + t.amount, 0),
          color: chartColors[i % chartColors.length],
        }))
        .filter((d) => d.value > 0)
  );

  const chartTotal = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Budgets</h1>
          <p className="text-muted-foreground">Set family and category budgets and track progress</p>
        </div>
        <div className="flex gap-4">
          <div className="w-40">
            <Label>Month</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {months.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <Label>Year</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Family Budget Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Family Monthly Budget</CardTitle>
          <CardDescription>Set a total budget and track overall spend</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="max-w-xs w-full">
              <Label htmlFor="familyBudget">Budget (₹)</Label>
              <Input id="familyBudget" type="number" placeholder="50000" value={familyBudget} onChange={(e) => setFamilyBudget(e.target.value)} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Spent</p>
                <p className="text-sm font-medium">₹{totalSpent.toLocaleString("en-IN")}</p>
              </div>
              <Progress value={overallPct} />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className={`text-xs font-medium ${totalSpent > familyBudgetNumber && familyBudgetNumber > 0 ? "text-red-600" : "text-muted-foreground"}`}>
                  {familyBudgetNumber > 0 ? `${overallPct}% of ₹${familyBudgetNumber.toLocaleString("en-IN")}` : "No budget set"}
                </p>
              </div>
              {familyBudgetNumber > 0 && totalSpent > familyBudgetNumber && (
                <div className="mt-2 flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Exceeded by ₹{(totalSpent - familyBudgetNumber).toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Distribution Pie Chart */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Budget Distribution</CardTitle>
              <CardDescription>
                {chartMode === "limits" ? "Share of category limits" : "Share of monthly spend"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={chartMode === "limits" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartMode("limits")}
              >
                Limits
              </Button>
              <Button
                variant={chartMode === "spent" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartMode("spent")}
              >
                Spent
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 && chartTotal > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(150, 15%, 90%)",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px hsl(220, 15%, 20%, 0.1)",
                    }}
                    formatter={(value: number, name: string) => [
                      chartTotal > 0 ? `${Math.round((value / chartTotal) * 100)}%` : "0%",
                      name,
                    ]}
                  />
                  <Legend
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-sm text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {chartMode === "limits"
                ? "Set category limits to see budget division"
                : "Add monthly expenses to see spending division"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Budgets */}
      <Card>
        <CardHeader>
          <CardTitle>Category Budgets</CardTitle>
          <CardDescription>Set limits per category; bars increase as expenses are added</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Spent</TableHead>
                <TableHead className="text-right">Limit</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spendByCategory.map(({ category, spent, limit, pct, exceeded }) => (
                <TableRow key={category}>
                  <TableCell className="font-medium">{category}</TableCell>
                  <TableCell className="text-right">₹{spent.toLocaleString("en-IN")}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      value={limit || ""}
                      placeholder="0"
                      onChange={(e) => updateCategoryLimit(category, e.target.value)}
                      className="w-28"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={pct} />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{limit > 0 ? `${pct}%` : "No limit"}</span>
                        {exceeded && <span className="text-red-600">Exceeded by ₹{(spent - limit).toLocaleString("en-IN")}</span>}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Insights</CardTitle>
          <CardDescription>Quick tips based on your spending</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            {spendByCategory
              .filter((c) => c.limit > 0)
              .sort((a, b) => b.spent / (b.limit || 1) - a.spent / (a.limit || 1))
              .slice(0, 3)
              .map((c) => (
                <li key={c.category}>
                  {c.category} is at {c.limit > 0 ? Math.min(100, Math.round((c.spent / c.limit) * 100)) : 0}% of its budget.
                  {c.exceeded ? " Consider increasing the limit or reducing spend." : " You're on track."}
                </li>
              ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Budgets;
