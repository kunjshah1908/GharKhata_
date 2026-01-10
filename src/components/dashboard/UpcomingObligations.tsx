import { motion } from "framer-motion";
import { CreditCard, Home, Repeat, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpcomingObligationsProps {
  transactions: any[];
}

export const UpcomingObligations = ({ transactions }: UpcomingObligationsProps) => {
  // Get upcoming recurring transactions for this month
  const getUpcomingObligations = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const recurringTransactions = transactions.filter((t) =>
      t.type === "expense" && t.is_recurring
    );

    // Sort by amount (highest first) and take top 4
    return recurringTransactions
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4)
      .map((transaction, index) => {
        const getIcon = () => {
          const category = transaction.category.toLowerCase();
          if (category.includes('loan') || category.includes('emi')) return Home;
          if (category.includes('card') || category.includes('credit')) return CreditCard;
          if (category.includes('subscription') || category.includes('netflix') || category.includes('amazon')) return Repeat;
          return CalendarDays;
        };

        const getType = () => {
          const category = transaction.category.toLowerCase();
          if (category.includes('loan') || category.includes('emi')) return 'emi';
          if (category.includes('card') || category.includes('credit')) return 'credit';
          if (category.includes('subscription')) return 'subscription';
          return 'insurance';
        };

        return {
          id: transaction.id,
          title: transaction.category,
          amount: `₹${transaction.amount.toLocaleString('en-IN')}`,
          dueDate: `Recurring ${transaction.recurring_frequency}`,
          type: getType(),
          icon: getIcon(),
        };
      });
  };

  const obligations = getUpcomingObligations();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-card rounded-xl p-6 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Upcoming Obligations
        </h3>
        <span className="text-sm text-muted-foreground">This month</span>
      </div>

      <div className="space-y-3">
        {obligations.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
          >
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              item.type === "emi" && "bg-primary/10 text-primary",
              item.type === "credit" && "bg-secondary/10 text-secondary",
              item.type === "subscription" && "bg-accent/10 text-accent",
              item.type === "insurance" && "bg-warning/10 text-warning"
            )}>
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground">{item.dueDate}</p>
            </div>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {item.amount}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};