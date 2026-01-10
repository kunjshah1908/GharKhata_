import { useState } from "react";
import CalendarComponent from "@/components/CalendarComponent";
import ExpenseList from "@/components/ExpenseList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFamily } from "@/contexts/FamilyContext";
import { useTransactions } from "@/hooks/useTransactionQueries";

const CalendarView = () => {
  const { currentFamily } = useFamily();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: allTransactions = [] } = useTransactions(currentFamily?.id || null);

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
            {getTransactionsForDate(selectedDate).length > 0 ? (
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
            ) : (
              <p className="text-center text-muted-foreground py-8">No transactions for this date</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;
