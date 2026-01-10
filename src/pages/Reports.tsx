import { useState } from "react";
import { FileText, Download, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFamily } from "@/contexts/FamilyContext";
import { useTransactions } from "@/hooks/useTransactionQueries";
import { useBudgets } from "@/hooks/useBudgetQueries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const Reports = () => {
  const { currentFamily } = useFamily();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: transactions = [] } = useTransactions(currentFamily?.id || null);
  const { data: budgets = [] } = useBudgets(currentFamily?.id || null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  // Filter transactions by month/year
  const monthlyTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const totalIncome = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;

  // Category-wise breakdown
  const expensesByCategory = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const handleExport = () => {
    const reportData = {
      family: currentFamily?.name,
      period: `${months[selectedMonth]} ${selectedYear}`,
      summary: {
        totalIncome,
        totalExpense,
        netSavings,
      },
      transactions: monthlyTransactions,
      budgets,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-report-${selectedYear}-${selectedMonth + 1}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Financial Reports</h1>
          <p className="text-muted-foreground">View and export your financial reports</p>
        </div>
        <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Period Selector */}
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
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardDescription>Total Income</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              ₹{totalIncome.toLocaleString("en-IN")}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total Expenses</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              ₹{totalExpense.toLocaleString("en-IN")}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Net Savings</CardDescription>
            <CardTitle className={`text-2xl ${netSavings >= 0 ? "text-blue-600" : "text-orange-600"}`}>
              ₹{netSavings.toLocaleString("en-IN")}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Top Spending Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Top Spending Categories</CardTitle>
          <CardDescription>
            {months[selectedMonth]} {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topCategories.length > 0 ? (
            <div className="space-y-4">
              {topCategories.map(([category, amount]) => {
                const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category}</span>
                      <span className="text-muted-foreground">
                        ₹{amount.toLocaleString("en-IN")} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No expenses for this period</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Last 10 transactions from selected period</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyTransactions.length > 0 ? (
            <div className="space-y-3">
              {monthlyTransactions.slice(0, 10).map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{txn.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(txn.date).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <p className={`font-semibold ${txn.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No transactions for this period</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
