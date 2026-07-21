"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface AuthTabsProps {
  children: React.ReactNode;
  defaultTab?: "login" | "register";
}

interface TabContextValue {
  activeTab: "login" | "register";
  setActiveTab: (tab: "login" | "register") => void;
}

import { createContext, useContext } from "react";

const TabContext = createContext<TabContextValue | null>(null);

export function useAuthTabs() {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("useAuthTabs must be used within AuthTabs");
  }
  return context;
}

export function AuthTabs({ children, defaultTab = "login" }: AuthTabsProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="w-full">
        {/* Tab buttons */}
        <div className="mb-6 flex rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={cn(
              "flex-1 rounded-xl py-2.5 text-xs font-bold transition-all duration-300",
              activeTab === "login"
                ? "bg-portal-mint text-[#07150f] shadow-[0_0_15px_rgba(112,245,193,0.3)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className={cn(
              "flex-1 rounded-xl py-2.5 text-xs font-bold transition-all duration-300",
              activeTab === "register"
                ? "bg-portal-mint text-[#07150f] shadow-[0_0_15px_rgba(112,245,193,0.3)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Create Account
          </button>
        </div>

        {/* Tab content */}
        {children}
      </div>
    </TabContext.Provider>
  );
}

interface TabContentProps {
  value: "login" | "register";
  children: React.ReactNode;
}

export function TabContent({ value, children }: TabContentProps) {
  const { activeTab } = useAuthTabs();

  if (activeTab !== value) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {children}
    </div>
  );
}
