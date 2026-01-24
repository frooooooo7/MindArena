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
        <div className="flex mb-6 p-1 bg-muted/50 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={cn(
              "flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200",
              activeTab === "login"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className={cn(
              "flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200",
              activeTab === "register"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Sign Up
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
