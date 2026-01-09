import { Receipt } from "lucide-react";

interface Expense {
  description: string;
  amount: number;
  user: string;
}

interface ExpenseListProps {
  expenses: Expense[];
}

const ExpenseList = ({ expenses }: ExpenseListProps) => {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-4">
      {expenses.length > 0 ? (
        <>
          <div className="space-y-3">
            {expenses.map((expense, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">{expense.user}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">₹{expense.amount.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-lg font-bold text-foreground">₹{totalAmount.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <Receipt className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">No expenses for this date</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Select a different date to view expenses</p>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;