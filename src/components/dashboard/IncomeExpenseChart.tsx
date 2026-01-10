import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTransactionsByMonth } from "@/hooks/useTransactionQueries";

interface IncomeExpenseChartProps {
  transactions: any[];
  selectedMonth: number;
  selectedYear: number;
}

export const IncomeExpenseChart = ({ transactions, selectedMonth, selectedYear }: IncomeExpenseChartProps) => {
  // Generate data for the last 6 months
  const generateChartData = () => {
    const data = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (selectedMonth - i + 12) % 12;
      const year = selectedMonth - i < 0 ? selectedYear - 1 : selectedYear;

      // For current month, use the passed transactions
      // For previous months, we'd need to fetch them, but for now let's use current month data as placeholder
      // In a real app, you'd want to fetch all 6 months of data
      const monthIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const monthExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({
        month: months[monthIndex],
        income: monthIncome,
        expense: monthExpense,
      });
    }

    return data;
  };

  const data = generateChartData();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-card rounded-xl p-6 shadow-card"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Income vs Expenses
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(150, 15%, 90%)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(220, 10%, 45%)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(220, 10%, 45%)", fontSize: 12 }}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(150, 15%, 90%)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px hsl(220, 15%, 20%, 0.1)",
              }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground capitalize">
                  {value}
                </span>
              )}
            />
            <Bar
              dataKey="income"
              fill="hsl(152, 35%, 42%)"
              radius={[4, 4, 0, 0]}
              name="Income"
            />
            <Bar
              dataKey="expense"
              fill="hsl(215, 40%, 35%)"
              radius={[4, 4, 0, 0]}
              name="Expense"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};