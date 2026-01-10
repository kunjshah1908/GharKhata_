import { useState } from "react";
import { Plus, ArrowUpRight, ArrowDownLeft, Trash2, Loader2 } from "lucide-react";
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
import { useFamily } from "@/contexts/FamilyContext";
import {
  useTransactionsByMonth,
  useCreateTransaction,
  useDeleteTransaction,
} from "@/hooks/useTransactionQueries";
import { toast } from "@/components/ui/use-toast";

const Transactions = () => {
  const { currentFamily } = useFamily();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: transactions = [], isLoading } = useTransactionsByMonth(
    currentFamily?.id || null,
    selectedMonth,
    selectedYear
  );

  const createMutation = useCreateTransaction(currentFamily?.id || null);
  const deleteMutation = useDeleteTransaction(currentFamily?.id || null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("monthly");

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

  const openDialog = (type: "income" | "expense") => {
    setDialogType(type);
    setAmount("");
    setCategory("");
    setDescription("");
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setIsRecurring(false);
    setRecurringFrequency("monthly");
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!amount || !category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        type: dialogType,
        category,
        amount: parseFloat(amount),
        description: description || undefined,
        date: selectedDate,
        is_recurring: isRecurring,
        recurring_frequency: isRecurring ? recurringFrequency : undefined,
      });

      toast({
        title: "Success",
        description: "Transaction created successfully",
      });

      setIsDialogOpen(false);
      setAmount("");
      setCategory("");
      setDescription("");
      setSelectedDate(new Date().toISOString().split("T")[0]);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create transaction",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const net = totalIncome - totalExpense;

  const incomeTxns = transactions.filter((t) => t.type === "income");
  const expenseTxns = transactions.filter((t) => t.type === "expense");

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
        <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
        <p className="text-muted-foreground">Track your family's income and expenses</p>
      </div>

      {/* Month and Year Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="month" className="text-sm font-medium mb-2 block">
                Month
              </Label>
              <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                <SelectTrigger id="month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="year" className="text-sm font-medium mb-2 block">
                Year
              </Label>
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
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
            <div className="flex gap-2">
              <Button onClick={() => openDialog("income")} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Income
              </Button>
              <Button onClick={() => openDialog("expense")} className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{totalIncome.toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{totalExpense.toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Net</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${net >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₹{net.toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Income</CardTitle>
          <CardDescription>
            {incomeTxns.length} transaction{incomeTxns.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : incomeTxns.length > 0 ? (
            <div className="space-y-2">
              {incomeTxns.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <ArrowDownLeft className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{txn.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(txn.date).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-semibold text-green-600">
                      +₹{txn.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(txn.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No income transactions yet</p>
          )}
        </CardContent>
      </Card>

      {/* Expense Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
          <CardDescription>
            {expenseTxns.length} transaction{expenseTxns.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : expenseTxns.length > 0 ? (
            <div className="space-y-2">
              {expenseTxns.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{txn.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(txn.date).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-semibold text-red-600">
                      -₹{txn.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(txn.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No expense transactions yet</p>
          )}
        </CardContent>
      </Card>

      {/* Transaction Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogType === "income" ? "Add Income" : "Add Expense"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Enter the transaction details below
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Amount (₹)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category
              </Label>
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
              <Label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Input
                id="description"
                type="text"
                placeholder="Add a note..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
              />
              <Label htmlFor="recurring" className="text-sm font-medium cursor-pointer">
                Recurring
              </Label>
            </div>

            {isRecurring && (
              <div className="space-y-2">
                <Label htmlFor="frequency" className="text-sm font-medium">
                  Frequency
                </Label>
                <Select value={recurringFrequency} onValueChange={(v) => setRecurringFrequency(v as any)}>
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Transaction
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Transactions;
