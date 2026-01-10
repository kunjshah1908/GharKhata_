import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        if (type === "signup" || (accessToken && refreshToken)) {
          // Set the session
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken!,
            refresh_token: refreshToken!,
          });

          if (error) throw error;

          console.log("✅ Session set successfully:", data.session);
          console.log("✅ User authenticated:", data.user);

          // Verify session was actually stored
          const { data: verifyData } = await supabase.auth.getSession();
          console.log("✅ Session verified in storage:", verifyData.session);

          setStatus("success");
          setMessage("Email confirmed successfully! Redirecting...");
          
          // Wait 2 seconds then redirect to dashboard or family setup
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        } else {
          throw new Error("Invalid confirmation link");
        }
      } catch (err) {
        console.error("Email confirmation error:", err);
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Failed to confirm email");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">
            {status === "loading" && "Confirming Email..."}
            {status === "success" && "Email Confirmed!"}
            {status === "error" && "Confirmation Failed"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Please wait while we verify your email"}
            {status === "success" && "You can now use your account"}
            {status === "error" && "There was a problem confirming your email"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {status === "loading" && (
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
          )}
          {status === "success" && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500" />
              <p className="text-sm text-muted-foreground text-center">{message}</p>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 text-destructive" />
              <p className="text-sm text-muted-foreground text-center">{message}</p>
              <div className="space-y-2 w-full">
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full"
                >
                  Go to Sign In
                </Button>
                <Button
                  onClick={() => navigate("/register")}
                  variant="outline"
                  className="w-full"
                >
                  Back to Sign Up
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
