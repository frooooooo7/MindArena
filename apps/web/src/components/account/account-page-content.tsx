"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { BackgroundGradients } from "@/components/home";
import { Navbar } from "@/components/navbar";
import { ProfileHeader } from "@/components/account/profile-header";
import { LocalStatsSection } from "@/components/account/local-stats-section";
import { ArenaStatsSection } from "@/components/account/arena-stats-section";
import { GameRecordsSection } from "@/components/account/game-records-section";
import { FriendsSection } from "@/components/account/friends-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Shield,
  BarChart3,
  Trophy,
  Gamepad2,
  Swords,
  Users,
} from "lucide-react";
import { GameMode, type User as ProfileUser } from "@mindarena/shared";
import { toast } from "sonner";
import { useFriends } from "@/hooks/use-friends";
import { useDuel } from "@/hooks/use-duel";

interface AccountPageContentProps {
  user: ProfileUser;
  isOwner: boolean;
}

export function AccountPageContent({ user, isOwner }: AccountPageContentProps) {
  const searchParams = useSearchParams();
  const [gameMode, setGameMode] = useState<GameMode>("local");
  const [isSendingFriendRequest, setIsSendingFriendRequest] = useState(false);
  const { friends, pendingRequests, sendRequest } = useFriends();
  const { isFriendOnline, setPickerOpen, sendInvite } = useDuel();

  const ownerTabs = ["overview", "stats", "social", "achievements", "security"];
  const publicTabs = ["overview", "stats", "achievements"];
  const allowedTabs = isOwner ? ownerTabs : publicTabs;

  const tabFromQuery = searchParams.get("tab");
  const activeTab =
    tabFromQuery && allowedTabs.includes(tabFromQuery)
      ? tabFromQuery
      : "overview";

  const targetProfileName = isOwner ? undefined : user.name;
  const isAlreadyFriend = friends.some(
    (friendship) => friendship.friend?.id === user.id,
  );
  const isFriendRequestSent = pendingRequests.sent.some(
    (request) => request.friend?.id === user.id,
  );
  const hasPendingIncomingRequest = pendingRequests.received.some(
    (request) => request.friend?.id === user.id,
  );

  const handleAddToFriends = async () => {
    if (isAlreadyFriend || isFriendRequestSent || hasPendingIncomingRequest) {
      return;
    }

    try {
      setIsSendingFriendRequest(true);
      const success = await sendRequest(user.id);
      if (!success) {
        toast.error("Failed to send friend request");
        return;
      }
      toast.success(`Friend request sent to ${user.name}`);
    } finally {
      setIsSendingFriendRequest(false);
    }
  };

  const handleChallenge = () => {
    // Open the duel picker modal (from arena) so user can select game type
    setPickerOpen(true);
  };

  const profileIsOnline = isFriendOnline(user.id);

  return (
    <div className="relative min-h-screen bg-background">
      <BackgroundGradients />
      <Navbar />

      <main className="container relative mx-auto px-4 py-8 md:px-8 max-w-6xl">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isOwner ? "Account Settings" : "Player Profile"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isOwner
                  ? "Manage your profile, view your stats and update security settings."
                  : `Viewing ${user.name}'s profile and performance summary.`}
              </p>
            </div>

            <ProfileHeader
              user={user}
              isOwner={isOwner}
              onAddFriend={handleAddToFriends}
              isAddingFriend={isSendingFriendRequest}
              isFriend={isAlreadyFriend}
              isFriendRequestSent={isFriendRequestSent}
              hasPendingIncomingRequest={hasPendingIncomingRequest}
              onChallenge={handleChallenge}
              isFriendOnline={profileIsOnline}
            />
          </div>

          <Tabs key={activeTab} defaultValue={activeTab} className="w-full">
            <TabsList className="bg-secondary/20 p-1 border border-border/40 mb-6">
              <TabsTrigger value="overview" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Statistics</span>
              </TabsTrigger>
              {isOwner && (
                <TabsTrigger value="social" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Social</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="achievements" className="gap-2">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Achievements</span>
              </TabsTrigger>
              {isOwner && (
                <TabsTrigger value="security" className="gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGameMode("local")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    gameMode === "local"
                      ? "bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20"
                      : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                  }`}
                >
                  <Gamepad2 className="h-4 w-4" />
                  Local
                </button>
                <button
                  onClick={() => setGameMode("arena")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    gameMode === "arena"
                      ? "bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                  }`}
                >
                  <Swords className="h-4 w-4" />
                  Arena
                </button>
              </div>

              {gameMode === "local" ? (
                <LocalStatsSection
                  isAuthenticated
                  profileName={targetProfileName}
                />
              ) : (
                <ArenaStatsSection
                  isAuthenticated
                  profileName={targetProfileName}
                />
              )}
            </TabsContent>

            <TabsContent value="stats">
              <GameRecordsSection
                isAuthenticated
                profileName={targetProfileName}
                isOwner={isOwner}
              />
            </TabsContent>

            {isOwner && (
              <TabsContent value="social">
                <FriendsSection isAuthenticated />
              </TabsContent>
            )}

            <TabsContent value="achievements">
              <div className="p-12 text-center rounded-2xl border border-dashed border-border/60 bg-secondary/5">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-semibold mb-2">
                  Achievements & Badges
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Unlock special badges by completing games and challenges. This
                  feature will be available in the next update.
                </p>
              </div>
            </TabsContent>

            {isOwner && (
              <TabsContent value="security">
                <div className="max-w-xl p-6 rounded-2xl border border-border/40 bg-card/60">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-violet-500" />
                    Security Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-secondary/20 border border-border/40">
                      <p className="text-sm font-medium">
                        Two-Factor Authentication
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 mb-3">
                        Add an extra layer of security to your account.
                      </p>
                      <button className="text-xs font-semibold px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors">
                        Enable 2FA
                      </button>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/20 border border-border/40">
                      <p className="text-sm font-medium">Browser Sessions</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Manage your active sessions on other devices.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
