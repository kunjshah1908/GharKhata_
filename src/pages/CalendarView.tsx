import { useState } from "react";
import CalendarComponent from "@/components/CalendarComponent";
import ExpenseList from "@/components/ExpenseList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Expense {
  description: string;
  amount: number;
  user: string;
}

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    
    // Mock data - In a real app, this would fetch from your backend/database
    const mockExpenses: Expense[] = [
      { description: "Groceries", amount: 2500, user: "Rajesh" },
      { description: "Utilities - Electricity", amount: 1800, user: "Priya" },
      { description: "Mobile Recharge", amount: 499, user: "Aarav" },
      { description: "Gas Cylinder", amount: 900, user: "Priya" },
      { description: "Restaurant Dinner", amount: 1200, user: "Family" },
    ];
    
    setExpenses(mockExpenses);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

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
              Choose a date to view expenses
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <CalendarComponent onDateChange={handleDateChange} />
          </CardContent>
        </Card>

        {/* Expense List Card */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>
              {formatDate(selectedDate)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseList expenses={expenses} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;
