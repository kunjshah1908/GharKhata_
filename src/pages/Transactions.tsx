import { useState, useEffect } from "react";
import { Plus, ArrowUpRight, ArrowDownLeft, Trash2, Repeat } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  notes?: string;
  isRecurring: boolean;
  recurringDay?: number; // Day of month for recurring transactions
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("ff_transactions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Transaction[];
        return parsed;
      } catch {
        // fall through to default seed
      }
    }
    return [
      {
        id: "1",
        type: "income",
        category: "Salary",
        amount: 50000,
        date: new Date(2026, 0, 5).toISOString(),
        isRecurring: true,
        recurringDay: 5,
      },
      {
        id: "2",
        type: "expense",
        category: "EMI",
        amount: 15000,
        date: new Date(2026, 0, 10).toISOString(),
        isRecurring: true,
        recurringDay: 10,
      },
      {
        id: "3",
        type: "expense",
        category: "Food",
        amount: 2500,
        date: new Date(2026, 0, 8).toISOString(),
        isRecurring: false,
      },
    ];
  });

  // Persist transactions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("ff_transactions", JSON.stringify(transactions));
    } catch {}
  }, [transactions]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const incomeCategories = [
    "Salary",
    "Business Income",
    "Investment Returns",
    "Rental Income",
    "Allowance",
    "Gifts",
    "Other Income",
  ];

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

  // Process recurring transactions
  useEffect(() => {
    const processRecurringTransactions = () => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const today = currentDate.getDate();

      const recurringTransactions = transactions.filter((t) => t.isRecurring);

      recurringTransactions.forEach((recurringTxn) => {
        if (!recurringTxn.recurringDay) return;

        const txnDate = new Date(recurringTxn.date);
        const txnMonth = txnDate.getMonth();
        const txnYear = txnDate.getFullYear();

        // Check if we need to create a new transaction for the current month
        const monthsToProcess = [];
        
        // Calculate months between the original transaction and now
        let checkMonth = txnMonth;
        let checkYear = txnYear;
        
        while (
          checkYear < currentYear ||
          (checkYear === currentYear && checkMonth <= currentMonth)
        ) {
          if (checkYear > txnYear || (checkYear === txnYear && checkMonth > txnMonth)) {
            monthsToProcess.push({ month: checkMonth, year: checkYear });
          }
          
          checkMonth++;
          if (checkMonth > 11) {
            checkMonth = 0;
            checkYear++;
          }
        }

        // Create transactions for missing months
        monthsToProcess.forEach(({ month, year }) => {
          const hasTransactionForMonth = transactions.some((t) => {
            const tDate = new Date(t.date);
            return (
              t.category === recurringTxn.category &&
              t.type === recurringTxn.type &&
              tDate.getMonth() === month &&
              tDate.getFullYear() === year
            );
          });

          if (!hasTransactionForMonth) {
            const newDate = new Date(year, month, recurringTxn.recurringDay);
            
            // Only add if the date has passed
            if (newDate <= currentDate) {
              const newTransaction: Transaction = {
                id: `${Date.now()}-${Math.random()}`,
                type: recurringTxn.type,
                category: recurringTxn.category,
                amount: recurringTxn.amount,
                date: newDate.toISOString(),
                isRecurring: true,
                recurringDay: recurringTxn.recurringDay,
                notes: recurringTxn.notes,
              };

              setTransactions((prev) => [...prev, newTransaction]);
            }
          }
        });
      });
    };

    processRecurringTransactions();
    
    // Run every day at midnight
    const interval = setInterval(processRecurringTransactions, 86400000);
    return () => clearInterval(interval);
  }, [transactions]);

  const openDialog = (type: "income" | "expense") => {
    setDialogType(type);
    setAmount("");
    setCategory("");
    setNotes("");
    setIsRecurring(false);
    setRecurringDay("");
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!amount || !category) return;
    if (isRecurring && !recurringDay) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: dialogType,
      category,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      notes: notes.trim() || undefined,
      isRecurring,
      recurringDay: isRecurring ? parseInt(recurringDay) : undefined,
    };

    setTransactions([newTransaction, ...transactions]);
    setIsDialogOpen(false);
    setAmount("");
    setCategory("");
    setNotes("");
    setIsRecurring(false);
    setRecurringDay("");
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  // Filter transactions by selected month and year
  const filteredTransactions = transactions.filter((t) => {
    const txnDate = new Date(t.date);
    return (
      txnDate.getMonth() === selectedMonth &&
      txnDate.getFullYear() === selectedYear
    );
  });

  // Sort by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get latest 5 transactions
  const latestTransactions = sortedTransactions.slice(0, 5);

  // Calculate totals
  const monthlyIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = monthlyIncome - monthlyExpenses;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">
            Track your income and expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => openDialog("income")}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Income
          </Button>
          <Button
            onClick={() => openDialog("expense")}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Month/Year Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Label>Month</Label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Year</Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              ₹{monthlyIncome.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              ₹{monthlyExpenses.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
              ₹{balance.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Latest 5 Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Transactions</CardTitle>
          <CardDescription>Your 5 most recent transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {latestTransactions.length > 0 ? (
              latestTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === "income"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {transaction.category}
                        </p>
                        {transaction.isRecurring && (
                          <Repeat className="w-4 h-4 text-blue-600" />
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            transaction.type === "income"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {transaction.type === "income" ? "Income" : "Expense"}
                        </span>
                      </div>
                      {transaction.notes && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {transaction.notes}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold ${
                          transaction.type === "income" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}₹
                        {transaction.amount.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTransaction(transaction.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet. Start by adding income or expenses.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            Complete list for {months[selectedMonth]} {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Income</TableHead>
                <TableHead className="text-right">Expense</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.length > 0 ? (
                (() => {
                  let runningBalance = 0;
                  return sortedTransactions.map((transaction) => {
                    if (transaction.type === "income") {
                      runningBalance += transaction.amount;
                    } else {
                      runningBalance -= transaction.amount;
                    }
                    
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(transaction.date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {transaction.category}
                            {transaction.isRecurring && (
                              <Repeat className="w-3 h-3 text-blue-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              transaction.type === "income"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {transaction.type === "income" ? "Income" : "Expense"}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {transaction.notes || "-"}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {transaction.type === "income"
                            ? `₹${transaction.amount.toLocaleString("en-IN")}`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          {transaction.type === "expense"
                            ? `₹${transaction.amount.toLocaleString("en-IN")}`
                            : "-"}
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${
                          runningBalance >= 0 ? "text-blue-600" : "text-red-600"
                        }`}>
                          ₹{runningBalance.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTransaction(transaction.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  });
                })()
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No transactions for this month
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Transaction Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Add {dialogType === "income" ? "Income" : "Expense"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Enter the details for your {dialogType === "income" ? "income" : "expense"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(dialogType === "income" ? incomeCategories : expenseCategories).map(
                    (cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Add notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
              />
              <Label htmlFor="recurring" className="cursor-pointer">
                Recurring monthly transaction
              </Label>
            </div>
            {isRecurring && (
              <div className="space-y-2">
                <Label htmlFor="recurringDay">Day of Month (1-31)</Label>
                <Input
                  id="recurringDay"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="15"
                  value={recurringDay}
                  onChange={(e) => setRecurringDay(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This transaction will automatically repeat on this day every month
                </p>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={!amount || !category || (isRecurring && !recurringDay)}
            >
              Add {dialogType === "income" ? "Income" : "Expense"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Transactions;
