import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { signUp, error: authError } = useAuth();
  const { createFamily } = useFamily();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [step, setStep] = useState<"account" | "family" | "email-confirmation">("account");

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!email || !password || !confirmPassword || !displayName) {
      setLocalError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(email, password, displayName) as any;
      
      if (result?.requiresEmailConfirmation) {
        // Show email confirmation step
        setStep("email-confirmation");
      } else {
        // No email confirmation needed, proceed to family creation
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStep("family");
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFamilySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!familyName.trim()) {
      setLocalError("Please enter a family name");
      return;
    }

    setLoading(true);
    try {
      await createFamily(familyName.trim(), "INR", 1);
      toast({
        title: "Success!",
        description: "Your family has been created successfully",
      });
      // Wait for family context to update
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate("/dashboard");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create family";
      setLocalError(errorMsg);
      console.error("Family creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">
            {step === "account" 
              ? "Create Account" 
              : step === "email-confirmation" 
              ? "Check Your Email" 
              : "Set Up Family"}
          </CardTitle>
          <CardDescription>
            {step === "account"
              ? "Start tracking your family finances"
              : step === "email-confirmation"
              ? "We've sent you a confirmation link"
              : "Create your first family to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "account" ? (
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              {(authError || localError) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{authError || localError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label htmlFor="displayName" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Continue
              </Button>
            </form>
          ) : step === "email-confirmation" ? (
            <div className="space-y-4 text-center py-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  We've sent a confirmation email to:
                </p>
                <p className="font-medium">{email}</p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-left">
                  <strong>Next steps:</strong>
                  <ol className="list-decimal ml-4 mt-2 space-y-1">
                    <li>Check your email inbox</li>
                    <li>Click the confirmation link</li>
                    <li>Come back and sign in</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/login")}
                >
                  Go to Sign In
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or contact support.
              </p>
            </div>
          ) : (
            <form onSubmit={handleFamilySubmit} className="space-y-4">
              {localError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{localError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label htmlFor="familyName" className="text-sm font-medium">
                  Family Name
                </label>
                <Input
                  id="familyName"
                  type="text"
                  placeholder="The Doe Family"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <p className="text-sm text-muted-foreground">
                You can add more family members and families later.
              </p>

              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Family
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/dashboard")}
                  disabled={loading}
                >
                  Skip for Now
                </Button>
              </div>
            </form>
          )}

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
