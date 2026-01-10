import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { FamilyProvider } from "@/contexts/FamilyContext";
import { useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CalendarView from "./pages/CalendarView";
import AssetsLiabilities from "./pages/AssetsLiabilities";
import Budgets from "./pages/Budgets";
import Transactions from "./pages/Transactions";
import Goals from "./pages/Goals";
import Reports from "./pages/Reports";
import Notes from "./pages/Notes";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AuthCallback from "./pages/AuthCallback";
import { DashboardLayout } from "./layouts/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={!user ? <Index /> : <Navigate to="/dashboard" replace />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
      <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" replace />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <FamilyProvider>
              <DashboardLayout />
            </FamilyProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="calendar" element={<CalendarView />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="assets" element={<AssetsLiabilities />} />
        <Route path="goals" element={<Goals />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notes" element={<Notes />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FamilyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </FamilyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
