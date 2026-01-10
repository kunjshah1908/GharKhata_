// Test Authentication Flow - Paste this in Browser Console (F12)
// This helps verify if auth is working properly

console.log("🔍 Testing GharKhata Authentication...\n");

// Check Supabase Client
const testAuth = async () => {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("❌ Session Error:", sessionError);
      return;
    }
    
    if (!session) {
      console.log("ℹ️ No active session - user is logged out");
      console.log("👉 Try signing up or logging in");
      return;
    }
    
    console.log("✅ Active Session Found!");
    console.log("📧 Email:", session.user.email);
    console.log("🆔 User ID:", session.user.id);
    console.log("👤 Display Name:", session.user.user_metadata?.display_name);
    console.log("⏰ Session Expires:", new Date(session.expires_at * 1000).toLocaleString());
    
    // Check families
    console.log("\n🔍 Checking families...");
    const { data: members, error: membersError } = await supabase
      .from("family_members")
      .select("family_id, role")
      .eq("user_id", session.user.id);
    
    if (membersError) {
      console.error("❌ Error fetching family members:", membersError);
      return;
    }
    
    if (!members || members.length === 0) {
      console.log("⚠️ No families found for this user");
      console.log("👉 Go to Settings to create your first family");
      return;
    }
    
    console.log(`✅ Found ${members.length} family membership(s)`);
    
    for (const member of members) {
      const { data: family, error: familyError } = await supabase
        .from("families")
        .select("*")
        .eq("id", member.family_id)
        .single();
      
      if (family) {
        console.log(`\n👨‍👩‍👧‍👦 Family: ${family.name}`);
        console.log(`   Role: ${member.role}`);
        console.log(`   Currency: ${family.currency}`);
        console.log(`   Month starts on day: ${family.month_start_day}`);
      }
    }
    
    console.log("\n✅ Everything looks good! Your auth is working properly.");
    
  } catch (err) {
    console.error("❌ Unexpected Error:", err);
  }
};

// Check if supabase is available
if (typeof supabase === 'undefined') {
  console.error("❌ Supabase client not found!");
  console.log("Make sure you're on the app page and try again.");
} else {
  testAuth();
}
