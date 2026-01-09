import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
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

interface Transaction {
  id: string;
  type: "buy" | "sell" | "add" | "pay";
  category: string;
  amount: number;
  date: string;
  section: "asset" | "liability";
  notes?: string;
}

const AssetsLiabilities = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "buy",
      category: "Gold",
      amount: 50000,
      date: new Date(2026, 0, 5).toISOString(),
      section: "asset",
    },
    {
      id: "2",
      type: "sell",
      category: "Silver",
      amount: 25000,
      date: new Date(2026, 0, 7).toISOString(),
      section: "asset",
    },
    {
      id: "3",
      type: "add",
      category: "Loan",
      amount: 100000,
      date: new Date(2026, 0, 3).toISOString(),
      section: "liability",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"buy" | "sell" | "add" | "pay">("buy");
  const [dialogSection, setDialogSection] = useState<"asset" | "liability">("asset");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");

  const assetCategories = ["Gold", "Silver", "Real Estate"];
  const liabilityCategories = ["Loan", "Taxes"];

  const openDialog = (type: "buy" | "sell" | "add" | "pay", section: "asset" | "liability") => {
    setDialogType(type);
    setDialogSection(section);
    setAmount("");
    setCategory("");
    setNotes("");
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!amount || !category) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: dialogType,
      category,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      section: dialogSection,
      notes: notes.trim() || undefined,
    };

    setTransactions([newTransaction, ...transactions]);
    setIsDialogOpen(false);
    setAmount("");
    setCategory("");
    setNotes("");
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  // Calculate totals
  const assetTransactions = transactions.filter((t) => t.section === "asset");
  const liabilityTransactions = transactions.filter((t) => t.section === "liability");

  const totalAssetsBought = assetTransactions
    .filter((t) => t.type === "buy")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalAssetsSold = assetTransactions
    .filter((t) => t.type === "sell")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalLiabilitiesAdded = liabilityTransactions
    .filter((t) => t.type === "add")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalLiabilitiesPaid = liabilityTransactions
    .filter((t) => t.type === "pay")
    .reduce((sum, t) => sum + t.amount, 0);

  const netAssets = totalAssetsBought - totalAssetsSold;
  const netLiabilities = totalLiabilitiesAdded - totalLiabilitiesPaid;

  // Calculate category-wise totals for assets
  const getCategoryTotals = (cat: string) => {
    const categoryTransactions = assetTransactions.filter((t) => t.category === cat);
    const bought = categoryTransactions
      .filter((t) => t.type === "buy")
      .reduce((sum, t) => sum + t.amount, 0);
    const sold = categoryTransactions
      .filter((t) => t.type === "sell")
      .reduce((sum, t) => sum + t.amount, 0);
    return { bought, sold, net: bought - sold };
  };

  const goldTotals = getCategoryTotals("Gold");
  const silverTotals = getCategoryTotals("Silver");
  const realEstateTotals = getCategoryTotals("Real Estate");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "buy": return "Bought";
      case "sell": return "Sold";
      case "add": return "Added";
      case "pay": return "Paid";
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Assets & Liabilities</h1>
        <p className="text-muted-foreground">
          Track your family's assets and liabilities
        </p>
      </div>

      {/* Assets Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assets</CardTitle>
              <CardDescription>Manage your family's assets</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => openDialog("buy", "asset")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Buy Asset
              </Button>
              <Button
                onClick={() => openDialog("sell", "asset")}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Sell Asset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Asset Transactions */}
          <div className="space-y-3 mb-6">
            {assetTransactions.length > 0 ? (
              assetTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === "buy" 
                        ? "bg-green-100 text-green-600" 
                        : "bg-red-100 text-red-600"
                    }`}>
                      {transaction.type === "buy" ? (
                        <TrendingDown className="w-5 h-5" />
                      ) : (
                        <TrendingUp className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {getTransactionLabel(transaction.type)} {transaction.category}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          transaction.type === "buy"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {transaction.type === "buy" ? "Purchase" : "Sale"}
                        </span>
                      </div>
                      {transaction.notes && (
                        <p className="text-sm text-foreground mt-0.5">
                          {transaction.notes}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${
                        transaction.type === "buy" ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.type === "buy" ? "-" : "+"}₹{transaction.amount.toLocaleString("en-IN")}
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
                No asset transactions yet. Start by buying or selling an asset.
              </div>
            )}
          </div>

          {/* Asset Summary */}
          <div className="space-y-6 pt-4 border-t border-border">
            {/* Overall Totals */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Overall Totals</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <p className="text-sm text-muted-foreground mb-1">Total Bought</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{totalAssetsBought.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <p className="text-sm text-muted-foreground mb-1">Total Sold</p>
                  <p className="text-2xl font-bold text-red-600">
                    ₹{totalAssetsSold.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <p className="text-sm text-muted-foreground mb-1">Net Assets</p>
                  <p className={`text-2xl font-bold ${netAssets >= 0 ? "text-blue-600" : "text-red-600"}`}>
                    ₹{netAssets.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            {/* Gold Totals */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                Gold
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                  <p className="text-xs text-muted-foreground mb-1">Bought</p>
                  <p className="text-xl font-semibold text-green-600">
                    ₹{goldTotals.bought.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                  <p className="text-xs text-muted-foreground mb-1">Sold</p>
                  <p className="text-xl font-semibold text-red-600">
                    ₹{goldTotals.sold.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
                  <p className="text-xs text-muted-foreground mb-1">Net</p>
                  <p className={`text-xl font-semibold ${goldTotals.net >= 0 ? "text-yellow-600" : "text-red-600"}`}>
                    ₹{goldTotals.net.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            {/* Silver Totals */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                Silver
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                  <p className="text-xs text-muted-foreground mb-1">Bought</p>
                  <p className="text-xl font-semibold text-green-600">
                    ₹{silverTotals.bought.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                  <p className="text-xs text-muted-foreground mb-1">Sold</p>
                  <p className="text-xl font-semibold text-red-600">
                    ₹{silverTotals.sold.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-900">
                  <p className="text-xs text-muted-foreground mb-1">Net</p>
                  <p className={`text-xl font-semibold ${silverTotals.net >= 0 ? "text-gray-600" : "text-red-600"}`}>
                    ₹{silverTotals.net.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            {/* Real Estate Totals */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Real Estate
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                  <p className="text-xs text-muted-foreground mb-1">Bought</p>
                  <p className="text-xl font-semibold text-green-600">
                    ₹{realEstateTotals.bought.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                  <p className="text-xs text-muted-foreground mb-1">Sold</p>
                  <p className="text-xl font-semibold text-red-600">
                    ₹{realEstateTotals.sold.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
                  <p className="text-xs text-muted-foreground mb-1">Net</p>
                  <p className={`text-xl font-semibold ${realEstateTotals.net >= 0 ? "text-purple-600" : "text-red-600"}`}>
                    ₹{realEstateTotals.net.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          </div>
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
            <div className="flex gap-2">
              <Button
                onClick={() => openDialog("add", "liability")}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Liability
              </Button>
              <Button
                onClick={() => openDialog("pay", "liability")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Pay Liability
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Liability Transactions */}
          <div className="space-y-3 mb-6">
            {liabilityTransactions.length > 0 ? (
              liabilityTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === "add" 
                        ? "bg-red-100 text-red-600" 
                        : "bg-green-100 text-green-600"
                    }`}>
                      {transaction.type === "add" ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {getTransactionLabel(transaction.type)} {transaction.category}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          transaction.type === "add"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {transaction.type === "add" ? "New" : "Payment"}
                                              {transaction.notes && (
                                                <p className="text-sm text-foreground mt-0.5">
                                                  {transaction.notes}
                                                </p>
                                              )}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${
                        transaction.type === "add" ? "text-red-600" : "text-green-600"
                      }`}>
                        {transaction.type === "add" ? "+" : "-"}₹{transaction.amount.toLocaleString("en-IN")}
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
                No liability transactions yet. Start by adding a liability.
              </div>
            )}
          </div>

          {/* Liability Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
              <p className="text-sm text-muted-foreground mb-1">Total Added</p>
              <p className="text-2xl font-bold text-red-600">
                ₹{totalLiabilitiesAdded.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
              <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{totalLiabilitiesPaid.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <p className="text-sm text-muted-foreground mb-1">Outstanding</p>
              <p className={`text-2xl font-bold ${netLiabilities > 0 ? "text-orange-600" : "text-green-600"}`}>
                ₹{netLiabilities.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogType === "buy" && "Buy Asset"}
              {dialogType === "sell" && "Sell Asset"}
              {dialogType === "add" && "Add Liability"}
              {dialogType === "pay" && "Pay Liability"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Enter the transaction details below
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (₹)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(dialogSection === "asset" ? assetCategories : liabilityCategories).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Notes (Optional)</label>
                          <Input
                            type="text"
                            placeholder="Add a note for this transaction"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                        </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AssetsLiabilities;
