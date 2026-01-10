import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";
import { useTransactionsByMonth } from "@/hooks/useTransactionQueries";
import { useBudgets } from "@/hooks/useBudgetQueries";
import { useGoals } from "@/hooks/useGoalQueries";
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SnapshotCard } from "@/components/dashboard/SnapshotCard";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { UpcomingObligations } from "@/components/dashboard/UpcomingObligations";
import { GoalProgress } from "@/components/dashboard/GoalProgress";
import { useState } from "react";

const Dashboard = () => {
  const { user } = useAuth();
  const { currentFamily } = useFamily();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: transactions = [], isLoading } = useTransactionsByMonth(
    currentFamily?.id || null,
    selectedMonth,
    selectedYear
  );

  // Get previous month data for trend calculations
  const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
  const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
  const { data: prevTransactions = [] } = useTransactionsByMonth(
    currentFamily?.id || null,
    prevMonth,
    prevYear
  );

  // Fetch budgets and goals from Supabase
  const { data: budgets = [] } = useBudgets(currentFamily?.id || null);
  const { data: goals = [] } = useGoals(currentFamily?.id || null);

  // Calculate totals from REAL Supabase data
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Calculate previous month totals
  const prevTotalIncome = prevTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const prevTotalExpense = prevTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const prevBalance = prevTotalIncome - prevTotalExpense;

  // Calculate trend percentages
  const incomeTrend = prevTotalIncome > 0 ? ((totalIncome - prevTotalIncome) / prevTotalIncome) * 100 : 0;
  const expenseTrend = prevTotalExpense > 0 ? ((totalExpense - prevTotalExpense) / prevTotalExpense) * 100 : 0;
  const balanceTrend = prevBalance !== 0 ? ((balance - prevBalance) / Math.abs(prevBalance)) * 100 : 0;
  const savingsTrend = prevBalance > 0 ? ((balance - prevBalance) / prevBalance) * 100 : 0;

  if (!currentFamily) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-lg">No family found</p>
          <p className="text-sm text-muted-foreground">Create a family to start tracking your finances</p>
          <Button onClick={() => window.location.href = '/dashboard/settings'} className="mt-4">
            Create Your First Family
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      )}
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Your family's financial overview at a glance
        </p>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SnapshotCard
          title="Current Balance"
          value={`₹${balance.toLocaleString("en-IN")}`}
          trend={balanceTrend >= 0 ? "up" : "down"}
          trendValue={`${balanceTrend >= 0 ? "+" : ""}${balanceTrend.toFixed(1)}%`}
          icon={<Wallet className="w-5 h-5" />}
          delay={0}
        />
        <SnapshotCard
          title="Total Income"
          value={`₹${totalIncome.toLocaleString("en-IN")}`}
          trend={incomeTrend >= 0 ? "up" : "down"}
          trendValue={`${incomeTrend >= 0 ? "+" : ""}${incomeTrend.toFixed(1)}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          delay={0.1}
        />
        <SnapshotCard
          title="Total Expenses"
          value={`₹${totalExpense.toLocaleString("en-IN")}`}
          trend={expenseTrend <= 0 ? "down" : "up"}
          trendValue={`${expenseTrend >= 0 ? "+" : ""}${expenseTrend.toFixed(1)}%`}
          icon={<TrendingDown className="w-5 h-5" />}
          delay={0.15}
        />
        <SnapshotCard
          title="Net Savings"
          value={`₹${(balance).toLocaleString("en-IN")}`}
          trend={savingsTrend >= 0 ? "up" : "down"}
          trendValue={`${savingsTrend >= 0 ? "+" : ""}${savingsTrend.toFixed(1)}%`}
          icon={<PiggyBank className="w-5 h-5" />}
          delay={0.2}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <IncomeExpenseChart transactions={transactions} selectedMonth={selectedMonth} selectedYear={selectedYear} />
        <ExpenseChart transactions={transactions} />
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <UpcomingObligations transactions={transactions} />
        <GoalProgress goals={goals} />
      </div>
    </div>
  );
};

export default Dashboard;