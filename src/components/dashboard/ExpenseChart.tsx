import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface ExpenseChartProps {
  transactions: any[];
}

export const ExpenseChart = ({ transactions }: ExpenseChartProps) => {
  // Calculate expense breakdown by category
  const generateExpenseData = () => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const categoryTotals: { [key: string]: number } = {};

    expenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

    const colors = [
      "hsl(152, 35%, 42%)",
      "hsl(215, 40%, 35%)",
      "hsl(175, 35%, 45%)",
      "hsl(38, 85%, 55%)",
      "hsl(280, 35%, 50%)",
      "hsl(220, 10%, 60%)",
      "hsl(320, 35%, 50%)",
      "hsl(60, 35%, 50%)",
    ];

    return Object.entries(categoryTotals).map(([category, amount], index) => ({
      name: category,
      value: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      color: colors[index % colors.length],
    }));
  };

  const expenseData = generateExpenseData();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-card rounded-xl p-6 shadow-card"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Expense Breakdown
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={expenseData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {expenseData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(150, 15%, 90%)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px hsl(220, 15%, 20%, 0.1)",
              }}
              formatter={(value: number) => [`${value}%`, ""]}
            />
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};