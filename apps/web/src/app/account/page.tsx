"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Navbar } from "@/components/navbar";
import { BackgroundGradients } from "@/components/home";
import { ProfileHeader } from "@/components/account/profile-header";
import { StatsCards } from "@/components/account/stats-cards";
import { AccountSettings } from "@/components/account/account-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, BarChart3, Trophy } from "lucide-react";

export default function AccountPage() {
    const { isAuthenticated, user, isHydrated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (isHydrated && !isAuthenticated) {
            router.push("/auth");
        }
    }, [isAuthenticated, isHydrated, router]);

    if (!isHydrated || !isAuthenticated) {
        return null; // Or a loading spinner
    }

    return (
        <div className="relative min-h-screen bg-background">
            <BackgroundGradients />
            <Navbar />

            <main className="container relative mx-auto px-4 py-8 md:px-8 max-w-6xl">
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header Section */}
                    <div className="flex flex-col gap-6">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                            <p className="text-muted-foreground mt-1">
                                Manage your profile, view your stats and update security settings.
                            </p>
                        </div>
                        
                        <ProfileHeader user={user!} />
                    </div>

                    {/* Main Content Tabs */}
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="bg-secondary/20 p-1 border border-border/40 mb-6">
                            <TabsTrigger value="overview" className="gap-2">
                                <User className="h-4 w-4" />
                                <span className="hidden sm:inline">Overview</span>
                            </TabsTrigger>
                            <TabsTrigger value="stats" className="gap-2">
                                <BarChart3 className="h-4 w-4" />
                                <span className="hidden sm:inline">Statistics</span>
                            </TabsTrigger>
                            <TabsTrigger value="achievements" className="gap-2">
                                <Trophy className="h-4 w-4" />
                                <span className="hidden sm:inline">Achievements</span>
                            </TabsTrigger>
                            <TabsTrigger value="security" className="gap-2">
                                <Shield className="h-4 w-4" />
                                <span className="hidden sm:inline">Security</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <StatsCards />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <AccountSettings user={user!} />
                                {/* Quick Actions Placeholder */}
                                <div className="p-6 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm">
                                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border/40 group">
                                            <Trophy className="h-6 w-6 text-violet-500 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-medium">Daily Challenge</span>
                                        </button>
                                        <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border/40 group">
                                            <BarChart3 className="h-6 w-6 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-medium">View Global Ranking</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="stats">
                            <div className="p-12 text-center rounded-2xl border border-dashed border-border/60 bg-secondary/5">
                                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                <h3 className="text-xl font-semibold mb-2">Detailed Statistics Coming Soon</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    We are working on advanced analytical charts to help you track your memory progress over time.
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="achievements">
                             <div className="p-12 text-center rounded-2xl border border-dashed border-border/60 bg-secondary/5">
                                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                <h3 className="text-xl font-semibold mb-2">Achievements & Badges</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    Unlock special badges by completing games and challenges. This feature will be available in the next update.
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="security">
                            <div className="max-w-xl p-6 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-violet-500" />
                                    Security Settings
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-secondary/20 border border-border/40">
                                        <p className="text-sm font-medium">Two-Factor Authentication</p>
                                        <p className="text-xs text-muted-foreground mt-1 mb-3">Add an extra layer of security to your account.</p>
                                        <button className="text-xs font-semibold px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors">
                                            Enable 2FA
                                        </button>
                                    </div>
                                    <div className="p-4 rounded-xl bg-secondary/20 border border-border/40">
                                        <p className="text-sm font-medium">Browser Sessions</p>
                                        <p className="text-xs text-muted-foreground mt-1">Manage your active sessions on other devices.</p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
