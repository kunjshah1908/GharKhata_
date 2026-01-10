import { motion } from "framer-motion";
import { Target, Plane, GraduationCap, Car, Home, PiggyBank } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface GoalProgressProps {
  goals: any[];
}

export const GoalProgress = ({ goals }: GoalProgressProps) => {
  const getIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('vacation') || lowerTitle.includes('trip')) return Plane;
    if (lowerTitle.includes('education') || lowerTitle.includes('school')) return GraduationCap;
    if (lowerTitle.includes('car')) return Car;
    if (lowerTitle.includes('house') || lowerTitle.includes('home')) return Home;
    if (lowerTitle.includes('emergency') || lowerTitle.includes('fund')) return PiggyBank;
    return Target;
  };

  const getColor = (index: number) => {
    const colors = ["bg-primary", "bg-accent", "bg-secondary", "bg-warning"];
    return colors[index % colors.length];
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="bg-card rounded-xl p-6 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Goal Progress</h3>
        <span className="text-sm text-muted-foreground">{goals.length} active goals</span>
      </div>

      <div className="space-y-4">
        {goals.length > 0 ? goals.map((goal, index) => {
          const percentage = Math.round((goal.current_amount / goal.target_amount) * 100);
          const IconComponent = getIcon(goal.name);
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              className="cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {goal.name}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {percentage}%
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground tabular-nums">
                  ₹{(goal.current_amount / 1000).toFixed(0)}k
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  ₹{(goal.target_amount / 1000).toFixed(0)}k
                </span>
              </div>
            </motion.div>
          );
        }) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No goals set yet</p>
            <p className="text-sm text-muted-foreground">Create your first goal to start tracking progress</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};