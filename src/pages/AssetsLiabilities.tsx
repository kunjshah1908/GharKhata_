import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Label } from "@/components/ui/label";
import { useFamily } from "@/contexts/FamilyContext";
import { useGoals, useCreateGoal, useDeleteGoal, useUpdateGoal } from "@/hooks/useGoalQueries";
import { toast } from "@/components/ui/use-toast";

const AssetsLiabilities = () => {
  const { currentFamily } = useFamily();

  const { data: goals = [], isLoading } = useGoals(currentFamily?.id || null);
  const createMutation = useCreateGoal(currentFamily?.id || null);
  const deleteMutation = useDeleteGoal(currentFamily?.id || null);
  const updateMutation = useUpdateGoal(currentFamily?.id || null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"asset" | "liability">("asset");
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");

  // Separate assets and liabilities based on naming convention
  const assets = goals.filter(
    (g) => !["Loan", "Taxes", "Debt", "Liability"].some((type) => g.name.includes(type))
  );

  const liabilities = goals.filter(
    (g) => ["Loan", "Taxes", "Debt", "Liability"].some((type) => g.name.includes(type))
  );

  const openDialog = (type: "asset" | "liability") => {
    setDialogType(type);
    setGoalName("");
    setTargetAmount("");
    setCurrentAmount("0");
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
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

      setIsDialogOpen(false);
      setGoalName("");
      setTargetAmount("");
      setCurrentAmount("0");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create goal",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
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

  if (!currentFamily) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please select or create a family first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Assets & Liabilities</h1>
        <p className="text-muted-foreground">Track your family's assets and liabilities</p>
      </div>

      {/* Assets Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assets</CardTitle>
              <CardDescription>Manage your family's assets</CardDescription>
            </div>
            <Button
              onClick={() => openDialog("asset")}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : assets.length > 0 ? (
            <div className="space-y-3">
              {assets.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{goal.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{goal.current_amount.toLocaleString("en-IN")} / ₹
                        {goal.target_amount.toLocaleString("en-IN")}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (goal.current_amount / goal.target_amount) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(goal.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No assets yet</p>
          )}
        </CardContent>
      </Card>

      {/* Liabilities Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liabilities</CardTitle>
              <CardDescription>Track your family's liabilities</CardDescription>
            </div>
            <Button
              onClick={() => openDialog("liability")}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Liability
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : liabilities.length > 0 ? (
            <div className="space-y-3">
              {liabilities.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{goal.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Outstanding: ₹{(goal.target_amount - goal.current_amount).toLocaleString("en-IN")}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (goal.current_amount / goal.target_amount) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(goal.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No liabilities yet</p>
          )}
        </CardContent>
      </Card>

      {/* Add Goal Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogType === "asset" ? "Add Asset" : "Add Liability"}
            </AlertDialogTitle>
            <AlertDialogDescription>Enter the details below</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder={dialogType === "asset" ? "Gold, Real Estate..." : "Loan, Debt..."}
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">Total Amount (₹)</Label>
              <Input
                id="target"
                type="number"
                placeholder="100000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create {dialogType === "asset" ? "Asset" : "Liability"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AssetsLiabilities;
