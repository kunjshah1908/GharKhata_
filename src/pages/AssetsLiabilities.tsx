import { useState, useMemo, useEffect } from "react";
import { Plus, TrendingUp, TrendingDown, Trash2, Loader2, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  const [assetType, setAssetType] = useState("");
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [selectedGrams, setSelectedGrams] = useState("5");
  
  // Sell dialog states
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [sellAssetType, setSellAssetType] = useState("");
  const [sellGrams, setSellGrams] = useState("");
  const [sellPrice, setSellPrice] = useState("");

  // Reset selectedGrams when asset type changes
  useEffect(() => {
    if (assetType === "Gold") {
      setSelectedGrams("5");
    } else if (assetType === "Silver") {
      setSelectedGrams("500");
    }
  }, [assetType]);

  // Separate assets and liabilities based on naming convention
  // Assets are only Gold, Silver, and Real Estate entries
  const assets = goals.filter(
    (g) => g.name.startsWith("Gold|") || g.name.startsWith("Silver|") || g.name.startsWith("Real Estate|")
  );

  const liabilities = goals.filter(
    (g) => g.name.startsWith("Liability|") || ["Loan", "Taxes", "Debt"].some((type) => g.name.includes(type))
  );

  // Calculate gold and silver statistics
  const goldStats = useMemo(() => {
    const goldAssets = assets.filter(a => a.name.startsWith("Gold|"));
    let totalGrams = 0;
    let purchasedValue = 0;
    let soldGrams = 0;
    let soldValue = 0;
    let count = 0;

    goldAssets.forEach(asset => {
      const parts = asset.name.split("|");
      if (parts.length === 4 && parts[3] !== "SOLD") {
        // Buying transaction: Gold|10g|5000|2026-01-10
        const grams = parseInt(parts[1]);
        const pricePerGram = parseFloat(parts[2]);
        totalGrams += grams;
        purchasedValue += pricePerGram * grams;
        count++;
      } else if (parts.length === 5 && parts[3] === "SOLD") {
        // Sold transaction: Gold|10g|5000|SOLD|2026-01-10
        const grams = parseInt(parts[1]);
        const soldPricePerGram = parseFloat(parts[2]);
        soldGrams += grams;
        soldValue += soldPricePerGram * grams;
      }
    });

    const availableGrams = totalGrams - soldGrams;
    const avgPurchasePrice = totalGrams > 0 ? purchasedValue / totalGrams : 0;
    const totalProfit = soldValue - (avgPurchasePrice * soldGrams);

    return {
      totalGrams: availableGrams,
      purchasedGrams: totalGrams,
      soldGrams,
      averagePricePerGram: avgPurchasePrice,
      totalValue: purchasedValue,
      soldValue,
      totalProfit
    };
  }, [assets]);

  const silverStats = useMemo(() => {
    const silverAssets = assets.filter(a => a.name.startsWith("Silver|"));
    let totalGrams = 0;
    let purchasedValue = 0;
    let soldGrams = 0;
    let soldValue = 0;
    let count = 0;

    silverAssets.forEach(asset => {
      const parts = asset.name.split("|");
      if (parts.length === 4 && parts[3] !== "SOLD") {
        // Buying transaction: Silver|500g|100|2026-01-10
        const grams = parseInt(parts[1]);
        const pricePerGram = parseFloat(parts[2]);
        totalGrams += grams;
        purchasedValue += pricePerGram * grams;
        count++;
      } else if (parts.length === 5 && parts[3] === "SOLD") {
        // Sold transaction
        const grams = parseInt(parts[1]);
        const soldPricePerGram = parseFloat(parts[2]);
        soldGrams += grams;
        soldValue += soldPricePerGram * grams;
      }
    });

    const availableGrams = totalGrams - soldGrams;
    const avgPurchasePrice = totalGrams > 0 ? purchasedValue / totalGrams : 0;
    const totalProfit = soldValue - (avgPurchasePrice * soldGrams);

    return {
      totalGrams: availableGrams,
      purchasedGrams: totalGrams,
      soldGrams,
      averagePricePerGram: avgPurchasePrice,
      totalValue: purchasedValue,
      soldValue,
      totalProfit
    };
  }, [assets]);

  // Helper function to format asset display
  const formatAssetName = (name: string) => {
    const parts = name.split("|");
    if (parts.length === 5 && parts[3] === "SOLD") {
      // Sold: Gold|10g|5000|SOLD|2026-01-10
      const date = new Date(parts[4]).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      return `${parts[0]} - ${parts[1]} (SOLD) - ${date}`;
    }
    if (parts.length === 4 && parts[3] !== "SOLD") {
      // Bought: Gold|10g|5000|2026-01-10
      const date = new Date(parts[3]).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      return `${parts[0]} - ${parts[1]} - ${date}`;
    }
    if (parts.length === 3) {
      // Old format without date
      return `${parts[0]} - ${parts[1]}`;
    }
    if (parts.length === 2 && parts[0] === "Liability") {
      return parts[1];
    }
    if (parts.length === 2 && parts[0] === "Real Estate") {
      const date = new Date(parts[1]).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      return `Real Estate - ${date}`;
    }
    return name;
  };

  const getAssetValue = (asset: any) => {
    const parts = asset.name.split("|");
    if (parts.length >= 3) {
      return asset.target_amount;
    }
    return asset.current_amount;
  };

  const openDialog = (type: "asset" | "liability") => {
    setDialogType(type);
    setAssetType("");
    setGoalName("");
    setTargetAmount("");
    setCurrentAmount("0");
    setSelectedGrams("5"); // Default for gold, will change when silver is selected
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (dialogType === "asset" && !assetType) {
      toast({
        title: "Error",
        description: "Please select an asset type",
        variant: "destructive",
      });
      return;
    }

    if (dialogType === "liability" && !goalName) {
      toast({
        title: "Error",
        description: "Please enter a name",
        variant: "destructive",
      });
      return;
    }

    if (!targetAmount) {
      toast({
        title: "Error",
        description: "Please enter an amount",
        variant: "destructive",
      });
      return;
    }

    try {
      let finalName = dialogType === "asset" ? assetType : goalName;
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // For Gold and Silver, append grams data to the name
      if (dialogType === "asset" && (assetType === "Gold" || assetType === "Silver")) {
        const grams = parseInt(selectedGrams);
        const pricePerGram = parseFloat(targetAmount) / grams;
        finalName = `${assetType}|${grams}g|${pricePerGram.toFixed(2)}|${currentDate}`;
      } else if (dialogType === "asset" && assetType === "Real Estate") {
        finalName = `Real Estate|${currentDate}`;
      }
      
      // For liabilities, add Liability prefix
      if (dialogType === "liability") {
        finalName = `Liability|${goalName}`;
      }

      await createMutation.mutateAsync({
        name: finalName,
        target_amount: parseFloat(targetAmount),
      });

      toast({
        title: "Success",
        description: `${dialogType === "asset" ? "Asset" : "Liability"} added successfully`,
      });

      setIsDialogOpen(false);
      setAssetType("");
      setGoalName("");
      setTargetAmount("");
      setCurrentAmount("0");
      setSelectedGrams("5");
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

  const openSellDialog = () => {
    setSellAssetType("");
    setSellGrams("");
    setSellPrice("");
    setIsSellDialogOpen(true);
  };

  const handleSellAsset = async () => {
    if (!sellAssetType || !sellPrice) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if ((sellAssetType === "Gold" || sellAssetType === "Silver") && !sellGrams) {
      toast({
        title: "Error",
        description: "Please enter the grams to sell",
        variant: "destructive",
      });
      return;
    }

    try {
      const gramsToSell = parseInt(sellGrams || "0");
      let pricePerGram = 0;
      let totalSellingPrice = 0;
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (sellAssetType === "Gold") {
        // Price given is per 10g
        const pricePer10g = parseFloat(sellPrice);
        pricePerGram = pricePer10g / 10;
        totalSellingPrice = pricePerGram * gramsToSell;
        
        // Create sold transaction
        const soldName = `Gold|${gramsToSell}g|${pricePerGram.toFixed(2)}|SOLD|${currentDate}`;
        await createMutation.mutateAsync({
          name: soldName,
          target_amount: totalSellingPrice,
        });
        
      } else if (sellAssetType === "Silver") {
        // Price given is per 1kg (1000g)
        const pricePerKg = parseFloat(sellPrice);
        pricePerGram = pricePerKg / 1000;
        totalSellingPrice = pricePerGram * gramsToSell;
        
        // Create sold transaction
        const soldName = `Silver|${gramsToSell}g|${pricePerGram.toFixed(2)}|SOLD|${currentDate}`;
        await createMutation.mutateAsync({
          name: soldName,
          target_amount: totalSellingPrice,
        });
        
      } else if (sellAssetType === "Real Estate") {
        totalSellingPrice = parseFloat(sellPrice);
        // Find real estate asset
        const realEstateAsset = assets.find(a => a.name === "Real Estate");
        if (realEstateAsset) {
          await deleteMutation.mutateAsync(realEstateAsset.id);
        }
      }

      const avgPrice = sellAssetType === "Gold" ? goldStats.averagePricePerGram : silverStats.averagePricePerGram;
      const profit = (pricePerGram - avgPrice) * gramsToSell;

      const profitText = profit >= 0 
        ? `Profit: ₹${profit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
        : `Loss: ₹${Math.abs(profit).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

      toast({
        title: "Asset Sold Successfully!",
        description: `${sellAssetType} ${gramsToSell}g sold for ₹${totalSellingPrice.toLocaleString("en-IN")}. ${profitText}`,
      });

      setIsSellDialogOpen(false);
      setSellAssetType("");
      setSellGrams("");
      setSellPrice("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sell asset",
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
            <div className="flex gap-2">
              <Button
                onClick={openSellDialog}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Sell Asset
              </Button>
              <Button
                onClick={() => openDialog("asset")}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            </div>
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
                      <p className="font-medium">{formatAssetName(goal.name)}</p>
                      <p className="text-sm text-muted-foreground">
                        Value: ₹{getAssetValue(goal).toLocaleString("en-IN")}
                      </p>
                      {goal.name.includes("|") && (() => {
                        const parts = goal.name.split("|");
                        if ((parts.length === 4 && parts[3] !== "SOLD") || (parts.length === 5 && parts[3] === "SOLD")) {
                          return (
                            <p className="text-xs text-muted-foreground">
                              Price per gram: ₹{parseFloat(parts[2]).toFixed(2)}
                            </p>
                          );
                        } else if (parts.length === 3) {
                          return (
                            <p className="text-xs text-muted-foreground">
                              Price per gram: ₹{parseFloat(parts[2]).toFixed(2)}
                            </p>
                          );
                        }
                        return null;
                      })()}
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
          
          {/* Gold and Silver Statistics - Always Show */}
          <div className="mt-6 pt-6 border-t space-y-3">
            {/* Gold Stats */}
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-yellow-900">Gold Holdings</p>
                  <p className="text-2xl font-bold text-yellow-700">{goldStats.totalGrams}g</p>
                  <p className="text-xs text-yellow-600">Available</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-yellow-800">Average Price/gram</p>
                  <p className="text-xl font-semibold text-yellow-700">
                    ₹{goldStats.averagePricePerGram.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-yellow-800">Current Value</p>
                  <p className="text-xl font-semibold text-yellow-700">
                    ₹{(goldStats.totalGrams * goldStats.averagePricePerGram).toLocaleString("en-IN")}
                  </p>
                </div>
                {goldStats.soldGrams > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-yellow-800">Total Profit</p>
                    <p className={`text-xl font-semibold ${goldStats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{goldStats.totalProfit.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Silver Stats */}
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Silver Holdings</p>
                  <p className="text-2xl font-bold text-gray-700">{silverStats.totalGrams}g</p>
                  <p className="text-xs text-gray-600">Available</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-800">Average Price/kg</p>
                  <p className="text-xl font-semibold text-gray-700">
                    ₹{(silverStats.averagePricePerGram * 1000).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-800">Current Value</p>
                  <p className="text-xl font-semibold text-gray-700">
                    ₹{(silverStats.totalGrams * silverStats.averagePricePerGram).toLocaleString("en-IN")}
                  </p>
                </div>
                {silverStats.soldGrams > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-800">Total Profit</p>
                    <p className={`text-xl font-semibold ${silverStats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{silverStats.totalProfit.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
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
                      <p className="font-medium">{formatAssetName(goal.name)}</p>
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
            {dialogType === "asset" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="assetType">Asset Type</Label>
                  <Select value={assetType} onValueChange={setAssetType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gold">Gold</SelectItem>
                      <SelectItem value="Silver">Silver</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(assetType === "Gold" || assetType === "Silver") && (
                  <div className="space-y-2">
                    <Label>Weight</Label>
                    <RadioGroup 
                      value={selectedGrams} 
                      onValueChange={setSelectedGrams}
                    >
                      {assetType === "Gold" ? (
                        <>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="5" id="5g" />
                            <Label htmlFor="5g" className="cursor-pointer">5g</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="10" id="10g" />
                            <Label htmlFor="10g" className="cursor-pointer">10g</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="20" id="20g" />
                            <Label htmlFor="20g" className="cursor-pointer">20g</Label>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="500" id="500g" />
                            <Label htmlFor="500g" className="cursor-pointer">500 grams</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="1000" id="1kg" />
                            <Label htmlFor="1kg" className="cursor-pointer">1 kilogram</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="2000" id="2kg" />
                            <Label htmlFor="2kg" className="cursor-pointer">2 kilograms</Label>
                          </div>
                        </>
                      )}
                    </RadioGroup>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="target">
                    {assetType === "Gold" || assetType === "Silver" 
                      ? `Total Amount for ${selectedGrams}g (₹)` 
                      : "Total Amount (₹)"}
                  </Label>
                  <Input
                    id="target"
                    type="number"
                    placeholder="100000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                  />
                  {(assetType === "Gold" || assetType === "Silver") && targetAmount && (
                    <p className="text-sm text-muted-foreground">
                      Price per gram: ₹{(parseFloat(targetAmount) / parseInt(selectedGrams)).toFixed(2)}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Loan, Debt..."
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
              </>
            )}
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

      {/* Sell Asset Dialog */}
      <AlertDialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sell Asset</AlertDialogTitle>
            <AlertDialogDescription>Enter the details of the asset you want to sell</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sellAssetType">What to Sell?</Label>
              <Select value={sellAssetType} onValueChange={setSellAssetType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select asset to sell" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Real Estate">Real Estate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(sellAssetType === "Gold" || sellAssetType === "Silver") && (
              <div className="space-y-2">
                <Label htmlFor="sellGrams">How much to sell? (in grams)</Label>
                <Input
                  id="sellGrams"
                  type="number"
                  placeholder={sellAssetType === "Gold" ? "e.g., 10" : "e.g., 500"}
                  value={sellGrams}
                  onChange={(e) => setSellGrams(e.target.value)}
                />
                {sellAssetType === "Gold" && (
                  <p className="text-xs text-muted-foreground">
                    Available: {goldStats.totalGrams}g | Average: ₹{goldStats.averagePricePerGram.toFixed(2)}/g
                  </p>
                )}
                {sellAssetType === "Silver" && (
                  <p className="text-xs text-muted-foreground">
                    Available: {silverStats.totalGrams}g | Average: ₹{silverStats.averagePricePerGram.toFixed(2)}/g
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="sellPrice">
                {sellAssetType === "Gold" 
                  ? "Selling Price per 10g (₹)"
                  : sellAssetType === "Silver"
                  ? "Selling Price per 1 kilogram (₹)"
                  : "Selling Price (₹)"}
              </Label>
              <Input
                id="sellPrice"
                type="number"
                placeholder={sellAssetType === "Gold" ? "e.g., 70000 (per 10g)" : sellAssetType === "Silver" ? "e.g., 80000 (per kg)" : "Enter amount"}
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
              />
              {sellAssetType === "Gold" && sellGrams && sellPrice && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Selling at: ₹{(parseFloat(sellPrice) / 10).toFixed(2)}/g
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Amount: ₹{((parseFloat(sellPrice) / 10) * parseInt(sellGrams)).toLocaleString("en-IN")}
                  </p>
                  <p className={`text-sm font-semibold ${
                    (parseFloat(sellPrice) / 10) >= goldStats.averagePricePerGram 
                      ? "text-green-600" 
                      : "text-red-600"
                  }`}>
                    Expected {(parseFloat(sellPrice) / 10) >= goldStats.averagePricePerGram ? "Profit" : "Loss"}: 
                    ₹{Math.abs((((parseFloat(sellPrice) / 10) - goldStats.averagePricePerGram) * parseInt(sellGrams))).toFixed(2)}
                  </p>
                </div>
              )}
              {sellAssetType === "Silver" && sellGrams && sellPrice && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Selling at: ₹{(parseFloat(sellPrice)).toFixed(2)}/kg (₹{(parseFloat(sellPrice) / 1000).toFixed(2)}/g)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Amount: ₹{((parseFloat(sellPrice) / 1000) * parseInt(sellGrams)).toLocaleString("en-IN")}
                  </p>
                  <p className={`text-sm font-semibold ${
                    (parseFloat(sellPrice) / 1000) >= silverStats.averagePricePerGram 
                      ? "text-green-600" 
                      : "text-red-600"
                  }`}>
                    Expected {(parseFloat(sellPrice) / 1000) >= silverStats.averagePricePerGram ? "Profit" : "Loss"}: 
                    ₹{Math.abs(((parseFloat(sellPrice) / 1000) - silverStats.averagePricePerGram) * parseInt(sellGrams)).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSellAsset} 
              disabled={deleteMutation.isPending || updateMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {(deleteMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Sell Asset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AssetsLiabilities;
