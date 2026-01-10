import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string | null;
  name: string;
  avatar_url: string | null;
  role: "financial_manager" | "member";
  is_active: boolean;
}

interface Family {
  id: string;
  name: string;
  currency: string;
  month_start_day: number;
  created_at: string;
  updated_at: string;
}

interface FamilyContextType {
  families: Family[];
  currentFamily: Family | null;
  currentMember: FamilyMember | null;
  loading: boolean;
  error: string | null;
  setCurrentFamily: (family: Family) => void;
  createFamily: (name: string, currency: string, monthStartDay: number) => Promise<Family>;
  fetchFamilies: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session } = useAuth();
  const [families, setFamilies] = useState<Family[]>([]);
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  const [currentMember, setCurrentMember] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch families and set current family
  const fetchFamilies = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get all families where user is a member
      const { data: members, error: membersError } = await supabase
        .from("family_members")
        .select("family_id")
        .eq("user_id", user.id);

      if (membersError) throw membersError;

      if (!members || members.length === 0) {
        setFamilies([]);
        setCurrentFamily(null);
        setCurrentMember(null);
        setLoading(false);
        return;
      }

      const familyIds = members.map((m) => m.family_id);

      // Fetch family details
      const { data: familiesData, error: familiesError } = await supabase
        .from("families")
        .select("*")
        .in("id", familyIds);

      if (familiesError) throw familiesError;

      setFamilies(familiesData || []);

      // Set current family to the first one (or stored preference)
      if (familiesData && familiesData.length > 0) {
        const saved = localStorage.getItem("currentFamilyId");
        const family =
          familiesData.find((f) => f.id === saved) || familiesData[0];
        setCurrentFamily(family);

        // Get current member details
        const { data: member, error: memberError } = await supabase
          .from("family_members")
          .select("*")
          .eq("family_id", family.id)
          .eq("user_id", user.id)
          .single();

        if (memberError && memberError.code !== "PGRST116") throw memberError;
        if (member) {
          setCurrentMember(member);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch families";
      setError(message);
      console.error("Error fetching families:", err);
    } finally {
      setLoading(false);
    }
  };

  const createFamily = async (
    name: string,
    currency: string,
    monthStartDay: number
  ): Promise<Family> => {
    console.log("🔵 === CREATE FAMILY DEBUG START ===");
    console.log("🔵 Step 0: Checking authentication");
    console.log("🔵 User:", user);
    console.log("🔵 Session:", session);
    
    if (!user) {
      console.error("❌ User is not authenticated", { user, session });
      throw new Error("User not authenticated. Please sign in again.");
    }

    console.log("✅ User authenticated:", user.id);
    console.log("🔵 Step 1: Creating family with name:", name);

    try {
      // Create family
      const { data: family, error: familyError } = await supabase
        .from("families")
        .insert({
          name,
          currency,
          month_start_day: monthStartDay,
        })
        .select()
        .single();

      if (familyError) {
        console.error("❌ FAMILY CREATION FAILED:", familyError);
        console.error("❌ Error code:", familyError.code);
        console.error("❌ Error message:", familyError.message);
        console.error("❌ Error details:", familyError.details);
        throw familyError;
      }
      
      if (!family) {
        console.error("❌ No family returned from database");
        throw new Error("Failed to create family");
      }

      console.log("✅ Family created successfully!");
      console.log("✅ Family ID:", family.id);
      console.log("✅ Family name:", family.name);

      console.log("🔵 Step 2: Adding user as financial manager");
      
      // Add user as financial manager
      const memberData = {
        family_id: family.id,
        user_id: user.id,
        name: user.user_metadata?.display_name || user.email?.split("@")[0] || "You",
        role: "financial_manager" as const,
        is_active: true,
      };

      console.log("🔵 Member data to insert:", memberData);

      const { data: member, error: memberError } = await supabase
        .from("family_members")
        .insert(memberData)
        .select()
        .single();

      if (memberError) {
        console.error("❌ MEMBER CREATION FAILED:", memberError);
        console.error("❌ Error code:", memberError.code);
        console.error("❌ Error message:", memberError.message);
        console.error("❌ Error details:", memberError.details);
        console.error("❌ Error hint:", memberError.hint);
        console.error("❌ Tried to insert:", memberData);
        
        console.log("🔵 Cleaning up: Deleting family...");
        // Try to clean up the family if member creation failed
        await supabase.from("families").delete().eq("id", family.id);
        console.log("✅ Family cleanup complete");
        
        // Provide more specific error message
        if (memberError.code === '42501' || memberError.message.includes('policy') || memberError.message.includes('permission')) {
          throw new Error(`Database permission denied. Please run the SQL fix: FIX_FAMILY_CREATION.sql`);
        }
        
        throw new Error(`Failed to add you to the family: ${memberError.message}`);
      }

      console.log("✅ Family member created successfully!");
      console.log("✅ Member ID:", member?.id);
      console.log("✅ Member role:", member?.role);

      console.log("🔵 Step 3: Refreshing families list...");
      
      // Refresh families list
      await fetchFamilies();
      
      console.log("✅ Families refreshed!");
      console.log("🔵 === CREATE FAMILY DEBUG END ===");
      
      return family;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create family";
      console.error("❌ === CREATE FAMILY FAILED ===");
      console.error("❌ Final error:", err);
      console.error("❌ Error message:", message);
      setError(message);
      throw err;
    }
  };

  const handleSetCurrentFamily = (family: Family) => {
    setCurrentFamily(family);
    localStorage.setItem("currentFamilyId", family.id);
  };

  // Fetch families when user changes
  useEffect(() => {
    if (user) {
      fetchFamilies();
    }
  }, [user]);

  return (
    <FamilyContext.Provider
      value={{
        families,
        currentFamily,
        currentMember,
        loading,
        error,
        setCurrentFamily: handleSetCurrentFamily,
        createFamily,
        fetchFamilies,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error("useFamily must be used within FamilyProvider");
  }
  return context;
};
