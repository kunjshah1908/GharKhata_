import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const LandingNav = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="GharKhata" className="w-9 h-9 rounded-lg" />
            <span className="font-semibold text-lg text-foreground">GharKhata</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </nav>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">Sign In</Link>
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link to="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
