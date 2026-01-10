import { useState } from "react";
import CalendarComponent from "@/components/CalendarComponent";
import ExpenseList from "@/components/ExpenseList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFamily } from "@/contexts/FamilyContext";
import { useTransactions } from "@/hooks/useTransactionQueries";
import { useGoals } from "@/hooks/useGoalQueries";
import { TrendingUp, TrendingDown } from "lucide-react";

const CalendarView = () => {
  const { currentFamily } = useFamily();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: allTransactions = [] } = useTransactions(currentFamily?.id || null);
  const { data: goals = [] } = useGoals(currentFamily?.id || null);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Filter transactions for selected date
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

  // Get asset transactions for selected date
  const getAssetTransactionsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return goals.filter(goal => {
      const parts = goal.name.split("|");
      // Check if it's an asset transaction with date
      if (parts.length === 4 && parts[3] === dateString) {
        // Buying: Gold|10g|5000|2026-01-10
        return true;
      } else if (parts.length === 5 && parts[3] === "SOLD" && parts[4] === dateString) {
        // Selling: Gold|10g|5000|SOLD|2026-01-10
        return true;
      }
      return false;
    });
  };

  const formatAssetTransaction = (goal: any) => {
    const parts = goal.name.split("|");
    if (parts.length === 5 && parts[3] === "SOLD") {
      // Sold transaction
      return {
        type: "sold",
        asset: parts[0],
        quantity: parts[1],
        pricePerGram: parseFloat(parts[2]),
        amount: goal.target_amount
      };
    } else if (parts.length === 4) {
      // Bought transaction
      return {
        type: "bought",
        asset: parts[0],
        quantity: parts[1],
        pricePerGram: parseFloat(parts[2]),
        amount: goal.target_amount
      };
    }
    return null;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
        <h1 className="text-2xl font-semibold text-foreground">Calendar & Expenses</h1>
        <p className="text-muted-foreground">
          View and track expenses by date
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calendar Card */}
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>
              Choose a date to view transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <CalendarComponent onDateChange={handleDateChange} />
          </CardContent>
        </Card>

        {/* Transactions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              {formatDate(selectedDate)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Asset Transactions */}
            {getAssetTransactionsForDate(selectedDate).length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Asset Transactions</h3>
                <div className="space-y-2">
                  {getAssetTransactionsForDate(selectedDate).map((goal) => {
                    const txn = formatAssetTransaction(goal);
                    if (!txn) return null;
                    
                    return (
                      <div key={goal.id} className={`flex items-center justify-between p-3 rounded-lg ${
                        txn.type === "bought" ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"
                      }`}>
                        <div className="flex items-center gap-3">
                          {txn.type === "bought" ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-orange-600" />
                          )}
                          <div>
                            <p className="font-medium">
                              {txn.type === "bought" ? "Bought" : "Sold"} {txn.asset}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {txn.quantity} @ ₹{txn.pricePerGram.toFixed(2)}/g
                            </p>
                          </div>
                        </div>
                        <p className={`font-semibold ${txn.type === "bought" ? "text-green-600" : "text-orange-600"}`}>
                          {txn.type === "bought" ? "-" : "+"}₹{txn.amount.toLocaleString("en-IN")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Regular Transactions */}
            {getTransactionsForDate(selectedDate).length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Regular Transactions</h3>
                <div className="space-y-3">
                  {getTransactionsForDate(selectedDate).map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{txn.category}</p>
                        <p className="text-xs text-muted-foreground">{txn.type}</p>
                      </div>
                      <p className={`font-semibold ${txn.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : getAssetTransactionsForDate(selectedDate).length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No transactions for this date</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;
