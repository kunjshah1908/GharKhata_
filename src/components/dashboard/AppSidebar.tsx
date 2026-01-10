import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  ArrowDownUp,
  TrendingUp,
  TrendingDown,
  Landmark,
  Target,
  PieChart,
  FileText,
  StickyNote,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const mainNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { title: "Transactions", href: "/dashboard/transactions", icon: ArrowDownUp },
  { title: "Assets & Liabilities", href: "/dashboard/assets", icon: Landmark },
  { title: "Budgets", href: "/dashboard/budgets", icon: PieChart },
  { title: "Goals", href: "/dashboard/goals", icon: Target },
  { title: "Reports", href: "/dashboard/reports", icon: FileText },
  { title: "Notes", href: "/dashboard/notes", icon: StickyNote },
];

const bottomNavItems = [
  { title: "Family Settings", href: "/dashboard/settings", icon: Settings },
];

export const AppSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-40"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <NavLink to="/" className="flex items-center gap-2 overflow-hidden">
          <div className="w-9 h-9 min-w-[36px] rounded-lg gradient-primary flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold text-foreground whitespace-nowrap"
            >
              FamilyFinance
            </motion.span>
          )}
        </NavLink>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-muted-foreground hover:text-foreground h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {mainNavItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive(item.href)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 min-w-[20px]",
                    isActive(item.href)
                      ? "text-sidebar-primary"
                      : "text-muted-foreground group-hover:text-sidebar-foreground"
                  )}
                />
                {!isCollapsed && (
                  <span className="text-sm whitespace-nowrap">{item.title}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="py-4 border-t border-sidebar-border">
        <ul className="px-3">
          {bottomNavItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive(item.href)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 min-w-[20px]",
                    isActive(item.href)
                      ? "text-sidebar-primary"
                      : "text-muted-foreground group-hover:text-sidebar-foreground"
                  )}
                />
                {!isCollapsed && (
                  <span className="text-sm whitespace-nowrap">{item.title}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </motion.aside>
  );
};