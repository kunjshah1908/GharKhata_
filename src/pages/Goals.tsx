import { useState } from "react";
import { Plus, Target, TrendingUp, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { useFamily } from "@/contexts/FamilyContext";
import { useGoals, useCreateGoal, useDeleteGoal, useAddGoalContribution } from "@/hooks/useGoalQueries";
import { toast } from "@/components/ui/use-toast";

const Goals = () => {
  const { currentFamily } = useFamily();
  const { data: allGoals = [], isLoading } = useGoals(currentFamily?.id || null);
  const createMutation = useCreateGoal(currentFamily?.id || null);
  const deleteMutation = useDeleteGoal(currentFamily?.id || null);
  const contributeMutation = useAddGoalContribution();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isContributeDialogOpen, setIsContributeDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");

  // Filter out assets and liabilities - only show actual financial goals
  const goals = allGoals.filter((g) => {
    const name = g.name;
    // Exclude assets (Gold, Silver, Real Estate) and liabilities
    const isAsset = name.startsWith("Gold|") || name.startsWith("Silver|") || name.startsWith("Real Estate|");
    const isLiability = name.startsWith("Liability|") || ["Loan", "Taxes", "Debt"].some((type) => name.includes(type));
    return !isAsset && !isLiability;
  });

  const handleCreateGoal = async () => {
    if (!goalName || !targetAmount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: goalName,
        target_amount: parseFloat(targetAmount),
      });

      toast({
        title: "Success",
        description: "Goal created successfully",
      });

      setIsCreateDialogOpen(false);
      setGoalName("");
      setTargetAmount("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create goal",
        variant: "destructive",
      });
    }
  };

  const handleAddContribution = async () => {
    if (!contributionAmount || !selectedGoal) {
      toast({
        title: "Error",
        description: "Please enter a contribution amount",
        variant: "destructive",
      });
      return;
    }

    try {
      await contributeMutation.mutateAsync({
        goalId: selectedGoal,
        amount: parseFloat(contributionAmount),
        date: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Contribution added successfully",
      });

      setIsContributeDialogOpen(false);
      setSelectedGoal(null);
      setContributionAmount("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add contribution",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Success",
        description: "Goal deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  const openContributeDialog = (goal: any) => {
    setSelectedGoal(goal);
    setContributionAmount("");
    setIsContributeDialogOpen(true);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Financial Goals</h1>
          <p className="text-muted-foreground">Set and track your family's financial goals</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 mr-2 animate-spin" />
          <p className="text-muted-foreground">Loading goals...</p>
        </div>
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const isComplete = goal.current_amount >= goal.target_amount;

            return (
              <Card key={goal.id} className={isComplete ? "border-green-500" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGoal(goal.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-600" />
                    </Button>
                  </div>
                  <CardDescription>
                    {isComplete ? "Goal Achieved! 🎉" : `${Math.round(progress)}% Complete`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium">
                        ₹{goal.current_amount.toLocaleString("en-IN")} / ₹{goal.target_amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2" />
                  </div>

                  <Button
                    onClick={() => openContributeDialog(goal)}
                    className="w-full"
                    variant={isComplete ? "outline" : "default"}
                    disabled={isComplete}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {isComplete ? "Completed" : "Add Contribution"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No Goals Yet</p>
            <p className="text-muted-foreground text-center mb-4">
              Start by creating your first financial goal
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Goal Dialog */}
      <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Set a financial goal for your family to work towards
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goalName">Goal Name</Label>
              <Input
                id="goalName"
                placeholder="e.g., Family Vacation, New Car, Emergency Fund"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount (₹)</Label>
              <Input
                id="targetAmount"
                type="number"
                placeholder="100000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateGoal} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Goal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Contribution Dialog */}
      <AlertDialog open={isContributeDialogOpen} onOpenChange={setIsContributeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Contribution</AlertDialogTitle>
            <AlertDialogDescription>
              Add money towards "{selectedGoal?.name}"
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contributionAmount">Contribution Amount (₹)</Label>
              <Input
                id="contributionAmount"
                type="number"
                placeholder="5000"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
              />
            </div>

            {selectedGoal && (
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground mb-1">Current Progress</p>
                <p className="text-lg font-semibold">
                  ₹{selectedGoal.current_amount.toLocaleString("en-IN")} / ₹
                  {selectedGoal.target_amount.toLocaleString("en-IN")}
                </p>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddContribution} disabled={contributeMutation.isPending}>
              {contributeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Contribution
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Goals;
