import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import Chatbot from "@/components/Chatbot";

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background flex w-full">
      <AppSidebar />
      <div className="flex-1 ml-[72px] md:ml-[260px] transition-all duration-200">
        <DashboardHeader />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
      <Chatbot />
    </div>
  );
};