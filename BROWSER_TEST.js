// TEST: Check what user context Supabase sees from the client
// This needs to be run from the BROWSER console, not SQL Editor

// INSTRUCTIONS:
// 1. Go to http://localhost:8082/dashboard/settings
// 2. Press F12 to open DevTools
// 3. Go to Console tab
// 4. Copy and paste this ENTIRE code block
// 5. Press Enter
// 6. Share all the output

(async () => {
  console.log("=== SUPABASE AUTH TEST ===");
  
  // Access the global supabase client through window
  // It should be available from the React context
  const supabaseModule = window.__supabase_test_client;
  
  if (!supabaseModule) {
    console.log("Setting up test access to supabase client...");
    // We need to access it through the React DevTools or by looking at network requests
    
    // Let's try to get the session from localStorage
    const storageKey = Object.keys(localStorage).find(key => key.includes('supabase.auth.token'));
    console.log("1. Storage key found:", storageKey);
    
    if (storageKey) {
      const sessionData = JSON.parse(localStorage.getItem(storageKey));
      console.log("2. Session from localStorage:", sessionData);
      console.log("   Access token (first 50 chars):", sessionData?.access_token?.substring(0, 50));
      console.log("   User ID:", sessionData?.user?.id);
      console.log("   User email:", sessionData?.user?.email);
    }
    
    console.log("\n3. Let me try to make a direct API call:");
    
    // Get session data
    const sessionDataStr = localStorage.getItem(storageKey);
    const sessionData = JSON.parse(sessionDataStr);
    
    if (sessionData?.access_token) {
      // Try direct fetch to Supabase
      const response = await fetch('https://btlzvrkjzvugdtrysppz.supabase.co/rest/v1/families', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0bHp2cmtqenZ1Z2R0cnlzcHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjAwNTIsImV4cCI6MjA4MzU5NjA1Mn0.PvbfVEMpkWsTpeJPD7X5k0oisgdFrT7v-BWtfJZLfkI',
          'Authorization': `Bearer ${sessionData.access_token}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          name: 'Test via Direct Fetch',
          currency: 'USD',
          month_start_day: 1
        })
      });
      
      console.log("   Response status:", response.status);
      console.log("   Response status text:", response.statusText);
      
      const result = await response.json();
      console.log("   Response body:", result);
      
      if (response.ok) {
        console.log("✅ SUCCESS! Family created via direct fetch!");
      } else {
        console.log("❌ FAILED! Error:", result);
      }
    }
  }
})();
