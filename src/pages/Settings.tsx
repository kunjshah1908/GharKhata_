import { useState } from "react";
import { Settings as SettingsIcon, Users, Plus, Trash2, Loader2, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Settings = () => {
  const { user } = useAuth();
  const { currentFamily, families, createFamily } = useFamily();
  const queryClient = useQueryClient();

  const [isCreateFamilyDialogOpen, setIsCreateFamilyDialogOpen] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState("");

  // Fetch family members
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["family-members", currentFamily?.id],
    queryFn: async () => {
      if (!currentFamily?.id) return [];
      const { data, error } = await supabase
        .from("family_members")
        .select(`
          id,
          role,
          user_profiles (
            id,
            display_name,
            email
          )
        `)
        .eq("family_id", currentFamily.id);

      if (error) throw error;
      return data;
    },
    enabled: !!currentFamily?.id,
  });

  const handleCreateFamily = async () => {
    if (!newFamilyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a family name",
        variant: "destructive",
      });
      return;
    }

    try {
      await createFamily(newFamilyName.trim(), "USD", 1);
      toast({
        title: "Success",
        description: "Family created successfully",
      });
      setIsCreateFamilyDialogOpen(false);
      setNewFamilyName("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create family",
        variant: "destructive",
      });
    }
  };

  if (!currentFamily) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
        <div className="text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Family Selected</h2>
          <p className="text-muted-foreground mb-6">
            Create a family to start managing your finances
          </p>
          <Button onClick={() => setIsCreateFamilyDialogOpen(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Create Family
          </Button>
        </div>

        {/* Create Family Dialog */}
        <AlertDialog open={isCreateFamilyDialogOpen} onOpenChange={setIsCreateFamilyDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create New Family</AlertDialogTitle>
              <AlertDialogDescription>
                Enter a name for your family group
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="familyName">Family Name</Label>
                <Input
                  id="familyName"
                  placeholder="e.g., The Sharmas, Smith Family"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                />
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleCreateFamily}>
                Create Family
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Family Settings</h1>
        <p className="text-muted-foreground">Manage your family and member settings</p>
      </div>

      {/* Current Family Info */}
      <Card>
        <CardHeader>
          <CardTitle>Family Information</CardTitle>
          <CardDescription>Details about your current family</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Family Name</Label>
            <p className="text-lg font-medium mt-1">{currentFamily.name}</p>
          </div>
          <div>
            <Label>Family ID</Label>
            <p className="text-sm text-muted-foreground mt-1 font-mono">{currentFamily.id}</p>
          </div>
        </CardContent>
      </Card>

      {/* All Families */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Families</CardTitle>
              <CardDescription>All families you belong to</CardDescription>
            </div>
            <Button onClick={() => setIsCreateFamilyDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Family
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {families.map((family) => (
              <div
                key={family.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  family.id === currentFamily.id ? "border-blue-500 bg-blue-50" : "border-border"
                }`}
              >
                <div>
                  <p className="font-medium">{family.name}</p>
                  {family.id === currentFamily.id && (
                    <p className="text-xs text-muted-foreground">Current Family</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Family Members */}
      <Card>
        <CardHeader>
          <CardTitle>Family Members</CardTitle>
          <CardDescription>People in {currentFamily.name}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              <p className="text-muted-foreground">Loading members...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {member.user_profiles?.display_name || member.user_profiles?.email || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{member.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                  {member.user_profiles?.id === user?.id && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">You</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Your personal account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <p className="text-sm mt-1">{user?.email}</p>
          </div>
          <div>
            <Label>User ID</Label>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{user?.id}</p>
          </div>
        </CardContent>
      </Card>

      {/* Create Family Dialog */}
      <AlertDialog open={isCreateFamilyDialogOpen} onOpenChange={setIsCreateFamilyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Family</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a name for your new family group
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="familyName">Family Name</Label>
              <Input
                id="familyName"
                placeholder="e.g., The Sharmas, Smith Family"
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateFamily}>
              <Plus className="w-4 h-4 mr-2" />
              Create Family
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
